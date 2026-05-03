import type { PersistedProgress } from "./types";

export const STORAGE_KEY = "labyrinth-painter-progress-v1";
export const STORAGE_VERSION = 1;

export function getDefaultProgress(): PersistedProgress {
  return {
    storageVersion: STORAGE_VERSION,
    unlockedLevelId: 1,
    completedLevelIds: [],
    bestMovesByLevelId: {},
    hasSeenTutorial: false,
    soundEnabled: true,
    achievementIds: [],
    streakDays: 0,
    lastPlayedDate: "",
    lastDailyChallengeDay: 0,
  };
}

function getStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function sanitizeProgress(value: unknown): PersistedProgress {
  const defaults = getDefaultProgress();
  if (!value || typeof value !== "object") return defaults;
  const raw = value as Partial<PersistedProgress>;

  const unlockedLevelId =
    typeof raw.unlockedLevelId === "number"
      ? Math.min(20, Math.max(1, Math.floor(raw.unlockedLevelId)))
      : defaults.unlockedLevelId;

  const completedLevelIds = Array.isArray(raw.completedLevelIds)
    ? Array.from(
        new Set(
          raw.completedLevelIds.filter(
            (id): id is number => Number.isInteger(id) && id >= 1 && id <= 20,
          ),
        ),
      )
    : defaults.completedLevelIds;

  const bestMovesByLevelId: Record<string, number> = {};
  if (raw.bestMovesByLevelId && typeof raw.bestMovesByLevelId === "object") {
    Object.entries(raw.bestMovesByLevelId).forEach(([id, moves]) => {
      if (/^\d+$/.test(id) && typeof moves === "number" && moves > 0) {
        bestMovesByLevelId[id] = Math.floor(moves);
      }
    });
  }

  const achievementIds = Array.isArray(raw.achievementIds)
    ? raw.achievementIds.filter((id): id is string => typeof id === "string")
    : defaults.achievementIds;

  return {
    storageVersion: STORAGE_VERSION,
    unlockedLevelId,
    completedLevelIds,
    bestMovesByLevelId,
    hasSeenTutorial: Boolean(raw.hasSeenTutorial),
    soundEnabled: typeof raw.soundEnabled === "boolean" ? raw.soundEnabled : defaults.soundEnabled,
    achievementIds,
    streakDays: typeof raw.streakDays === "number" ? raw.streakDays : 0,
    lastPlayedDate: typeof raw.lastPlayedDate === "string" ? raw.lastPlayedDate : "",
    lastDailyChallengeDay: typeof raw.lastDailyChallengeDay === "number" ? raw.lastDailyChallengeDay : 0,
  };
}

export function loadProgress(): PersistedProgress {
  const storage = getStorage();
  if (!storage) return getDefaultProgress();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : getDefaultProgress();
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: PersistedProgress): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(sanitizeProgress(progress)));
  } catch {
    return;
  }
}

export function resetProgress(): PersistedProgress {
  const progress = getDefaultProgress();
  const storage = getStorage();
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    return progress;
  }
  return progress;
}

export function completeLevel(
  progress: PersistedProgress,
  levelId: number,
  moves: number,
): PersistedProgress {
  const completedLevelIds = Array.from(new Set([...progress.completedLevelIds, levelId])).sort(
    (a, b) => a - b,
  );
  const bestMovesByLevelId = { ...progress.bestMovesByLevelId };
  const previousBest = bestMovesByLevelId[String(levelId)];
  if (!previousBest || moves < previousBest) {
    bestMovesByLevelId[String(levelId)] = moves;
  }

  return {
    ...progress,
    completedLevelIds,
    bestMovesByLevelId,
    unlockedLevelId: Math.min(20, Math.max(progress.unlockedLevelId, levelId + 1)),
  };
}
