// Client-Side AI Rate & Quota Tracker
// Tracks AI questions and token usage per browser to preserve API bandwidth

export const DAILY_AI_LIMIT = 25; // 25 AI questions per browser per day

interface QuotaState {
  date: string; // YYYY-MM-DD
  used: number;
}

const STORAGE_KEY = 'quzzy_ai_quota_tracker';

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getHoursUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
}

export function getDailyQuota(): {
  used: number;
  max: number;
  remaining: number;
  percentage: number;
  hoursUntilReset: number;
  isLimitReached: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      used: 0,
      max: DAILY_AI_LIMIT,
      remaining: DAILY_AI_LIMIT,
      percentage: 0,
      hoursUntilReset: 24,
      isLimitReached: false
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = getTodayString();
    let state: QuotaState = { date: today, used: 0 };

    if (raw) {
      const parsed: QuotaState = JSON.parse(raw);
      if (parsed.date === today) {
        state = parsed;
      } else {
        // New day -> automatically reset
        state = { date: today, used: 0 };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    const used = Math.min(state.used, DAILY_AI_LIMIT);
    const remaining = Math.max(0, DAILY_AI_LIMIT - used);
    const percentage = Math.min(100, Math.round((used / DAILY_AI_LIMIT) * 100));

    return {
      used,
      max: DAILY_AI_LIMIT,
      remaining,
      percentage,
      hoursUntilReset: getHoursUntilMidnight(),
      isLimitReached: remaining <= 0
    };
  } catch (err) {
    return {
      used: 0,
      max: DAILY_AI_LIMIT,
      remaining: DAILY_AI_LIMIT,
      percentage: 0,
      hoursUntilReset: 24,
      isLimitReached: false
    };
  }
}

export function incrementDailyQuota(amount: number = 1): {
  used: number;
  max: number;
  remaining: number;
  isLimitReached: boolean;
} {
  if (typeof window === 'undefined') {
    return { used: 0, max: DAILY_AI_LIMIT, remaining: DAILY_AI_LIMIT, isLimitReached: false };
  }

  try {
    const today = getTodayString();
    const raw = localStorage.getItem(STORAGE_KEY);
    let state: QuotaState = { date: today, used: 0 };

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        state = parsed;
      }
    }

    state.used += amount;
    state.date = today;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const remaining = Math.max(0, DAILY_AI_LIMIT - state.used);
    return {
      used: state.used,
      max: DAILY_AI_LIMIT,
      remaining,
      isLimitReached: remaining <= 0
    };
  } catch (err) {
    return { used: 0, max: DAILY_AI_LIMIT, remaining: DAILY_AI_LIMIT, isLimitReached: false };
  }
}

export function canUseAi(): boolean {
  const { isLimitReached } = getDailyQuota();
  return !isLimitReached;
}
