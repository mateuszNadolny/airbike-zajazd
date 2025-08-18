import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TimerSettings {
  preparationTime: number;
  workTime: number;
  restTime: number;
  rounds: number;
  accelerations: boolean;
}

interface TimerState extends TimerSettings {
  updatePreparationTime: (time: number) => void;
  updateWorkTime: (time: number) => void;
  updateRestTime: (time: number) => void;
  updateRounds: (rounds: number) => void;
  updateAccelerations: (enabled: boolean) => void;
  updateAllSettings: (settings: Partial<TimerSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: TimerSettings = {
  preparationTime: 10,
  workTime: 120, // 2:00
  restTime: 60, // 1:00
  rounds: 4,
  accelerations: false,
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      updatePreparationTime: (time: number) =>
        set({ preparationTime: Math.max(0, Math.min(30, time)) }),

      updateWorkTime: (time: number) =>
        set({ workTime: Math.max(5, Math.min(3600, time)) }),

      updateRestTime: (time: number) =>
        set({ restTime: Math.max(0, Math.min(1800, time)) }),

      updateRounds: (rounds: number) =>
        set({ rounds: Math.max(1, Math.min(100, rounds)) }),

      updateAccelerations: (enabled: boolean) =>
        set({ accelerations: enabled }),

      updateAllSettings: (settings: Partial<TimerSettings>) =>
        set((state) => ({
          ...state,
          ...settings,
          // Apply validation to ensure values are within bounds
          preparationTime:
            settings.preparationTime !== undefined
              ? Math.max(0, Math.min(30, settings.preparationTime))
              : state.preparationTime,
          workTime:
            settings.workTime !== undefined
              ? Math.max(5, Math.min(3600, settings.workTime))
              : state.workTime,
          restTime:
            settings.restTime !== undefined
              ? Math.max(0, Math.min(1800, settings.restTime))
              : state.restTime,
          rounds:
            settings.rounds !== undefined
              ? Math.max(1, Math.min(100, settings.rounds))
              : state.rounds,
        })),

      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: "timer-settings-storage",
      // it saves the settings in the local storage
      partialize: (state) => ({
        preparationTime: state.preparationTime,
        workTime: state.workTime,
        restTime: state.restTime,
        rounds: state.rounds,
        accelerations: state.accelerations,
      }),
    }
  )
);
