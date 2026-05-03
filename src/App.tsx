import { useEffect, useMemo, useRef, useState } from "react";
import { checkAchievements, getAchievement } from "./game/achievements";
import { levels } from "./game/levels";
import { validateLevels } from "./game/levelValidation";
import {
  completeLevel,
  loadProgress,
  resetProgress,
  saveProgress,
} from "./game/storage";
import type { LevelRuntimeState, PersistedProgress } from "./game/types";
import { GameScreen } from "./components/GameScreen";
import { LevelCompleteModal } from "./components/LevelCompleteModal";
import { LevelSelectScreen } from "./components/LevelSelectScreen";
import { SettingsModal } from "./components/SettingsModal";
import { StartScreen } from "./components/StartScreen";
import { TutorialModal } from "./components/TutorialModal";

type AppScreen = "START" | "LEVEL_SELECT" | "GAME";
type ModalState = "NONE" | "TUTORIAL" | "LEVEL_COMPLETE" | "SETTINGS";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function todayDayNumber(): number {
  return Math.floor(Date.now() / 86_400_000);
}

function getDailyLevelId(): number {
  const day = todayDayNumber();
  return (day % levels.length) + 1;
}

function updateStreak(progress: PersistedProgress): PersistedProgress {
  const today = todayKey();
  if (progress.lastPlayedDate === today) return progress;

  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  })();

  const streakDays =
    progress.lastPlayedDate === yesterday ? progress.streakDays + 1 : 1;

  return { ...progress, streakDays, lastPlayedDate: today };
}

function App() {
  const [screen, setScreen] = useState<AppScreen>("START");
  const [modal, setModal] = useState<ModalState>("NONE");
  const [progress, setProgress] = useState<PersistedProgress>(() => {
    const loaded = loadProgress();
    return updateStreak(loaded);
  });
  const [currentLevelId, setCurrentLevelId] = useState(progress.unlockedLevelId);
  const [isDaily, setIsDaily] = useState(false);
  const [completedRuntime, setCompletedRuntime] = useState<LevelRuntimeState | undefined>();
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [resetSignal, setResetSignal] = useState(0);
  const sessionCompletionsRef = useRef(0);

  const validation = useMemo(() => validateLevels(levels), []);
  const currentLevel = levels.find((level) => level.id === currentLevelId) ?? levels[0];
  const highestUnlockedLevel = levels.find((level) => level.id === progress.unlockedLevelId) ?? levels[0];
  const dailyLevelId = getDailyLevelId();
  const dailyCompleted = progress.lastDailyChallengeDay === todayDayNumber();

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

  function openLevel(levelId: number, daily = false) {
    setCurrentLevelId(levelId);
    setIsDaily(daily);
    setCompletedRuntime(undefined);
    setNewAchievements([]);
    setScreen("GAME");
    setModal("NONE");
    setResetSignal((v) => v + 1);
  }

  function openDailyChallenge() {
    openLevel(dailyLevelId, true);
  }

  function closeTutorial() {
    setProgress((current) => ({ ...current, hasSeenTutorial: true }));
    setModal("NONE");
  }

  function handleLevelComplete(runtime: LevelRuntimeState) {
    sessionCompletionsRef.current += 1;
    setCompletedRuntime(runtime);

    setProgress((current) => {
      const next = completeLevel(current, runtime.levelId, runtime.moves);

      const completedLevel = levels.find((l) => l.id === runtime.levelId);
      const earnedIds = checkAchievements({
        levelId: runtime.levelId,
        moves: runtime.moves,
        parMoves: completedLevel?.parMoves ?? runtime.moves,
        hintsUsed: runtime.hintsUsed,
        difficulty: completedLevel?.difficulty ?? "Easy",
        isDaily,
        sessionCompletions: sessionCompletionsRef.current,
        streakDays: next.streakDays,
        existingIds: next.achievementIds,
      });

      const dailyUpdate =
        isDaily && !dailyCompleted
          ? { lastDailyChallengeDay: todayDayNumber() }
          : {};

      const updated: PersistedProgress = {
        ...next,
        achievementIds: [...next.achievementIds, ...earnedIds],
        ...dailyUpdate,
      };

      setNewAchievements(earnedIds);
      return updated;
    });

    setModal("LEVEL_COMPLETE");
  }

  function replayLevel() {
    setModal("NONE");
    setCompletedRuntime(undefined);
    setNewAchievements([]);
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
    setIsDaily(false);
    setCompletedRuntime(undefined);
    setNewAchievements([]);
    sessionCompletionsRef.current = 0;
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
            streakDays={progress.streakDays}
            achievementCount={progress.achievementIds.length}
            dailyCompleted={dailyCompleted}
            onPlay={() => openLevel(progress.unlockedLevelId)}
            onDailyChallenge={openDailyChallenge}
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
            isDaily={isDaily}
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
            newAchievements={newAchievements.map((id) => getAchievement(id)).filter(Boolean) as import("./game/achievements").Achievement[]}
            levelName={completedLevel.name}
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
