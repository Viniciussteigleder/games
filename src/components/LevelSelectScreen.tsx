import type { Level, PersistedProgress } from "../game/types";

interface LevelSelectScreenProps {
  levels: Level[];
  progress: PersistedProgress;
  onBack: () => void;
  onSelectLevel: (levelId: number) => void;
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
        <button className="round-button" onClick={onBack} aria-label="Back to start">{"<"}</button>
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
              <span className="level-state">
                {locked ? "Locked" : completed ? "Cleared" : current ? "Next up" : level.difficulty}
              </span>
            </button>
          );
        })}
      </section>
    </main>
  );
}
