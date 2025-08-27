"use client";

import { motion } from "motion/react";

import { useTimerStore } from "@/store/timer-store";
import { TimerPhase } from "@/lib/types";

export const AccelerationIndicator = ({
  currentTime,
}: {
  currentTime: number;
}) => {
  const { getCurrentAcceleration } = useTimerStore();
  const currentAcceleration = getCurrentAcceleration(currentTime);

  if (!currentAcceleration) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-2xl font-semibold tracking-tight -my-6 mb-8 text-smalt-50`}
    >
      PRZYSPIESZ!
    </motion.p>
  );
};

export const PhaseIndicator = ({ phase }: { phase: TimerPhase }) => {
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

export const WorkoutCompletedIndicator = ({
  setWorkoutCompleted,
}: {
  setWorkoutCompleted: (value: boolean) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-0 left-0 w-full h-full bg-smalt-0/50 flex items-center justify-center"
    >
      <div className="bg-green-700 p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-smalt-50 mb-4">
          Trening zakończony 🥳
        </h2>
        <p className="text-smalt-50 mb-6 text-center">
          Oboje wiemy, że mogłeś dać z siebie więcej.
          <br />
          Może kolejna rundka?
        </p>
        <div className="flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-smalt-50 text-smalt-0 p-2 rounded-md w-[200px]"
            onClick={() => setWorkoutCompleted(false)}
          >
            Zamknij
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
