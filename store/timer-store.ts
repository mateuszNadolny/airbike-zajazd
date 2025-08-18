import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AccelerationInterval {
  startTime: number;
  duration: number;
  endTime: number;
}

export interface TimerSettings {
  preparationTime: number;
  workTime: number;
  restTime: number;
  rounds: number;
  accelerations: boolean;
  minAccelerationDuration: number;
  maxAccelerationDuration: number;
  accelerationsPerMinute: number;
}

interface TimerState extends TimerSettings {
  accelerationIntervals: AccelerationInterval[];
  updatePreparationTime: (time: number) => void;
  updateWorkTime: (time: number) => void;
  updateRestTime: (time: number) => void;
  updateRounds: (rounds: number) => void;
  updateAccelerations: (enabled: boolean) => void;
  updateMinAccelerationDuration: (duration: number) => void;
  updateMaxAccelerationDuration: (duration: number) => void;
  updateAccelerationsPerMinute: (count: number) => void;
  updateAllSettings: (settings: Partial<TimerSettings>) => void;
  generateAccelerations: () => void;
  getCurrentAcceleration: (currentTime: number) => AccelerationInterval | null;
  resetToDefaults: () => void;
}

const defaultSettings: TimerSettings = {
  preparationTime: 10,
  workTime: 120, // 2:00
  restTime: 60, // 1:00
  rounds: 4,
  accelerations: false,
  minAccelerationDuration: 2,
  maxAccelerationDuration: 15,
  accelerationsPerMinute: 4,
};

