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
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-[20%] flex items-center justify-center"
    >
      <div className="bg-red-600/90 text-white px-6 py-3 rounded-full text-5xl font-bold">
        PRZYSPIESZ!
      </div>
    </motion.div>
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
