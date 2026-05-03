export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_paint",   title: "First Stroke",    description: "Complete your first level",            emoji: "🎨" },
  { id: "efficient",     title: "Efficient",        description: "Finish a level at or under par",       emoji: "⚡" },
  { id: "purist",        title: "No Hints",         description: "Complete a level without any hints",   emoji: "🧠" },
  { id: "speed_10",      title: "Quick Streak",     description: "Complete 10 levels in one session",    emoji: "🔥" },
  { id: "perfectionist", title: "Perfectionist",    description: "Earn 3 stars on any level",            emoji: "⭐" },
  { id: "hard_clear",    title: "Hard Mode",        description: "Clear a Hard or Extra Hard level",     emoji: "💪" },
  { id: "daily_hero",    title: "Daily Hero",       description: "Complete a Daily Challenge",           emoji: "📅" },
  { id: "streak_3",      title: "On a Roll",        description: "Play 3 days in a row",                emoji: "🗓️" },
];

const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENT_MAP.get(id);
}

interface AchievementCheckParams {
  levelId: number;
  moves: number;
  parMoves: number;
  hintsUsed: number;
  difficulty: string;
  isDaily: boolean;
  sessionCompletions: number;
  streakDays: number;
  existingIds: string[];
}

export function checkAchievements(params: AchievementCheckParams): string[] {
  const {
    levelId, moves, parMoves, hintsUsed, difficulty,
    isDaily, sessionCompletions, streakDays, existingIds,
  } = params;
  const existing = new Set(existingIds);
  const newIds: string[] = [];

  function earn(id: string) {
    if (!existing.has(id)) newIds.push(id);
  }

  if (levelId >= 1) earn("first_paint");
  if (moves <= parMoves) earn("efficient");
  if (hintsUsed === 0) earn("purist");
  if (sessionCompletions >= 10) earn("speed_10");
  if (moves <= parMoves) earn("perfectionist");
  if (difficulty === "Hard" || difficulty === "Extra Hard") earn("hard_clear");
  if (isDaily) earn("daily_hero");
  if (streakDays >= 3) earn("streak_3");

  return newIds;
}
