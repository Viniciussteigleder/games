import { GameButton } from "./GameButton";

interface LevelCompleteModalProps {
  levelId: number;
  moves: number;
  bestMoves?: number;
  hintsUsed: number;
  hasNextLevel: boolean;
  onReplay: () => void;
  onNext: () => void;
  onLevelSelect: () => void;
}

export function LevelCompleteModal({
  levelId,
  moves,
  bestMoves,
  hintsUsed,
  hasNextLevel,
  onReplay,
  onNext,
  onLevelSelect,
}: LevelCompleteModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal complete-modal pop" role="dialog" aria-modal="true" aria-labelledby="complete-title">
        <p className="eyebrow">Level {levelId} cleared</p>
        <h2 id="complete-title">Painted Clean</h2>
        <div className="result-grid">
          <div><span>Moves</span><strong>{moves}</strong></div>
          <div><span>Best</span><strong>{bestMoves ?? moves}</strong></div>
          <div><span>Hints</span><strong>{hintsUsed}</strong></div>
        </div>
        <div className="button-stack">
          <GameButton onClick={onNext} disabled={!hasNextLevel}>
            {hasNextLevel ? "Next Level" : "All Levels Complete"}
          </GameButton>
          <GameButton variant="secondary" onClick={onReplay}>Replay</GameButton>
          <GameButton variant="ghost" onClick={onLevelSelect}>Level Select</GameButton>
        </div>
      </section>
    </div>
  );
}
