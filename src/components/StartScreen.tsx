import type { Difficulty } from "../game/types";
import { GameButton } from "./GameButton";
import { CalendarIcon, FlameIcon, GridIcon, HelpCircle, PlayIcon, SettingsIcon } from "./Icons";

interface StartScreenProps {
  unlockedLevelId: number;
  difficulty: Difficulty;
  streakDays: number;
  achievementCount: number;
  dailyCompleted: boolean;
  onPlay: () => void;
  onDailyChallenge: () => void;
  onLevelSelect: () => void;
  onHelp: () => void;
  onSettings: () => void;
}

export function StartScreen({
  unlockedLevelId,
  difficulty,
  streakDays,
  achievementCount,
  dailyCompleted,
  onPlay,
  onDailyChallenge,
  onLevelSelect,
  onHelp,
  onSettings,
}: StartScreenProps) {
  return (
    <main className="screen start-screen">
      <section className="brand-block">
        <div className="brand-orbit" aria-hidden="true">
          <div className="logo-mark">
            <span /><span /><span /><span /><span /><span />
          </div>
          <div className="logo-ball" />
        </div>
        <p className="eyebrow">Swipe puzzle</p>
        <h1>Labyrinth Painter</h1>
        <p className="tagline">Roll straight, choose your stops, and paint every last tile.</p>
      </section>

      <section className="progress-card" aria-label="Current progress">
        <div>
          <span className="meta-label">Continue</span>
          <strong>{unlockedLevelId}</strong>
        </div>
        <div>
          <span className="meta-label">Difficulty</span>
          <strong>{difficulty}</strong>
        </div>
        {streakDays > 0 && (
          <div className="streak-badge" aria-label={`${streakDays} day streak`}>
            <FlameIcon size={14} style={{ color: "#f97316" }} />
            <strong>{streakDays}</strong>
          </div>
        )}
        {achievementCount > 0 && (
          <div>
            <span className="meta-label">Achievements</span>
            <strong>{achievementCount}</strong>
          </div>
        )}
      </section>

      <div className="button-stack">
        <GameButton onClick={onPlay} icon={<PlayIcon size={18} />}>
          Play Level {unlockedLevelId}
        </GameButton>
        <GameButton
          variant="secondary"
          onClick={onDailyChallenge}
          icon={<CalendarIcon size={18} />}
          className={dailyCompleted ? "daily-done" : ""}
        >
          {dailyCompleted ? "Daily ✓" : "Daily Challenge"}
        </GameButton>
        <GameButton variant="secondary" onClick={onLevelSelect} icon={<GridIcon size={18} />}>
          All Levels
        </GameButton>
        <div className="split-actions">
          <GameButton variant="ghost" onClick={onHelp} icon={<HelpCircle size={18} />}>
            How to Play
          </GameButton>
          <GameButton variant="ghost" onClick={onSettings} icon={<SettingsIcon size={18} />}>
            Settings
          </GameButton>
        </div>
      </div>
    </main>
  );
}
