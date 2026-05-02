import { useState } from "react";
import { GameButton } from "./GameButton";

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
        <button className="modal-close" onClick={onClose} aria-label="Close settings">x</button>
        <p className="eyebrow">Game options</p>
        <h2 id="settings-title">Settings</h2>

        <label className="toggle-row">
          <span>
            <strong>Sound</strong>
            <small>Placeholder toggle for future effects</small>
          </span>
          <input type="checkbox" checked={soundEnabled} onChange={onToggleSound} />
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
