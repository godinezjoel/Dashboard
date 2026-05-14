-- ============================================================
-- Life-OS Dashboard — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES
--    Auto-created on signup via trigger. Stores game state.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT        NOT NULL DEFAULT '',
  xp            INTEGER     NOT NULL DEFAULT 0 CHECK (xp >= 0),
  coins         INTEGER     NOT NULL DEFAULT 0 CHECK (coins >= 0),
  level         INTEGER     NOT NULL DEFAULT 1 CHECK (level >= 1),
  active_theme  TEXT        NOT NULL DEFAULT 'default'
                            CHECK (active_theme IN ('default', 'cyberpunk', 'forest')),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: owner can select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner can update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  is_done       BOOLEAN     NOT NULL DEFAULT FALSE,
  xp_reward     INTEGER     NOT NULL DEFAULT 20 CHECK (xp_reward >= 0),
  coin_reward   INTEGER     NOT NULL DEFAULT 5  CHECK (coin_reward >= 0),
  category      TEXT        NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'work', 'private', 'health')),
  priority      TEXT        NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date      TIMESTAMPTZ,
  notes         TEXT,
  status        TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done')),
  recurrence    TEXT        NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')),
  subtasks      JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks: owner can select"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "tasks: owner can insert"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks: owner can update"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks: owner can delete"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. PETS (Public read-only catalogue)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  sprite_emoji  TEXT        NOT NULL,
  description   TEXT        NOT NULL DEFAULT '',
  price_coins   INTEGER     NOT NULL DEFAULT 0 CHECK (price_coins >= 0),
  is_default    BOOLEAN     NOT NULL DEFAULT FALSE
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Everyone can read the catalogue
CREATE POLICY "pets: public read"
  ON public.pets FOR SELECT
  USING (TRUE);

-- Seed the default pet catalogue
INSERT INTO public.pets (name, sprite_emoji, description, price_coins, is_default)
VALUES
  ('Eggling',  '🥚', 'A mysterious egg. What could be inside?',  0,   TRUE),
  ('Pup',      '🐶', 'A loyal pup that wags its tail for tasks.', 150, FALSE),
  ('Fox',      '🦊', 'A clever fox that earns bonus XP.',         300, FALSE),
  ('Dragon',   '🐲', 'A legendary dragon for the dedicated.',     750, FALSE),
  ('Bunny',    '🐰', 'Quick and cute. Perfect for busy days.',    200, FALSE),
  ('Ghost',    '👻', 'Floats silently. Spooky productivity.',     400, FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. USER_PETS (owned pets per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_pets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_id        UUID        NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  is_active     BOOLEAN     NOT NULL DEFAULT FALSE,
  health        NUMERIC(5,2) NOT NULL DEFAULT 100.00
                             CHECK (health >= 0 AND health <= 100),
  last_fed      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  purchased_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pet_id)
);

ALTER TABLE public.user_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_pets: owner can select"
  ON public.user_pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_pets: owner can insert"
  ON public.user_pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_pets: owner can update"
  ON public.user_pets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. TRIGGER: Auto-create profile + default pet on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_default_pet_id UUID;
BEGIN
  -- Create the profile row
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );

  -- Find the default pet (Eggling)
  SELECT id INTO v_default_pet_id FROM public.pets WHERE is_default = TRUE LIMIT 1;

  -- Gift the default pet, mark it active
  IF v_default_pet_id IS NOT NULL THEN
    INSERT INTO public.user_pets (user_id, pet_id, is_active, health, last_fed)
    VALUES (NEW.id, v_default_pet_id, TRUE, 100.00, NOW());
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 6. FUNCTION: safely award XP + coins (atomic update)
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_task_completion(
  p_user_id   UUID,
  p_task_id   UUID,
  p_xp        INTEGER,
  p_coins     INTEGER,
  p_health_boost NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Mark task complete
  UPDATE public.tasks
  SET is_done = TRUE, completed_at = NOW()
  WHERE id = p_task_id AND user_id = p_user_id AND is_done = FALSE;

  -- Update profile XP, coins, and recalculate level
  UPDATE public.profiles
  SET
    xp     = xp + p_xp,
    coins  = coins + p_coins,
    level  = FLOOR((xp + p_xp) / 100.0) + 1,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Boost active pet health (capped at 100)
  UPDATE public.user_pets
  SET
    health   = LEAST(100.0, health + p_health_boost),
    last_fed = NOW()
  WHERE user_id = p_user_id AND is_active = TRUE;
END;
$$;
