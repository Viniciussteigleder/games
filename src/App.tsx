import { useEffect, useMemo, useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { LevelCompleteModal } from "./components/LevelCompleteModal";
import { LevelSelectScreen } from "./components/LevelSelectScreen";
import { SettingsModal } from "./components/SettingsModal";
import { StartScreen } from "./components/StartScreen";
import { TutorialModal } from "./components/TutorialModal";
import { levels } from "./game/levels";
import { validateLevels } from "./game/levelValidation";
import {
  completeLevel,
  loadProgress,
  resetProgress,
  saveProgress,
} from "./game/storage";
import type { LevelRuntimeState, PersistedProgress } from "./game/types";

type AppScreen = "START" | "LEVEL_SELECT" | "GAME";
type ModalState = "NONE" | "TUTORIAL" | "LEVEL_COMPLETE" | "SETTINGS";

function App() {
  const [screen, setScreen] = useState<AppScreen>("START");
  const [modal, setModal] = useState<ModalState>("NONE");
  const [progress, setProgress] = useState<PersistedProgress>(() => loadProgress());
  const [currentLevelId, setCurrentLevelId] = useState(progress.unlockedLevelId);
  const [completedRuntime, setCompletedRuntime] = useState<LevelRuntimeState | undefined>();
  const [resetSignal, setResetSignal] = useState(0);

  const validation = useMemo(() => validateLevels(levels), []);
  const currentLevel = levels.find((level) => level.id === currentLevelId) ?? levels[0];
  const highestUnlockedLevel = levels.find((level) => level.id === progress.unlockedLevelId) ?? levels[0];

  useEffect(() => {
    const issueEntries = Object.entries(validation).filter(([, issues]) => issues.length > 0);
    if (issueEntries.length > 0) {
      console.warn("Level validation issues", Object.fromEntries(issueEntries));
    }
  }, [validation]);

  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (modal === "TUTORIAL" || modal === "SETTINGS") setModal("NONE");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal]);

  function openLevel(levelId: number) {
    setCurrentLevelId(levelId);
    setCompletedRuntime(undefined);
    setScreen("GAME");
    setModal("NONE");
    setResetSignal((v) => v + 1);
  }

  function closeTutorial() {
    setProgress((current) => ({ ...current, hasSeenTutorial: true }));
    setModal("NONE");
  }

  function handleLevelComplete(runtime: LevelRuntimeState) {
    setCompletedRuntime(runtime);
    setProgress((current) => completeLevel(current, runtime.levelId, runtime.moves));
    setModal("LEVEL_COMPLETE");
  }

  function replayLevel() {
    setModal("NONE");
    setCompletedRuntime(undefined);
    setResetSignal((v) => v + 1);
  }

  function nextLevel() {
    if (!completedRuntime || completedRuntime.levelId >= 20) return;
    openLevel(completedRuntime.levelId + 1);
  }

  function handleResetProgress() {
    const next = resetProgress();
    setProgress(next);
    setCurrentLevelId(1);
    setCompletedRuntime(undefined);
    setResetSignal((v) => v + 1);
  }

  const completedLevel = completedRuntime
    ? levels.find((l) => l.id === completedRuntime.levelId)
    : undefined;

  return (
    <div className="app-shell">
      <div className="phone-shell">
        {screen === "START" && (
          <StartScreen
            unlockedLevelId={progress.unlockedLevelId}
            difficulty={highestUnlockedLevel.difficulty}
            onPlay={() => openLevel(progress.unlockedLevelId)}
            onLevelSelect={() => setScreen("LEVEL_SELECT")}
            onHelp={() => setModal("TUTORIAL")}
            onSettings={() => setModal("SETTINGS")}
          />
        )}

        {screen === "LEVEL_SELECT" && (
          <LevelSelectScreen
            levels={levels}
            progress={progress}
            onBack={() => setScreen("START")}
            onSelectLevel={openLevel}
          />
        )}

        {screen === "GAME" && (
          <GameScreen
            level={currentLevel}
            bestMoves={progress.bestMovesByLevelId[String(currentLevel.id)]}
            invalidIssues={validation[currentLevel.id]}
            resetSignal={resetSignal}
            modalOpen={modal !== "NONE"}
            onBack={() => setScreen("START")}
            onOpenSettings={() => setModal("SETTINGS")}
            onLevelComplete={handleLevelComplete}
          />
        )}

        {modal === "TUTORIAL" && <TutorialModal onClose={closeTutorial} />}

        {modal === "SETTINGS" && (
          <SettingsModal
            soundEnabled={progress.soundEnabled}
            onToggleSound={() => setProgress((c) => ({ ...c, soundEnabled: !c.soundEnabled }))}
            onResetProgress={handleResetProgress}
            onClose={() => setModal("NONE")}
          />
        )}

        {modal === "LEVEL_COMPLETE" && completedRuntime && completedLevel && (
          <LevelCompleteModal
            levelId={completedRuntime.levelId}
            moves={completedRuntime.moves}
            parMoves={completedLevel.parMoves}
            bestMoves={progress.bestMovesByLevelId[String(completedRuntime.levelId)]}
            hintsUsed={completedRuntime.hintsUsed}
            hasNextLevel={completedRuntime.levelId < 20}
            onReplay={replayLevel}
            onNext={nextLevel}
            onLevelSelect={() => {
              setModal("NONE");
              setScreen("LEVEL_SELECT");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
