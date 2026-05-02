import type { Direction, Level, LevelRuntimeState, MoveResult, Position } from "./types";

export function positionKey(position: Position): string {
  return `${position.row},${position.col}`;
}

export function parsePositionKey(key: string): Position {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}

export function getDirectionDelta(direction: Direction): { rowDelta: number; colDelta: number } {
  switch (direction) {
    case "UP":
      return { rowDelta: -1, colDelta: 0 };
    case "DOWN":
      return { rowDelta: 1, colDelta: 0 };
    case "LEFT":
      return { rowDelta: 0, colDelta: -1 };
    case "RIGHT":
      return { rowDelta: 0, colDelta: 1 };
  }
}

export function parseLevel(level: Level): {
  rows: number;
  cols: number;
  start: Position;
  paintableKeys: Set<string>;
} {
  const rows = level.grid.length;
  const cols = rows > 0 ? level.grid[0].length : 0;
  const paintableKeys = new Set<string>();
  let start: Position | undefined;

  level.grid.forEach((rowText, row) => {
    [...rowText].forEach((cell, col) => {
      if (cell === "." || cell === "S") {
        const position = { row, col };
        paintableKeys.add(positionKey(position));
        if (cell === "S") start = position;
      }
    });
  });

  return {
    rows,
    cols,
    start: start ?? { row: 0, col: 0 },
    paintableKeys,
  };
}

export function getCell(level: Level, position: Position): string | undefined {
  if (position.row < 0 || position.col < 0) return undefined;
  return level.grid[position.row]?.[position.col];
}

export function isBlocked(level: Level, position: Position): boolean {
  const cell = getCell(level, position);
  return cell === undefined || cell === "#" || cell === " ";
}

export function calculateMove(level: Level, start: Position, direction: Direction): MoveResult {
  const { rowDelta, colDelta } = getDirectionDelta(direction);
  const path: Position[] = [];
  let cursor = { ...start };

  while (true) {
    const next = { row: cursor.row + rowDelta, col: cursor.col + colDelta };
    if (isBlocked(level, next)) {
      return {
        moved: path.length > 0,
        path,
        endPosition: cursor,
      };
    }
    path.push(next);
    cursor = next;
  }
}

export function applyMovePaint(paintedKeys: Set<string>, path: Position[]): Set<string> {
  const nextPainted = new Set(paintedKeys);
  path.forEach((position) => nextPainted.add(positionKey(position)));
  return nextPainted;
}

export function isLevelComplete(level: Level, paintedKeys: Set<string>): boolean {
  const { paintableKeys } = parseLevel(level);
  for (const key of paintableKeys) {
    if (!paintedKeys.has(key)) return false;
  }
  return true;
}

export function createInitialRuntimeState(level: Level): LevelRuntimeState {
  const parsed = parseLevel(level);
  return {
    levelId: level.id,
    ballPosition: parsed.start,
    paintedKeys: [positionKey(parsed.start)],
    moves: 0,
    hintsRemaining: level.hintLimit,
    hintsUsed: 0,
    isAnimating: false,
    isCompleted: false,
  };
}

export function getRecommendedDirection(
  level: Level,
  start: Position,
  paintedKeys: Set<string>,
): Direction | undefined {
  const directions: Direction[] = ["UP", "RIGHT", "DOWN", "LEFT"];
  let bestDirection: Direction | undefined;
  let bestScore = 0;

  directions.forEach((direction) => {
    const move = calculateMove(level, start, direction);
    if (!move.moved) return;
    const newPaintedCount = move.path.filter((position) => !paintedKeys.has(positionKey(position))).length;
    const score = newPaintedCount * 100 + move.path.length;
    if (score > bestScore) {
      bestScore = score;
      bestDirection = direction;
    }
  });

  return bestDirection;
}

export function getAvailableDirections(level: Level, start: Position): Direction[] {
  const directions: Direction[] = ["UP", "RIGHT", "DOWN", "LEFT"];
  return directions.filter((direction) => calculateMove(level, start, direction).moved);
}
