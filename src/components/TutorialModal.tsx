import { useState } from "react";
import { GameButton } from "./GameButton";
import { CloseIcon } from "./Icons";

interface TutorialModalProps {
  onClose: () => void;
}

const pages = [
  {
    title: "Slide Until Stop",
    body: "Swipe in one direction. The painter rolls until a wall or empty edge blocks the path.",
    visual: "slide",
  },
  {
    title: "Paint Every Floor",
    body: "The start tile is painted for free. Every tile the ball crosses turns purple and stays painted.",
    visual: "paint",
  },
  {
    title: "Plan the Route",
    body: "Use hints for the recommended move, restart with R, and beat your best move count.",
    visual: "plan",
  },
];

function TutorialVisual({ type }: { type: string }) {
  return (
    <div className="tutorial-visual" aria-hidden="true">
      {type === "slide" && (
        <>
          <span className="mini-wall" />
          <span className="mini-floor" style={{ background: "var(--floor)", borderRadius: 14, boxShadow: "inset 0 -3px 0 var(--floor-line)" }} />
          <span className="mini-ball" />
        </>
      )}
      {type === "paint" && (
        <>
          <span className="mini-paint" />
          <span className="mini-paint" />
          <span className="mini-floor" style={{ background: "var(--floor)", borderRadius: 14, boxShadow: "inset 0 -3px 0 var(--floor-line)" }} />
        </>
      )}
      {type === "plan" && (
        <>
          <span className="mini-paint" />
          <span className="mini-wall" />
          <span className="mini-paint" />
        </>
      )}
    </div>
  );
}

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [page, setPage] = useState(0);
  const current = pages[page];

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal pop" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
        <button className="modal-close" onClick={onClose} aria-label="Close tutorial">
          <CloseIcon size={16} />
        </button>
        <p className="eyebrow">How to play — {page + 1}/{pages.length}</p>
        <h2 id="tutorial-title">{current.title}</h2>

        <TutorialVisual type={current.visual} />

        <p>{current.body}</p>

        <div className="pager" aria-label="Tutorial page">
          {pages.map((item, index) => (
            <span key={item.title} className={index === page ? "is-active" : ""} />
          ))}
        </div>

        <div className="modal-actions">
          <GameButton
            variant="ghost"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </GameButton>
          {page === pages.length - 1 ? (
            <GameButton onClick={onClose}>Done</GameButton>
          ) : (
            <GameButton onClick={() => setPage(page + 1)}>Next</GameButton>
          )}
        </div>
      </section>
    </div>
  );
}
