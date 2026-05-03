import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyMovePaint,
  calculateMove,
  createInitialRuntimeState,
  getRecommendedDirection,
  isLevelComplete,
  parseLevel,
} from "../game/engine";
import type { Direction, Level, LevelRuntimeState } from "../game/types";
import { Board } from "./Board";
import { GameButton } from "./GameButton";
import { ChevronLeft, DotsIcon, LightbulbIcon, RefreshIcon, UndoIcon } from "./Icons";
import { StatusToast } from "./StatusToast";

interface GameScreenProps {
  level: Level;
  bestMoves?: number;
  invalidIssues?: string[];
  resetSignal: number;
  modalOpen: boolean;
  onBack: () => void;
  onOpenSettings: () => void;
  onLevelComplete: (runtime: LevelRuntimeState) => void;
}

const directionText: Record<Direction, string> = {
  UP: "Up",
  DOWN: "Down",
  LEFT: "Left",
  RIGHT: "Right",
};

const keyMap: Record<string, Direction> = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
  w: "UP", W: "UP",
  a: "LEFT", A: "LEFT",
  s: "DOWN", S: "DOWN",
  d: "RIGHT", D: "RIGHT",
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

interface RuntimeSnapshot {
  ballPosition: LevelRuntimeState["ballPosition"];
  paintedKeys: string[];
  moves: number;
  hintsRemaining: number;
  hintsUsed: number;
}

