import { GameButton } from "./GameButton";
import { StarIcon, TrophyIcon } from "./Icons";

interface LevelCompleteModalProps {
  levelId: number;
  moves: number;
  parMoves: number;
  bestMoves?: number;
  hintsUsed: number;
  hasNextLevel: boolean;
  onReplay: () => void;
  onNext: () => void;
  onLevelSelect: () => void;
}

function starsEarned(moves: number, parMoves: number): number {
  if (moves <= parMoves) return 3;
  if (moves <= Math.ceil(parMoves * 1.4)) return 2;
  return 1;
}

export function LevelCompleteModal({
  levelId,
  moves,
  parMoves,
  bestMoves,
  hintsUsed,
  hasNextLevel,
  onReplay,
  onNext,
  onLevelSelect,
}: LevelCompleteModalProps) {
  const stars = starsEarned(moves, parMoves);
  const isNewBest = bestMoves === undefined || moves < bestMoves;

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal complete-modal pop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-title"
      >
        <p className="eyebrow">Level {levelId} cleared</p>
        <h2 id="complete-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <TrophyIcon size={22} style={{ color: "var(--gold)" }} />
          Painted Clean
        </h2>

        <div className="star-row" aria-label={`${stars} out of 3 stars`}>
          {[1, 2, 3].map((n) => (
            <StarIcon
              key={n}
              size={36}
              filled={n <= stars}
              className={n <= stars ? "star-filled" : "star-empty"}
            />
          ))}
        </div>

        {isNewBest && <p style={{ textAlign: "center", color: "var(--gold)", fontWeight: 700, fontSize: "0.82rem", marginBottom: 2 }}>New best!</p>}

        <div className="result-grid">
          <div><span>Moves</span><strong>{moves}</strong></div>
          <div><span>Best</span><strong>{isNewBest ? moves : (bestMoves ?? moves)}</strong></div>
          <div><span>Hints</span><strong>{hintsUsed}</strong></div>
        </div>

        <div className="button-stack" style={{ marginTop: 16 }}>
          <GameButton onClick={onNext} disabled={!hasNextLevel}>
            {hasNextLevel ? "Next Level" : "All Done!"}
          </GameButton>
          <GameButton variant="secondary" onClick={onReplay}>Replay</GameButton>
          <GameButton variant="ghost" onClick={onLevelSelect}>Level Select</GameButton>
        </div>
      </section>
    </div>
  );
}
