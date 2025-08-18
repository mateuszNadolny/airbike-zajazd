"use client";
import { Play, RotateCcw, Pause } from "lucide-react";
import { motion } from "motion/react";
import Settings from "@/components/custom/settings";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/store/timer-store";
import { useState, useEffect } from "react";

export type TimerPhase = "preparation" | "work" | "rest";

interface TimerState {
  phase: TimerPhase;
  currentTime: number;
  totalTime: number;
  isRunning: boolean;
  currentRound: number;
}

const AccelerationIndicator = ({ currentTime }: { currentTime: number }) => {
  const { getCurrentAcceleration } = useTimerStore();
  const currentAcceleration = getCurrentAcceleration(currentTime);

  if (!currentAcceleration) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="bg-red-600/90 text-white px-6 py-3 rounded-full text-2xl font-bold animate-pulse">
        PRZYSPIESZ!
      </div>
    </motion.div>
  );
};

const PhaseIndicator = ({ phase }: { phase: TimerPhase }) => {
  const phaseLabels = {
    preparation: "Przygotowanie",
    work: "Praca",
    rest: "Odpoczynek",
  };

  const phaseColors = {
    preparation: "text-yellow-400",
    work: "text-smalt-50",
    rest: "text-green-400",
  };

  return (
    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-xl font-semibold tracking-tight -my-6 mb-8 ${phaseColors[phase]}`}
    >
      {phaseLabels[phase]}
    </motion.p>
  );
};

export default function Home() {
  const {
    preparationTime,
    workTime,
    restTime,
    rounds,
    accelerations,
    generateAccelerations,
  } = useTimerStore();

  const [timerState, setTimerState] = useState<TimerState>({
    phase: "preparation",
    currentTime: 0,
    totalTime: preparationTime,
    isRunning: false,
    currentRound: 1,
  });

  // Initialize timer when settings change
  useEffect(() => {
    if (accelerations) {
      generateAccelerations();
    }

    setTimerState((prev) => ({
      ...prev,
      totalTime: preparationTime,
      currentTime: 0,
      phase: "preparation",
    }));
  }, [
    preparationTime,
    workTime,
    restTime,
    rounds,
    accelerations,
    generateAccelerations,
  ]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState.isRunning && timerState.currentTime < timerState.totalTime) {
      interval = setInterval(() => {
        setTimerState((prev) => {
          const newTime = prev.currentTime + 1;

          // Check if current phase is complete
          if (newTime >= prev.totalTime) {
            return handlePhaseComplete(prev);
          }

          return { ...prev, currentTime: newTime };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.currentTime, timerState.totalTime]);

  const handlePhaseComplete = (prev: TimerState): TimerState => {
    if (prev.phase === "preparation") {
      // Move to work phase
      return {
        ...prev,
        phase: "work",
        currentTime: 0,
        totalTime: workTime,
      };
    } else if (prev.phase === "work") {
      // Check if there are more rounds
      if (prev.currentRound < rounds) {
        if (restTime > 0) {
          // Move to rest phase
          return {
            ...prev,
            phase: "rest",
            currentTime: 0,
            totalTime: restTime,
          };
        } else {
          // No rest time, move directly to next round work phase
          return {
            ...prev,
            phase: "work",
            currentTime: 0,
            totalTime: workTime,
            currentRound: prev.currentRound + 1,
          };
        }
      } else {
        // Workout complete
        return {
          ...prev,
          isRunning: false,
          currentTime: 0,
          totalTime: preparationTime,
          phase: "preparation",
          currentRound: 1,
        };
      }
    } else if (prev.phase === "rest") {
      // Move directly to work phase for next round (skip preparation)
      return {
        ...prev,
        phase: "work",
        currentTime: 0,
        totalTime: workTime,
        currentRound: prev.currentRound + 1,
      };
    }

    return prev;
  };

  const handleStart = () => {
    if (timerState.currentTime >= timerState.totalTime) {
      // Reset to beginning
      setTimerState({
        phase: "preparation",
        currentTime: 0,
        totalTime: preparationTime,
        isRunning: true,
        currentRound: 1,
      });
    } else {
      // Resume or start
      setTimerState((prev) => ({ ...prev, isRunning: true }));
    }
  };

  const handlePause = () => {
    setTimerState((prev) => ({ ...prev, isRunning: false }));
  };

  const handleReset = () => {
    setTimerState({
      phase: "preparation",
      currentTime: 0,
      totalTime: preparationTime,
      isRunning: false,
      currentRound: 1,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const remainingTime = timerState.totalTime - timerState.currentTime;
  const isWorkPhase = timerState.phase === "work";
  const showAccelerations =
    accelerations && isWorkPhase && timerState.isRunning;

  return (
    <main className="flex flex-col items-center justify-center h-screen min-h-screen font-be-vietnam-pro">
      <motion.h1
        className="text-4xl font-[900] text-smalt-50 tracking-tighter"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        Airbike Zajazd
      </motion.h1>

      <motion.p
        className="text-muted-foreground opacity-50 text-xl font-semibold tracking-tight mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        Runda {timerState.currentRound}/{rounds}
      </motion.p>

      <motion.div
        className="flex flex-col items-center justify-center my-4 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      >
        <p className="text-smalt-600 text-[8rem] font-[900] tracking-tight">
          {formatTime(remainingTime)}
        </p>

        <PhaseIndicator phase={timerState.phase} />

        {/* Acceleration Indicator */}
        {showAccelerations && (
          <AccelerationIndicator currentTime={timerState.currentTime} />
        )}
      </motion.div>

      <motion.div
        className="flex items-center justify-center w-full gap-6 mt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
      >
        <Settings />

        {timerState.isRunning ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 bg-smalt-600 rounded-full flex items-center justify-center"
            onClick={handlePause}
          >
            <Pause
              className="text-smalt-50 font-bold text-6xl w-10 h-10"
              style={{
                strokeWidth: 1.2,
                width: 40,
                height: 40,
              }}
            />
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 bg-smalt-600 rounded-full flex items-center justify-center"
            onClick={handleStart}
          >
            <Play
              className="text-smalt-50 font-bold text-6xl w-10 h-10"
              style={{
                strokeWidth: 1.2,
                width: 40,
                height: 40,
              }}
            />
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.9, rotate: -90 }}
          className="w-14 h-14 bg-smalt-600 rounded-full flex items-center justify-center"
          onClick={handleReset}
        >
          <RotateCcw
            className="text-smalt-50 font-regular"
            style={{
              strokeWidth: 1.2,
              width: 25,
              height: 25,
            }}
          />
        </motion.button>
      </motion.div>
    </main>
  );
}
