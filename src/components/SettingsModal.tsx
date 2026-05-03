import { useState } from "react";
import { GameButton } from "./GameButton";
import { CloseIcon } from "./Icons";

interface SettingsModalProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export function SettingsModal({
  soundEnabled,
  onToggleSound,
  onResetProgress,
  onClose,
}: SettingsModalProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal pop" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <button className="modal-close" onClick={onClose} aria-label="Close settings">
          <CloseIcon size={16} />
        </button>
        <p className="eyebrow">Game options</p>
        <h2 id="settings-title">Settings</h2>

        <label className="toggle-row" htmlFor="sound-toggle">
          <span>
            <strong>Sound</strong>
            <small>Placeholder for future sound effects</small>
          </span>
          <span className="toggle-switch">
            <input
              id="sound-toggle"
              type="checkbox"
              checked={soundEnabled}
              onChange={onToggleSound}
            />
            <span className="toggle-track" />
          </span>
        </label>

        <div className="reset-box">
          <strong>Progress</strong>
          <p>Reset unlocked levels, completions, and best moves on this device.</p>
          {confirmingReset ? (
            <div className="modal-actions">
              <GameButton variant="danger" onClick={onResetProgress}>Confirm Reset</GameButton>
              <GameButton variant="ghost" onClick={() => setConfirmingReset(false)}>Cancel</GameButton>
            </div>
          ) : (
            <GameButton variant="danger" onClick={() => setConfirmingReset(true)}>Reset Progress</GameButton>
          )}
        </div>
      </section>
    </div>
  );
}
