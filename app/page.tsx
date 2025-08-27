"use client";
import { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Pause, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";

import Settings from "@/components/custom/settings/settings";
import { useTimerStore } from "@/store/timer-store";
import { audioManager } from "@/lib/audio";
import { formatTime } from "@/lib/utils";
import {
  AccelerationIndicator,
  PhaseIndicator,
  WorkoutCompletedIndicator,
} from "@/components/custom/timer/indicator";
import { TimerPhase } from "@/lib/types";
import useWakeLock from "@/hooks/useWaveLock";

interface TimerState {
  phase: TimerPhase;
  currentTime: number;
  totalTime: number;
  isRunning: boolean;
  currentRound: number;
}

export default function Home() {
  const {
    preparationTime,
    workTime,
    restTime,
    rounds,
    accelerations,
    generateAccelerations,
  } = useTimerStore();

  const { getCurrentAcceleration } = useTimerStore();

  const [timerState, setTimerState] = useState<TimerState>({
    phase: "preparation",
    currentTime: 0,
    totalTime: preparationTime,
    isRunning: false,
    currentRound: 1,
  });
  const [workoutCompleted, setWorkoutCompleted] = useState(false);

  // Only enable wake lock when timer is running
  useWakeLock(timerState.isRunning);

  const currentAcceleration = getCurrentAcceleration(timerState.currentTime);

  const [isMuted, setIsMuted] = useState(false);
  const lastAccelerationState = useRef<boolean>(false);

  let buttonAccelerationClasses = "";

  if (currentAcceleration && timerState.phase === "work") {
    buttonAccelerationClasses = "bg-red-400";
  } else if (timerState.phase === "rest") {
    buttonAccelerationClasses = "bg-green-900";
  } else {
    buttonAccelerationClasses = "bg-smalt-600";
  }

  // Initialize timer when settings change (without acceleration generation)
  useEffect(() => {
    // If preparation time is 0, start directly in work phase
    if (preparationTime === 0) {
      setTimerState((prev) => ({
        ...prev,
        totalTime: workTime,
        currentTime: 0,
        phase: "work",
      }));
      setWorkoutCompleted(false);
    } else {
      setTimerState((prev) => ({
        ...prev,
        totalTime: preparationTime,
        currentTime: 0,
        phase: "preparation",
      }));
    }
  }, [preparationTime, workTime, restTime, rounds]);

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

          // Check for acceleration state changes and play sounds
          if (prev.phase === "work" && accelerations) {
            const { getCurrentAcceleration } = useTimerStore.getState();
            const currentAcceleration = getCurrentAcceleration(newTime);
            const wasInAcceleration = lastAccelerationState.current;
            const isInAcceleration = !!currentAcceleration;

            // Play acceleration start sound
            if (!wasInAcceleration && isInAcceleration) {
              audioManager.play("acc_start");
            }
            // Play acceleration end sound
            else if (wasInAcceleration && !isInAcceleration) {
              audioManager.play("acc_end");
            }

            lastAccelerationState.current = isInAcceleration;
          }

          return { ...prev, currentTime: newTime };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [
    timerState.isRunning,
    timerState.currentTime,
    timerState.totalTime,
    accelerations,
  ]);

  // Handle immediate phase transitions (like 0 preparation time)
  useEffect(() => {
    if (
      timerState.isRunning &&
      timerState.currentTime >= timerState.totalTime
    ) {
      setTimerState((prev) => handlePhaseComplete(prev));
    }
  }, [timerState.isRunning, timerState.currentTime, timerState.totalTime]);

  const handlePhaseComplete = (prev: TimerState): TimerState => {
    if (prev.phase === "preparation") {
      if (accelerations) {
        // Defer the call to avoid render cycle issues
        setTimeout(() => generateAccelerations(), 0);
        lastAccelerationState.current = false; // Reset state
      }

      // Move to work phase - play work start sound
      audioManager.play("bell_start");
      return {
        ...prev,
        phase: "work",
        currentTime: 0,
        totalTime: workTime,
      };
    } else if (prev.phase === "work") {
      // Work phase completed - play work end sound
      audioManager.play("bell_end");

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
          audioManager.play("bell_start");
          return {
            ...prev,
            phase: "work",
            currentTime: 0,
            totalTime: workTime,
            currentRound: prev.currentRound + 1,
          };
        }
      } else {
        // Workout complete - no need to play bell_end again since it already played
        setWorkoutCompleted(true);
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
      if (accelerations) {
        // Defer the call to avoid render cycle issues
        setTimeout(() => generateAccelerations(), 0);
      }

      // Move directly to work phase for next round (skip preparation)
      audioManager.play("bell_start");
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
    if (workoutCompleted) {
      setWorkoutCompleted(false);
    }

    // Debug audio status when starting
    console.log("🎵 Audio status on start:", audioManager.getAudioStatus());

    if (timerState.currentTime >= timerState.totalTime) {
      // Reset to beginning
      if (preparationTime === 0) {
        // Start directly in work phase if no preparation time
        if (accelerations) {
          // Defer the call to avoid render cycle issues
          setTimeout(() => generateAccelerations(), 0);
        }
        setTimerState({
          phase: "work",
          currentTime: 0,
          totalTime: workTime,
          isRunning: true,
          currentRound: 1,
        });
      } else {
        // Start with preparation phase
        setTimerState({
          phase: "preparation",
          currentTime: 0,
          totalTime: preparationTime,
          isRunning: true,
          currentRound: 1,
        });
      }
    } else {
      // Resume or start
      setTimerState((prev) => ({ ...prev, isRunning: true }));
    }
  };

  const handlePause = () => {
    setTimerState((prev) => ({ ...prev, isRunning: false }));
  };

  const handleReset = () => {
    // Generate fresh accelerations when resetting
    if (accelerations) {
      generateAccelerations();
    }

    if (preparationTime === 0) {
      // Reset directly to work phase if no preparation time
      if (workoutCompleted) {
        setWorkoutCompleted(false);
      }

      setTimerState({
        phase: "work",
        currentTime: 0,
        totalTime: workTime,
        isRunning: false,
        currentRound: 1,
      });
    } else {
      // Reset to preparation phase
      if (workoutCompleted) {
        setWorkoutCompleted(false);
      }

      setTimerState({
        phase: "preparation",
        currentTime: 0,
        totalTime: preparationTime,
        isRunning: false,
        currentRound: 1,
      });
    }
  };

  const handleToggleMute = () => {
    const newMutedState = audioManager.toggleMute();
    setIsMuted(newMutedState);
  };

  const remainingTime = timerState.totalTime - timerState.currentTime;
  const isWorkPhase = timerState.phase === "work";
  const showAccelerations =
    accelerations && isWorkPhase && timerState.isRunning;

  return (
    <main
      className={`flex flex-col items-center justify-center h-screen min-h-screen font-be-vietnam-pro transition-colors duration-400 bg-gradient-to-b from-[#18191a] ${
        currentAcceleration && timerState.phase === "work"
          ? "to-red-400"
          : timerState.phase === "rest"
          ? "to-green-500"
          : "to-[#0e0e12]"
      }`}
    >
      <motion.h1
        className="text-4xl font-[900] text-smalt-50 tracking-tighter"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        Airbike Zajazd 🚴
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
        <p
          className={`text-[8rem] font-[900] tracking-tight ${
            (currentAcceleration && timerState.phase === "work") ||
            timerState.phase === "rest"
              ? "text-smalt-50"
              : "text-smalt-600"
          }`}
        >
          {formatTime(remainingTime)}
        </p>

        <PhaseIndicator phase={timerState.phase} />

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
        <Settings
          onClick={handleReset}
          buttonAccelerationClasses={buttonAccelerationClasses}
        />

        {timerState.isRunning ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center ${buttonAccelerationClasses}`}
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
            className={`w-20 h-20 rounded-full flex items-center justify-center ${buttonAccelerationClasses}`}
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
          className={`w-14 h-14 rounded-full flex items-center justify-center ${buttonAccelerationClasses}`}
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

        <motion.button
          whileTap={{ scale: 0.9 }}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${buttonAccelerationClasses}`}
          onClick={handleToggleMute}
          aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          {isMuted ? (
            <VolumeX
              className="text-smalt-50"
              style={{
                strokeWidth: 1.2,
                width: 25,
                height: 25,
              }}
            />
          ) : (
            <Volume2
              className="text-smalt-50"
              style={{
                strokeWidth: 1.2,
                width: 25,
                height: 25,
              }}
            />
          )}
        </motion.button>
      </motion.div>

      {workoutCompleted && (
        <WorkoutCompletedIndicator setWorkoutCompleted={setWorkoutCompleted} />
      )}
    </main>
  );
}
