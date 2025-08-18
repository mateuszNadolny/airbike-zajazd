"use client";
import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTimerStore } from "@/store/timer-store";

const formSchema = z.object({
  preparationTime: z
    .number()
    .min(0, {
      message: "Preparation time cannot be negative",
    })
    .max(30, {
      message: "Preparation time cannot exceed 30 seconds",
    }),
  workTime: z
    .number()
    .min(5, {
      message: "Work time must be at least 5 seconds",
    })
    .max(3600, {
      message: "Work time cannot exceed 1 hour",
    }),
  restTime: z
    .number()
    .min(0, {
      message: "Rest time cannot be negative",
    })
    .max(1800, {
      message: "Rest time cannot exceed 30 minutes",
    }),
  rounds: z
    .number()
    .min(1, {
      message: "Must have at least 1 round",
    })
    .max(100, {
      message: "Cannot exceed 100 rounds",
    }),
  accelerations: z.boolean(),
});

const secondsToTimeString = (seconds: number): string => {
  const date = new Date(0);
  date.setSeconds(seconds);
  return format(date, "m:ss");
};

const parseTimeString = (timeString: string): number | null => {
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

const TimeInput = ({
  value,
  onChange,
  min = 0,
  max = 3600,
  step = 5,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) => {
  const [inputValue, setInputValue] = useState(() =>
    secondsToTimeString(value)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const timeValue = parseTimeString(inputValue);
    if (timeValue !== null && timeValue >= min && timeValue <= max) {
      onChange(timeValue);
      setInputValue(secondsToTimeString(timeValue));
    } else {
      setInputValue(secondsToTimeString(value));
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    setInputValue(secondsToTimeString(newValue));
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    setInputValue(secondsToTimeString(newValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center bg-smalt-900 rounded-lg ">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={handleDecrement}
        className="bg-smalt-500 text-2xl text-smalt-50 w-10 h-10 p-0 rounded-lg"
        aria-label="Decrease time"
      >
        -
      </motion.button>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        readOnly
        placeholder="0:00"
        className="w-20 border-none rounded-none text-center font-mono text-smalt-50 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={handleIncrement}
        className="bg-smalt-500 text-2xl text-smalt-50 w-10 h-10 p-0 rounded-lg"
        aria-label="Increase time"
      >
        +
      </motion.button>
    </div>
  );
};

const SettingsForm = () => {
  const {
    preparationTime,
    workTime,
    restTime,
    rounds,
    accelerations,
    updateAllSettings,
  } = useTimerStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preparationTime,
      workTime,
      restTime,
      rounds,
      accelerations,
    },
  });

  // Sync form with store values when they change
  useEffect(() => {
    form.reset({
      preparationTime,
      workTime,
      restTime,
      rounds,
      accelerations,
    });
  }, [preparationTime, workTime, restTime, rounds, accelerations, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    updateAllSettings(values);
    console.log("Settings updated:", values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 flex flex-col items-center mb-8"
      >
        <FormField
          control={form.control}
          name="preparationTime"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel className="text-base text-smalt-50 tracking-tight font-semibold">
                Czas przygotowania
              </FormLabel>
              <FormControl className="rounded-xl border border-smalt-300">
                <TimeInput
                  value={field.value}
                  onChange={field.onChange}
                  min={0}
                  max={30}
                  step={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workTime"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel className="text-base text-smalt-50 tracking-tight font-semibold">
                Czas pracy
              </FormLabel>
              <FormControl>
                <TimeInput
                  value={field.value}
                  onChange={field.onChange}
                  min={5}
                  max={3600}
                  step={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="restTime"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel className="text-base text-smalt-50 tracking-tight font-semibold">
                Czas odpoczynku
              </FormLabel>
              <FormControl>
                <TimeInput
                  value={field.value}
                  onChange={field.onChange}
                  min={0}
                  max={1800}
                  step={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rounds"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel className="text-base text-smalt-50 tracking-tight font-semibold">
                Ilość rund
              </FormLabel>
              <FormControl>
                <div className="flex items-center bg-smalt-900 rounded-lg">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => field.onChange(Math.max(field.value - 1, 1))}
                    className="bg-smalt-500 text-2xl text-smalt-50 w-10 h-10 p-0 rounded-lg"
                    aria-label="Decrease rounds"
                  >
                    -
                  </motion.button>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    max={100}
                    readOnly
                    onKeyDown={(e) => e.preventDefault()}
                    className="w-20 border-none rounded-none text-center font-mono text-smalt-50 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 1)
                    }
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      field.onChange(Math.min(field.value + 1, 100))
                    }
                    className="bg-smalt-500 text-2xl text-smalt-50 w-10 h-10 p-0 rounded-lg"
                    aria-label="Increase rounds"
                  >
                    +
                  </motion.button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accelerations"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel className="text-base text-smalt-50 tracking-tight font-semibold">
                Przyspieszenia?
              </FormLabel>

              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground text-center p-2">
                Przyspieszenia pojawiają się w losowej ilości w losowych
                momentach cyklu pracy.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-1/3 bg-smalt-500 text-smalt-50">
          Zapisz
        </Button>
      </form>
    </Form>
  );
};

export default SettingsForm;
