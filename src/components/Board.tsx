import { useRef, type CSSProperties } from "react";
import { getAvailableDirections, positionKey } from "../game/engine";
import type { Direction, Level, Position } from "../game/types";

interface BoardProps {
  level: Level;
  ballPosition: Position;
  paintedKeys: Set<string>;
  hintDirection?: Direction;
  onSwipe: (direction: Direction) => void;
}

const directionLabel: Record<Direction, string> = {
  UP: "Up",
  DOWN: "Down",
  LEFT: "Left",
  RIGHT: "Right",
};

function getSwipeDirection(deltaX: number, deltaY: number): Direction | undefined {
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 30) return undefined;
  if (Math.abs(deltaX) > Math.abs(deltaY)) return deltaX > 0 ? "RIGHT" : "LEFT";
  return deltaY > 0 ? "DOWN" : "UP";
}

export function Board({ level, ballPosition, paintedKeys, hintDirection, onSwipe }: BoardProps) {
  const pointerStart = useRef<Position | undefined>(undefined);
  const rows = level.grid.length;
  const cols = level.grid[0]?.length ?? 0;
  const availableDirections = getAvailableDirections(level, ballPosition);

  return (
    <div
      className="board-wrap"
      onPointerDown={(event) => {
        pointerStart.current = { row: event.clientY, col: event.clientX };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={(event) => {
        const start = pointerStart.current;
        pointerStart.current = undefined;
        if (!start) return;
        const direction = getSwipeDirection(event.clientX - start.col, event.clientY - start.row);
        if (direction) onSwipe(direction);
      }}
      onPointerCancel={() => {
        pointerStart.current = undefined;
      }}
      aria-label="Swipe on the labyrinth board"
    >
      <div
        className="board"
        style={{
          "--cols": cols,
          "--rows": rows,
          "--ball-row": ballPosition.row,
          "--ball-col": ballPosition.col,
        } as CSSProperties}
      >
        {level.grid.map((row, rowIndex) =>
          [...row].map((cell, colIndex) => {
            const key = positionKey({ row: rowIndex, col: colIndex });
            const isPainted = paintedKeys.has(key);
            const isPath = cell === "." || cell === "S";
            return (
              <div
                key={key}
                className={`cell cell--${!isPath ? "solid" : isPainted ? "paint" : "floor"}`}
                aria-hidden="true"
              />
            );
          }),
        )}
        {availableDirections.map((direction) => (
          <button
            key={direction}
            type="button"
            className={`move-cue move-cue--${direction.toLowerCase()}`}
            onClick={() => onSwipe(direction)}
            aria-label={`Move ${directionLabel[direction]}`}
          >
            {direction === "UP" ? "^" : direction === "DOWN" ? "v" : direction === "LEFT" ? "<" : ">"}
          </button>
        ))}
        {hintDirection ? (
          <div className={`hint-arrow hint-arrow--${hintDirection.toLowerCase()}`}>
            {directionLabel[hintDirection]}
          </div>
        ) : null}
        <div className="ball" aria-hidden="true" />
      </div>
    </div>
  );
}
