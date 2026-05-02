import { useState } from "react";
import { GameButton } from "./GameButton";

interface TutorialModalProps {
  onClose: () => void;
}

const pages = [
  {
    title: "Slide Until Stop",
    body: "Swipe in one direction. The painter rolls until a wall or empty edge blocks the next tile.",
  },
  {
    title: "Paint Every Floor",
    body: "The start tile is painted for free. Every tile the ball crosses turns purple and stays open.",
  },
  {
    title: "Plan The Route",
    body: "Use hints for the recommended path, restart with R, and beat your best move count.",
  },
];

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [page, setPage] = useState(0);
  const current = pages[page];

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal pop" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
        <button className="modal-close" onClick={onClose} aria-label="Close tutorial">x</button>
        <p className="eyebrow">How to play</p>
        <h2 id="tutorial-title">{current.title}</h2>
        <div className="tutorial-visual" aria-hidden="true">
          <span className="mini-wall" />
          <span className="mini-paint" />
          <span className="mini-ball" />
        </div>
        <p>{current.body}</p>
        <div className="pager" aria-label="Tutorial page">
          {pages.map((item, index) => (
            <span key={item.title} className={index === page ? "is-active" : ""} />
          ))}
        </div>
        <div className="modal-actions">
          <GameButton variant="ghost" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
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
