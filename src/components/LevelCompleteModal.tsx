import { useEffect, useRef, useState } from "react";
import type { Achievement } from "../game/achievements";
import { Confetti } from "./Confetti";
import { GameButton } from "./GameButton";
import { ShareIcon, StarIcon, TrophyIcon } from "./Icons";

interface LevelCompleteModalProps {
  levelId: number;
  moves: number;
  parMoves: number;
  bestMoves?: number;
  hintsUsed: number;
  hasNextLevel: boolean;
  newAchievements?: Achievement[];
  levelName?: string;
  onReplay: () => void;
  onNext: () => void;
  onLevelSelect: () => void;
}

function starsEarned(moves: number, parMoves: number): number {
  if (moves <= parMoves) return 3;
  if (moves <= Math.ceil(parMoves * 1.4)) return 2;
  return 1;
}

const AUTO_ADVANCE_SECS = 3;

export function LevelCompleteModal({
  levelId,
  moves,
  parMoves,
  bestMoves,
  hintsUsed,
  hasNextLevel,
  newAchievements = [],
  levelName,
  onReplay,
  onNext,
  onLevelSelect,
}: LevelCompleteModalProps) {
  const stars = starsEarned(moves, parMoves);
  const isNewBest = bestMoves === undefined || moves < bestMoves;
  const [countdown, setCountdown] = useState(hasNextLevel ? AUTO_ADVANCE_SECS : 0);
  const [shared, setShared] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hasNextLevel) return;
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          onNext();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current!);
  }, [hasNextLevel, onNext]);

  function cancelAutoAdvance() {
    clearInterval(countdownRef.current!);
    setCountdown(0);
  }

  async function handleShare() {
    const starStr = "⭐".repeat(stars);
    const text = `🎨 Labyrinth Painter — Level ${levelId}${levelName ? ` "${levelName}"` : ""}\n${starStr} · ${moves} moves (par ${parMoves})\nhttps://games-redesign.vercel.app`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // user cancelled or API unavailable
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <Confetti active />

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

        {isNewBest && (
          <p style={{ textAlign: "center", color: "var(--gold)", fontWeight: 700, fontSize: "0.82rem", marginBottom: 2 }}>
            New best!
          </p>
        )}

        <div className="result-grid">
          <div><span>Moves</span><strong>{moves}</strong></div>
          <div><span>Best</span><strong>{isNewBest ? moves : (bestMoves ?? moves)}</strong></div>
          <div><span>Hints</span><strong>{hintsUsed}</strong></div>
        </div>

        {newAchievements.length > 0 && (
          <div className="achievement-reveal">
            {newAchievements.map((a) => (
              <div key={a.id} className="achievement-chip">
                <span>{a.emoji}</span>
                <span>{a.title}</span>
              </div>
            ))}
          </div>
        )}

        <div className="button-stack" style={{ marginTop: 16 }}>
          <GameButton
            onClick={() => { cancelAutoAdvance(); onNext(); }}
            disabled={!hasNextLevel}
          >
            {hasNextLevel
              ? countdown > 0
                ? `Next Level (${countdown})`
                : "Next Level"
              : "All Done!"}
          </GameButton>

          <div style={{ display: "flex", gap: 8 }}>
            <GameButton variant="secondary" onClick={() => { cancelAutoAdvance(); onReplay(); }}>
              Replay
            </GameButton>
            <GameButton
              variant="ghost"
              onClick={handleShare}
              icon={<ShareIcon size={15} />}
            >
              {shared ? "Copied!" : "Share"}
            </GameButton>
          </div>

          <GameButton variant="ghost" onClick={() => { cancelAutoAdvance(); onLevelSelect(); }}>
            Level Select
          </GameButton>
        </div>
      </section>
    </div>
  );
}
