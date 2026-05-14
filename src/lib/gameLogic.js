/**
 * gameLogic.js
 * Pure helper functions for XP, levels, health decay, and rewards.
 * No Supabase calls — fully testable in isolation.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** XP needed to advance each level. Level = floor(xp / XP_PER_LEVEL) + 1 */
export const XP_PER_LEVEL = 100;

/** Health lost per hour without completing a task */
export const HEALTH_DECAY_PER_HOUR = 5;

/** Health gained when a task is completed */
export const HEALTH_BOOST_PER_TASK = 15;

/** Health thresholds for visual state */
export const HEALTH_STATE = {
  CRITICAL: 10,
  LOW: 30,
  GOOD: 70,
};

// ── Level Calculations ─────────────────────────────────────────────────────────

/**
 * Calculate level from total XP.
 * @param {number} xp - Total accumulated XP
 * @returns {number} Current level (min 1)
 */
export function calculateLevel(xp) {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

/**
 * Calculate XP progress within the current level (0–99).
 * @param {number} xp - Total accumulated XP
 * @returns {number} XP within current level
 */
export function calculateLevelProgress(xp) {
  return xp % XP_PER_LEVEL;
}

/**
 * Calculate progress percentage within current level (0–100).
 * @param {number} xp - Total accumulated XP
 * @returns {number} Percentage 0–100
 */
export function calculateLevelPercent(xp) {
  return Math.floor((calculateLevelProgress(xp) / XP_PER_LEVEL) * 100);
}

/**
 * XP required for the next level threshold.
 * @param {number} xp - Total accumulated XP
 * @returns {number} XP needed to reach next level
 */
export function xpToNextLevel(xp) {
  return XP_PER_LEVEL - calculateLevelProgress(xp);
}

// ── Health / Decay Calculations ────────────────────────────────────────────────

/**
 * Calculate the pet's current health based on time elapsed since last feed.
 * Health decays at 5% per hour, clamped to [0, 100].
 *
 * @param {string|Date} lastFed  - ISO timestamp or Date of last feeding
 * @param {number} storedHealth  - Health value stored in DB at lastFed time
 * @returns {number} Current health (0–100), rounded to 2 decimal places
 */
export function calculateCurrentHealth(lastFed, storedHealth) {
  if (!lastFed) return storedHealth || 0;
  
  const lastFedDate = lastFed instanceof Date ? lastFed : new Date(lastFed);
  if (isNaN(lastFedDate.getTime())) return storedHealth || 0;

  const nowMs = Date.now();
  const elapsedHours = (nowMs - lastFedDate.getTime()) / (1000 * 60 * 60);
  const decayed = Math.max(0, elapsedHours * HEALTH_DECAY_PER_HOUR); // ensure no negative decay
  const current = storedHealth - decayed;
  return Math.max(0, Math.min(100, Math.round(current * 100) / 100));
}

/**
 * Get the visual state of the pet based on current health.
 * @param {number} health - Current health (0–100)
 * @returns {'critical'|'low'|'normal'|'healthy'}
 */
export function getPetHealthState(health) {
  if (health <= HEALTH_STATE.CRITICAL) return 'critical';
  if (health <= HEALTH_STATE.LOW) return 'low';
  if (health >= HEALTH_STATE.GOOD) return 'healthy';
  return 'normal';
}

/**
 * Get Tailwind color class for health bar based on health value.
 * @param {number} health - Current health (0–100)
 * @returns {string} Tailwind bg-color class
 */
export function getHealthBarColor(health) {
  if (health <= HEALTH_STATE.CRITICAL) return 'bg-red-500';
  if (health <= HEALTH_STATE.LOW) return 'bg-amber-500';
  if (health >= HEALTH_STATE.GOOD) return 'bg-emerald-500';
  return 'bg-yellow-400';
}

// ── Task Rewards ───────────────────────────────────────────────────────────────

/**
 * Calculate rewards for completing a task.
 * Rewards scale slightly with task XP value for variety.
 *
 * @param {{ xp_reward: number, coin_reward: number }} task
 * @returns {{ xp: number, coins: number, healthBoost: number }}
 */
export function getTaskRewards(task) {
  const xp = task.xp_reward ?? 20;
  const coins = task.coin_reward ?? 5;
  const healthBoost = HEALTH_BOOST_PER_TASK;
  return { xp, coins, healthBoost };
}

// ── Formatting Helpers ─────────────────────────────────────────────────────────

/**
 * Format a number into a compact display string.
 * @param {number} n
 * @returns {string} e.g. 1200 → "1.2k"
 */
export function formatNumber(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
