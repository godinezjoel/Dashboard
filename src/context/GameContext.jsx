import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { calculateLevel, calculateCurrentHealth } from '../lib/gameLogic';

// ── State Shape ────────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  profile: null,
  activePet: null,      // { ...user_pets row, pet: { ...pets row } }
  tasks: [],
  ownedPets: [],
  allPets: [],
  loading: true,
  error: null,
};

// ── Reducer ────────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_PROFILE':
      return { ...state, profile: action.payload };

    case 'SET_PET':
      return { ...state, activePet: action.payload };

    case 'SET_TASKS':
      return { ...state, tasks: action.payload };

    case 'SET_OWNED_PETS':
      return { ...state, ownedPets: action.payload };

    case 'SET_ALL_PETS':
      return { ...state, allPets: action.payload };

    case 'TASK_COMPLETED': {
      const { taskId, xp, coins, healthBoost } = action.payload;
      const updatedTasks = state.tasks.map((t) =>
        t.id === taskId ? { ...t, is_done: true } : t
      );
      const newXP = (state.profile?.xp ?? 0) + xp;
      const newCoins = (state.profile?.coins ?? 0) + coins;
      const newLevel = calculateLevel(newXP);
      const newHealth = state.activePet
        ? Math.min(100, (state.activePet.health ?? 0) + healthBoost)
        : null;
      return {
        ...state,
        tasks: updatedTasks,
        profile: state.profile
          ? { ...state.profile, xp: newXP, coins: newCoins, level: newLevel }
          : state.profile,
        activePet: state.activePet
          ? { ...state.activePet, health: newHealth }
          : state.activePet,
      };
    }

    case 'TASK_ADDED':
      return { ...state, tasks: [action.payload, ...state.tasks] };

    case 'TASK_DELETED':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };

    case 'PET_PURCHASED': {
      return {
        ...state,
        ownedPets: [...state.ownedPets, action.payload],
        profile: state.profile
          ? { ...state.profile, coins: state.profile.coins - action.payload.pet.price_coins }
          : state.profile,
      };
    }

    case 'PET_ACTIVATED': {
      const updatedOwned = state.ownedPets.map((p) => ({
        ...p,
        is_active: p.id === action.payload.id,
      }));
      return {
        ...state,
        ownedPets: updatedOwned,
        activePet: action.payload,
      };
    }

    case 'SET_THEME':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, active_theme: action.payload } : state.profile,
      };

    case 'UPDATE_PET_HEALTH':
      return {
        ...state,
        activePet: state.activePet
          ? { ...state.activePet, health: action.payload }
          : state.activePet,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Bootstrap: Auth listener ───────────────────────────────────────────────
  useEffect(() => {
    let subscription;

    async function bootstrap() {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data: { session } } = await supabase.auth.getSession();
      dispatch({ type: 'SET_USER', payload: session?.user ?? null });

      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      const { data } = supabase.auth.onAuthStateChange(async (event, sess) => {
        dispatch({ type: 'SET_USER', payload: sess?.user ?? null });
        if (sess?.user) {
          await loadUserData(sess.user.id);
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      });
      subscription = data.subscription;
    }

    bootstrap();
    return () => subscription?.unsubscribe();
  }, []);

  // ── Health decay ticker (every 60s) ───────────────────────────────────────
  useEffect(() => {
    if (!state.activePet) return;
    const tick = setInterval(() => {
      const current = calculateCurrentHealth(
        state.activePet.last_fed,
        state.activePet.health
      );
      dispatch({ type: 'UPDATE_PET_HEALTH', payload: current });
    }, 60_000);
    return () => clearInterval(tick);
  }, [state.activePet]);

  // ── Data Loaders ───────────────────────────────────────────────────────────
  async function loadUserData(userId) {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [profileRes, tasksRes, userPetsRes, allPetsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_pets')
          .select('*, pet:pet_id(*)')
          .eq('user_id', userId),
        supabase.from('pets').select('*').order('price_coins'),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (userPetsRes.error) throw userPetsRes.error;
      if (allPetsRes.error) throw allPetsRes.error;

      dispatch({ type: 'SET_PROFILE', payload: profileRes.data });
      dispatch({ type: 'SET_TASKS', payload: tasksRes.data ?? [] });
      dispatch({ type: 'SET_ALL_PETS', payload: allPetsRes.data ?? [] });
      dispatch({ type: 'SET_OWNED_PETS', payload: userPetsRes.data ?? [] });

      // Compute active pet with live health
      const activePetRow = userPetsRes.data?.find((p) => p.is_active);
      if (activePetRow) {
        const liveHealth = calculateCurrentHealth(activePetRow.last_fed, activePetRow.health);
        dispatch({ type: 'SET_PET', payload: { ...activePetRow, health: liveHealth } });
      }
    } catch (err) {
      console.error('[GameContext] loadUserData error:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  const completeTask = useCallback(async (task) => {
    if (!state.user || task.is_done) return;
    const { xp, coins, healthBoost } = {
      xp: task.xp_reward ?? 20,
      coins: task.coin_reward ?? 5,
      healthBoost: 15,
    };

    // Optimistic update immediately
    dispatch({ type: 'TASK_COMPLETED', payload: { taskId: task.id, xp, coins, healthBoost } });

    // Persist via DB function (atomic)
    const { error } = await supabase.rpc('award_task_completion', {
      p_user_id: state.user.id,
      p_task_id: task.id,
      p_xp: xp,
      p_coins: coins,
      p_health_boost: healthBoost,
    });

    if (error) {
      console.error('[GameContext] completeTask RPC error:', error);
      // Rollback on error – reload fresh data
      await loadUserData(state.user.id);
    }
  }, [state.user, state.profile, state.activePet]);

  const addTask = useCallback(async (title, xpReward = 20, coinReward = 5) => {
    if (!state.user) return;
    const newTask = {
      user_id: state.user.id,
      title: title.trim(),
      xp_reward: xpReward,
      coin_reward: coinReward,
    };
    const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
    if (error) throw error;
    dispatch({ type: 'TASK_ADDED', payload: data });
    return data;
  }, [state.user]);

  const deleteTask = useCallback(async (taskId) => {
    if (!state.user) return;
    dispatch({ type: 'TASK_DELETED', payload: taskId });
    await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', state.user.id);
  }, [state.user]);

  const buyPet = useCallback(async (pet) => {
    if (!state.user || !state.profile) return;
    if (state.profile.coins < pet.price_coins) throw new Error('Not enough coins!');

    // Deduct coins
    await supabase
      .from('profiles')
      .update({ coins: state.profile.coins - pet.price_coins })
      .eq('id', state.user.id);

    // Create user_pets entry
    const { data, error } = await supabase
      .from('user_pets')
      .insert({ user_id: state.user.id, pet_id: pet.id, is_active: false, health: 100 })
      .select('*, pet:pet_id(*)')
      .single();

    if (error) throw error;
    dispatch({ type: 'PET_PURCHASED', payload: data });
    return data;
  }, [state.user, state.profile]);

  const activatePet = useCallback(async (userPetId) => {
    if (!state.user) return;

    // Deactivate all pets
    await supabase
      .from('user_pets')
      .update({ is_active: false })
      .eq('user_id', state.user.id);

    // Activate chosen pet
    const { data, error } = await supabase
      .from('user_pets')
      .update({ is_active: true, last_fed: new Date().toISOString() })
      .eq('id', userPetId)
      .eq('user_id', state.user.id)
      .select('*, pet:pet_id(*)')
      .single();

    if (error) throw error;
    dispatch({ type: 'PET_ACTIVATED', payload: { ...data, health: data.health } });
  }, [state.user]);

  const setTheme = useCallback(async (theme) => {
    if (!state.user) return;
    dispatch({ type: 'SET_THEME', payload: theme });
    await supabase.from('profiles').update({ active_theme: theme }).eq('id', state.user.id);
  }, [state.user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = {
    ...state,
    completeTask,
    addTask,
    deleteTask,
    buyPet,
    activatePet,
    setTheme,
    signOut,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
