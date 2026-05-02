import type { Difficulty, Direction, Level } from "./types";

const difficulties: Difficulty[] = ["Easy", "Medium", "Hard", "Extra Hard"];
const directions: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];
const allowedCells = new Set(["#", ".", "S", " "]);

export function validateLevel(level: Level): string[] {
  const issues: string[] = [];

  if (!Number.isInteger(level.id) || level.id <= 0) issues.push("id must be a positive integer");
  if (!level.name.trim()) issues.push("name is required");
  if (!difficulties.includes(level.difficulty)) issues.push("difficulty is invalid");
  if (!Array.isArray(level.grid) || level.grid.length === 0) issues.push("grid is required");

  const width = level.grid[0]?.length ?? 0;
  let starts = 0;
  let paintable = 0;
  level.grid.forEach((row, rowIndex) => {
    if (row.length !== width) issues.push(`row ${rowIndex} is not rectangular`);
    [...row].forEach((cell, colIndex) => {
      if (!allowedCells.has(cell)) issues.push(`invalid cell "${cell}" at ${rowIndex},${colIndex}`);
      if (cell === "S") starts += 1;
      if (cell === "S" || cell === ".") paintable += 1;
    });
  });

  if (starts !== 1) issues.push("grid must contain exactly one S");
  if (paintable < 5) issues.push("grid must contain at least 5 paintable cells");
  if (level.parMoves <= 0) issues.push("parMoves must be greater than 0");
  if (level.hintLimit < 0) issues.push("hintLimit must be 0 or greater");
  if (level.solution?.some((direction) => !directions.includes(direction))) {
    issues.push("solution contains invalid directions");
  }

  return issues;
}

export function validateLevels(levels: Level[]): Record<number, string[]> {
  const byId: Record<number, string[]> = {};
  const seen = new Set<number>();

  levels.forEach((level) => {
    const issues = validateLevel(level);
    if (seen.has(level.id)) issues.push(`duplicate level id ${level.id}`);
    seen.add(level.id);
    byId[level.id] = issues;
  });

  if (levels.length !== 20) {
    byId[0] = [...(byId[0] ?? []), "expected exactly 20 levels"];
  }

  for (let id = 1; id <= 20; id += 1) {
    if (!seen.has(id)) {
      byId[id] = [...(byId[id] ?? []), `missing sequential level id ${id}`];
    }
  }

  return byId;
}
