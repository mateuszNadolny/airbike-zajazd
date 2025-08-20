// hooks/useWakeLock.ts
"use client";
import { useEffect, useRef } from "react";
import NoSleep from "nosleep.js";

// Type for NoSleep instance
interface NoSleepInstance {
  enable(): void;
  disable(): void;
}

// Type for the hook return (though this hook doesn't return anything)
type UseWakeLockReturn = void;

export default function useWakeLock(active: boolean): UseWakeLockReturn {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const noSleepRef = useRef<NoSleepInstance | null>(null);

  useEffect(() => {
    if (!active) {
      // Wyłącz jeśli timer zatrzymany
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch((error: unknown) => {
          console.warn("Failed to release wake lock:", error);
        });
        wakeLockRef.current = null;
      }
      if (noSleepRef.current) {
        noSleepRef.current.disable();
        noSleepRef.current = null;
      }
      return;
    }

    let eventCleanup: (() => void) | undefined;

    const enableWakeLock = async (): Promise<void> => {
      if ("wakeLock" in navigator && navigator.wakeLock) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
          console.log(
            "Wake Lock enabled successfully - screen will stay awake"
          );

          // Odnów locka po powrocie do zakładki
          const handleVisibilityChange = async (): Promise<void> => {
            if (
              wakeLockRef.current === null &&
              document.visibilityState === "visible"
            ) {
              try {
                wakeLockRef.current = await navigator.wakeLock!.request(
                  "screen"
                );
                console.log("Wake Lock re-enabled after tab return");
              } catch (error: unknown) {
                console.warn("Failed to re-request wake lock:", error);
                // Fall back to NoSleep if wake lock fails
                fallbackToNoSleep();
              }
            }
          };

          document.addEventListener("visibilitychange", handleVisibilityChange);

          // Store the cleanup function
          eventCleanup = () => {
            document.removeEventListener(
              "visibilitychange",
              handleVisibilityChange
            );
          };
        } catch (error: unknown) {
          console.warn("Wake Lock API failed, falling back to NoSleep:", error);
          // Automatically fall back to NoSleep if wake lock fails
          fallbackToNoSleep();
        }
      } else {
        // Fallback dla starszych urządzeń
        fallbackToNoSleep();
      }
    };

    const fallbackToNoSleep = (): void => {
      try {
        noSleepRef.current = new NoSleep() as NoSleepInstance;
        noSleepRef.current.enable();
        console.log("NoSleep fallback enabled - screen will stay awake");
      } catch (error: unknown) {
        console.warn("NoSleep fallback also failed:", error);
        console.warn(
          "Screen may go to sleep during workout - please keep device active"
        );
      }
    };

    enableWakeLock();

    // Cleanup przy odmontowaniu
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch((error: unknown) => {
          console.warn("Failed to release wake lock during cleanup:", error);
        });
        wakeLockRef.current = null;
      }
      if (noSleepRef.current) {
        noSleepRef.current.disable();
        noSleepRef.current = null;
      }

      // Clean up the event listener if it was set
      if (eventCleanup) {
        eventCleanup();
      }
    };
  }, [active]);
}