// Generate random accelerations for a given work time
const generateAccelerationIntervals = (
  workTime: number,
  minDuration: number,
  maxDuration: number,
  accelerationsPerMinute: number
): AccelerationInterval[] => {
  if (workTime < 10) return []; // Too short for accelerations

  const intervals: AccelerationInterval[] = [];

  // Calculate target number of accelerations based on work time
  const minutes = workTime / 60;
  const targetAccelerations = Math.floor(accelerationsPerMinute * minutes);

  // Timing constraints: no accelerations in first 2s or last 2s
  const safeStartTime = 2;
  const safeEndTime = workTime - 2;

  // Check if we have enough time for accelerations
  if (safeEndTime <= safeStartTime) return [];

  let attempts = 0;
  const maxAttempts = 100;

  while (intervals.length < targetAccelerations && attempts < maxAttempts) {
    attempts++;

    // Generate random start time (respecting safe zones)
    const maxStartTime = safeEndTime - minDuration;
    if (maxStartTime < safeStartTime) break;

    const startTime =
      Math.floor(Math.random() * (maxStartTime - safeStartTime + 1)) +
      safeStartTime;
    const duration =
      Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;
    const endTime = startTime + duration;

    // Check if this interval overlaps with existing ones
    const overlaps = intervals.some(
      (interval) => startTime < interval.endTime && endTime > interval.startTime
    );

    if (!overlaps && endTime <= safeEndTime) {
      intervals.push({ startTime, duration, endTime });
    }
  }

  // Sort by start time
  return intervals.sort((a, b) => a.startTime - b.startTime);
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      accelerationIntervals: [],

      updatePreparationTime: (time: number) =>
        set({ preparationTime: Math.max(0, Math.min(30, time)) }),

      updateWorkTime: (time: number) =>
        set({ workTime: Math.max(5, Math.min(3600, time)) }),

      updateRestTime: (time: number) =>
        set({ restTime: Math.max(0, Math.min(1800, time)) }),

      updateRounds: (rounds: number) =>
        set({ rounds: Math.max(1, Math.min(100, rounds)) }),

      updateAccelerations: (enabled: boolean) => {
        set({ accelerations: enabled });
        if (enabled) {
          get().generateAccelerations();
        } else {
          set({ accelerationIntervals: [] });
        }
      },

      updateMinAccelerationDuration: (duration: number) => {
        const currentState = get();
        const newMinDuration = Math.max(1, Math.min(10, duration));

        // Ensure max duration is at least equal to new min duration
        const newMaxDuration = Math.max(
          newMinDuration,
          currentState.maxAccelerationDuration
        );

        set({
          minAccelerationDuration: newMinDuration,
          maxAccelerationDuration: newMaxDuration,
        });
      },

      updateMaxAccelerationDuration: (duration: number) => {
        const currentState = get();
        const newMaxDuration = Math.max(
          currentState.minAccelerationDuration, // Must be at least min duration
          Math.min(30, duration)
        );

        set({ maxAccelerationDuration: newMaxDuration });
      },

      updateAccelerationsPerMinute: (count: number) =>
        set({ accelerationsPerMinute: Math.max(1, Math.min(10, count)) }),

      updateAllSettings: (settings: Partial<TimerSettings>) => {
        const currentState = get();
        const newState = {
          ...currentState,
          ...settings,
          // Apply validation to ensure values are within bounds
          preparationTime:
            settings.preparationTime !== undefined
              ? Math.max(0, Math.min(30, settings.preparationTime))
              : currentState.preparationTime,
          workTime:
            settings.workTime !== undefined
              ? Math.max(5, Math.min(3600, settings.workTime))
              : currentState.workTime,
          restTime:
            settings.restTime !== undefined
              ? Math.max(0, Math.min(1800, settings.restTime))
              : currentState.restTime,
          rounds:
            settings.rounds !== undefined
              ? Math.max(1, Math.min(100, settings.rounds))
              : currentState.rounds,
          minAccelerationDuration:
            settings.minAccelerationDuration !== undefined
              ? Math.max(1, Math.min(10, settings.minAccelerationDuration))
              : currentState.minAccelerationDuration,
          maxAccelerationDuration:
            settings.maxAccelerationDuration !== undefined
              ? Math.max(
                  settings.minAccelerationDuration !== undefined
                    ? Math.max(
                        1,
                        Math.min(10, settings.minAccelerationDuration)
                      )
                    : currentState.minAccelerationDuration,
                  Math.min(30, settings.maxAccelerationDuration)
                )
              : currentState.maxAccelerationDuration,
          accelerationsPerMinute:
            settings.accelerationsPerMinute !== undefined
              ? Math.max(1, Math.min(10, settings.accelerationsPerMinute))
              : currentState.accelerationsPerMinute,
        };

        set(newState);

        // Only regenerate accelerations if:
        // 1. Work time actually changed (not just submitted with same value)
        // 2. Acceleration setting was toggled
        // 3. Acceleration duration or count settings changed
        const workTimeChanged =
          settings.workTime !== undefined &&
          settings.workTime !== currentState.workTime;
        const accelerationToggled =
          settings.accelerations !== undefined &&
          settings.accelerations !== currentState.accelerations;
        const accelerationSettingsChanged =
          settings.minAccelerationDuration !== undefined ||
          settings.maxAccelerationDuration !== undefined ||
          settings.accelerationsPerMinute !== undefined;

        if (
          newState.accelerations &&
          (workTimeChanged ||
            accelerationToggled ||
            accelerationSettingsChanged)
        ) {
          get().generateAccelerations();
        }
      },

      generateAccelerations: () => {
        const {
          workTime,
          accelerations,
          minAccelerationDuration,
          maxAccelerationDuration,
          accelerationsPerMinute,
        } = get();
        if (!accelerations || workTime < 10) {
          set({ accelerationIntervals: [] });
          return;
        }

        const intervals = generateAccelerationIntervals(
          workTime,
          minAccelerationDuration,
          maxAccelerationDuration,
          accelerationsPerMinute
        );

        // Console log for developer to verify acceleration generation
        console.log("🎯 Generated Accelerations:", {
          workTime: `${Math.floor(workTime / 60)}:${(workTime % 60)
            .toString()
            .padStart(2, "0")}`,
          minDuration: minAccelerationDuration,
          maxDuration: maxAccelerationDuration,
          accelerationsPerMinute,
          totalAccelerations: intervals.length,
          intervals: intervals.map((interval) => ({
            start: `${Math.floor(interval.startTime / 60)}:${(
              interval.startTime % 60
            )
              .toString()
              .padStart(2, "0")}`,
            end: `${Math.floor(interval.endTime / 60)}:${(interval.endTime % 60)
              .toString()
              .padStart(2, "0")}`,
            duration: `${interval.duration}s`,
          })),
        });

        set({ accelerationIntervals: intervals });
      },

      getCurrentAcceleration: (currentTime: number) => {
        const { accelerationIntervals } = get();
        return (
          accelerationIntervals.find(
            (interval) =>
              currentTime >= interval.startTime &&
              currentTime < interval.endTime
          ) || null
        );
      },

      resetToDefaults: () => {
        console.log("🔄 Resetting timer to defaults");
        set({
          ...defaultSettings,
          accelerationIntervals: [],
        });
      },
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
        minAccelerationDuration: state.minAccelerationDuration,
        maxAccelerationDuration: state.maxAccelerationDuration,
        accelerationsPerMinute: state.accelerationsPerMinute,
      }),
    }
  )
);
