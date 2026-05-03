import type { Difficulty, Level, PersistedProgress } from "../game/types";
import { ChevronLeft, LockIcon, StarIcon } from "./Icons";

interface LevelSelectScreenProps {
  levels: Level[];
  progress: PersistedProgress;
  onBack: () => void;
  onSelectLevel: (levelId: number) => void;
}

function diffClass(d: Difficulty): string {
  return d.toLowerCase().replace(" ", "-");
}

function starsEarned(moves: number | undefined, parMoves: number): number {
  if (moves === undefined) return 0;
  if (moves <= parMoves) return 3;
  if (moves <= Math.ceil(parMoves * 1.4)) return 2;
  return 1;
}

function TileStars({ count }: { count: number }) {
  return (
    <div className="tile-stars">
      {[1, 2, 3].map((n) => (
        <StarIcon
          key={n}
          size={12}
          filled={n <= count}
          className={n <= count ? "" : "star-empty"}
        />
      ))}
    </div>
  );
}

export function LevelSelectScreen({
  levels,
  progress,
  onBack,
  onSelectLevel,
}: LevelSelectScreenProps) {
  const completedCount = progress.completedLevelIds.length;

  return (
    <main className="screen">
      <header className="top-bar">
        <button className="round-button" onClick={onBack} aria-label="Back to start">
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="eyebrow">Choose a maze</p>
          <h2>Level Select</h2>
        </div>
      </header>

      <section className="level-progress-panel" aria-label="Campaign progress">
        <div>
          <span className="meta-label">Unlocked</span>
          <strong>{progress.unlockedLevelId}/20</strong>
        </div>
        <div>
          <span className="meta-label">Cleared</span>
          <strong>{completedCount}/20</strong>
        </div>
      </section>

      <section className="level-grid" aria-label="Levels">
        {levels.map((level) => {
          const locked = level.id > progress.unlockedLevelId;
          const completed = progress.completedLevelIds.includes(level.id);
          const current = level.id === progress.unlockedLevelId;
          const bestMoves = progress.bestMovesByLevelId[String(level.id)];
          const stars = starsEarned(bestMoves, level.parMoves);

          return (
            <button
              key={level.id}
              className={`level-tile ${completed ? "is-completed" : ""} ${current ? "is-current" : ""}`}
              disabled={locked}
              onClick={() => onSelectLevel(level.id)}
              aria-label={`Level ${level.id}, ${level.name}, ${locked ? "locked" : completed ? "completed" : "unlocked"}`}
            >
              <span className="level-number">{level.id}</span>
              <span className="level-name">{level.name}</span>
              <div className="level-tile-bottom">
                {locked ? (
                  <span className="diff-badge diff-badge--extra-hard">
                    <LockIcon size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                    Locked
                  </span>
                ) : (
                  <span className={`diff-badge diff-badge--${diffClass(level.difficulty)}`}>
                    {level.difficulty}
                  </span>
                )}
                {completed && <TileStars count={stars} />}
              </div>
            </button>
          );
        })}
      </section>
    </main>
  );
}
