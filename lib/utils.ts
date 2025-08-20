import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const secondsToTimeString = (seconds: number): string => {
  const date = new Date(0);
  date.setSeconds(seconds);
  return format(date, "m:ss");
};

export const parseTimeString = (timeString: string): number | null => {
  try {
    const match = timeString.match(/^(\d+):(\d{2})$/);
    if (!match) return null;

    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);

    if (seconds >= 60) return null;

    return minutes * 60 + seconds;
  } catch {
    return null;
  }
};

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};