export function GameScreen({
  level,
  bestMoves,
  invalidIssues = [],
  resetSignal,
  modalOpen,
  onBack,
  onOpenSettings,
  onLevelComplete,
}: GameScreenProps) {
  const [runtime, setRuntime] = useState(() => createInitialRuntimeState(level));
  const [history, setHistory] = useState<RuntimeSnapshot[]>([]);
  const paintedSet = useMemo(() => new Set(runtime.paintedKeys), [runtime.paintedKeys]);
  const paintableCount = useMemo(() => parseLevel(level).paintableKeys.size, [level]);
  const paintedCount = runtime.paintedKeys.length;
  const completionPercent = Math.round((paintedCount / paintableCount) * 100);

  const restart = useCallback(() => {
    setRuntime(createInitialRuntimeState(level));
    setHistory([]);
  }, [level]);

  useEffect(() => { restart(); }, [restart, resetSignal]);

  useEffect(() => {
    if (!runtime.statusMessage) return;
    const timer = window.setTimeout(() => {
      setRuntime((current) => ({ ...current, statusMessage: undefined }));
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [runtime.statusMessage]);

  const showStatus = useCallback((message: string) => {
    setRuntime((current) => ({ ...current, statusMessage: message }));
  }, []);

  const handleMove = useCallback(
    async (direction: Direction) => {
      if (modalOpen || runtime.isAnimating || runtime.isCompleted || invalidIssues.length > 0) return;

      const result = calculateMove(level, runtime.ballPosition, direction);
      if (!result.moved) {
        showStatus("Blocked");
        return;
      }

      const startingPainted = new Set(runtime.paintedKeys);
      setHistory((current) => [
        ...current,
        {
          ballPosition: runtime.ballPosition,
          paintedKeys: runtime.paintedKeys,
          moves: runtime.moves,
          hintsRemaining: runtime.hintsRemaining,
          hintsUsed: runtime.hintsUsed,
        },
      ]);
      setRuntime((current) => ({
        ...current,
        isAnimating: true,
        activeHintDirection: undefined,
        statusMessage: undefined,
      }));

      let stepPainted = startingPainted;
      for (const position of result.path) {
        stepPainted = applyMovePaint(stepPainted, [position]);
        setRuntime((current) => ({
          ...current,
          ballPosition: position,
          paintedKeys: Array.from(stepPainted),
        }));
        await wait(82);
      }

      const finalPainted = applyMovePaint(startingPainted, result.path);
      const nextMoves = runtime.moves + 1;
      const completed = isLevelComplete(level, finalPainted);
      const nextRuntime: LevelRuntimeState = {
        ...runtime,
        ballPosition: result.endPosition,
        paintedKeys: Array.from(finalPainted),
        moves: nextMoves,
        activeHintDirection: undefined,
        isAnimating: false,
        isCompleted: completed,
      };

      setRuntime(nextRuntime);
      if (completed) {
        window.setTimeout(() => onLevelComplete(nextRuntime), 240);
      }
    },
    [invalidIssues.length, level, modalOpen, onLevelComplete, runtime, showStatus],
  );

  const handleHint = useCallback(() => {
    if (runtime.isAnimating || runtime.isCompleted || invalidIssues.length > 0) return;
    if (runtime.hintsRemaining <= 0) {
      showStatus("No hints left");
      return;
    }
    const direction = getRecommendedDirection(level, runtime.ballPosition, new Set(runtime.paintedKeys));
    if (!direction) {
      showStatus("No useful hint");
      return;
    }
    setRuntime((current) => ({
      ...current,
      hintsRemaining: current.hintsRemaining - 1,
      hintsUsed: current.hintsUsed + 1,
      activeHintDirection: direction,
      statusMessage: `Hint: ${directionText[direction]}`,
    }));
  }, [invalidIssues.length, level, runtime, showStatus]);

  const undo = useCallback(() => {
    if (runtime.isAnimating || runtime.isCompleted || history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((current) => current.slice(0, -1));
    setRuntime((current) => ({
      ...current,
      ballPosition: previous.ballPosition,
      paintedKeys: previous.paintedKeys,
      moves: previous.moves,
      hintsRemaining: previous.hintsRemaining,
      hintsUsed: previous.hintsUsed,
      activeHintDirection: undefined,
      isCompleted: false,
      statusMessage: "Undone",
    }));
  }, [history, runtime.isAnimating, runtime.isCompleted]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (modalOpen) return;
      const direction = keyMap[event.key];
      if (direction) {
        event.preventDefault();
        void handleMove(direction);
        return;
      }
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        if (!runtime.isAnimating) restart();
        return;
      }
      if (event.key === "u" || event.key === "U" || event.key === "Backspace") {
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleMove, modalOpen, restart, runtime.isAnimating, undo]);

  if (invalidIssues.length > 0) {
    return (
      <main className="screen game-screen">
        <header className="game-header">
          <button className="round-button" onClick={onBack} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
          <h2>Level unavailable</h2>
          <span />
        </header>
        <section className="error-card">
          <strong>This maze needs repair.</strong>
          <p>The level data did not pass validation.</p>
          <ul>
            {invalidIssues.map((issue) => <li key={issue}>{issue}</li>)}
          </ul>
        </section>
      </main>
    );
  }

  return (
    <main className="screen game-screen">
      <header className="game-header">
        <button
          className="round-button"
          onClick={onBack}
          disabled={runtime.isAnimating}
          aria-label="Back to start"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="level-title">
          <p className="eyebrow">Level {level.id} · {level.difficulty}</p>
          <h2>{level.name}</h2>
        </div>
        <button className="round-button" onClick={onOpenSettings} aria-label="Open settings">
          <DotsIcon size={18} />
        </button>
      </header>

      <section className="stats-row" aria-label="Level stats">
        <div><span>Moves</span><strong>{runtime.moves}</strong></div>
        <div><span>Best</span><strong>{bestMoves ?? "--"}</strong></div>
        <div><span>Par</span><strong>{level.parMoves}</strong></div>
      </section>

      <section className="paint-meter" aria-label={`Painted ${completionPercent} percent`}>
        <div className="meter-copy">
          <span>{paintedCount}/{paintableCount} tiles</span>
          <strong>{completionPercent}%</strong>
        </div>
        <div className="meter-track">
          <span style={{ width: `${completionPercent}%` }} />
        </div>
      </section>

      <Board
        level={level}
        ballPosition={runtime.ballPosition}
        paintedKeys={paintedSet}
        hintDirection={runtime.activeHintDirection}
        onSwipe={(direction) => void handleMove(direction)}
      />

      <StatusToast message={runtime.statusMessage} />

      <section className="game-actions">
        <GameButton
          variant="secondary"
          onClick={undo}
          disabled={runtime.isAnimating || history.length === 0}
          icon={<UndoIcon size={16} />}
        >
          Undo
        </GameButton>
        <GameButton
          variant="ghost"
          onClick={restart}
          disabled={runtime.isAnimating}
          icon={<RefreshIcon size={16} />}
        >
          Reset
        </GameButton>
        <GameButton
          variant="hint"
          onClick={handleHint}
          disabled={runtime.isAnimating || runtime.hintsRemaining <= 0}
          icon={<LightbulbIcon size={16} />}
        >
          Hint {runtime.hintsRemaining}
        </GameButton>
      </section>
    </main>
  );
}
