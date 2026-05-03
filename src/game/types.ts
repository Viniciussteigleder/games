export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Extra Hard";

export interface Position {
  row: number;
  col: number;
}

export interface Level {
  id: number;
  name: string;
  difficulty: Difficulty;
  grid: string[];
  parMoves: number;
  hintLimit: number;
  solution?: Direction[];
}

export interface MoveResult {
  moved: boolean;
  path: Position[];
  endPosition: Position;
}

export interface LevelRuntimeState {
  levelId: number;
  ballPosition: Position;
  paintedKeys: string[];
  moves: number;
  hintsRemaining: number;
  hintsUsed: number;
  activeHintDirection?: Direction;
  isAnimating: boolean;
  isCompleted: boolean;
  statusMessage?: string;
}

export interface PersistedProgress {
  storageVersion: number;
  unlockedLevelId: number;
  completedLevelIds: number[];
  bestMovesByLevelId: Record<string, number>;
  hasSeenTutorial: boolean;
  soundEnabled: boolean;
  achievementIds: string[];
  streakDays: number;
  lastPlayedDate: string;
  lastDailyChallengeDay: number;
}
