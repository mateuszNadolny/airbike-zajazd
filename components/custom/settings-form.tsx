"use client";
import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";

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
import { secondsToTimeString, parseTimeString } from "@/lib/utils";

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
  minAccelerationDuration: z
    .number()
    .min(2, {
      message: "Minimum acceleration duration must be at least 2 seconds",
    })
    .max(10, {
      message: "Minimum acceleration duration cannot exceed 10 seconds",
    }),
  maxAccelerationDuration: z
    .number()
    .min(5, {
      message: "Maximum acceleration duration must be at least 5 seconds",
    })
    .max(20, {
      message: "Maximum acceleration duration cannot exceed 20 seconds",
    }),
  accelerationsPerMinute: z
    .number()
    .min(3, {
      message: "Must have at least 3 accelerations per minute",
    })
    .max(6, {
      message: "Cannot exceed 6 accelerations per minute",
    }),
});

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

const SettingsForm = ({ onClose }: { onClose: () => void }) => {
  const {
    preparationTime,
    workTime,
    restTime,
    rounds,
    accelerations,
    minAccelerationDuration,
    maxAccelerationDuration,
    accelerationsPerMinute,
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
      minAccelerationDuration,
      maxAccelerationDuration,
      accelerationsPerMinute,
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
      minAccelerationDuration,
      maxAccelerationDuration,
      accelerationsPerMinute,
    });
  }, [
    preparationTime,
    workTime,
    restTime,
    rounds,
    accelerations,
    minAccelerationDuration,
    maxAccelerationDuration,
    accelerationsPerMinute,
    form,
  ]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    updateAllSettings(values);
    console.log("Settings updated:", values);
    onClose(); // Close the drawer after successful submission
  };

  const watchedAccelerations = form.watch("accelerations");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 flex flex-col items-center mb-8 overflow-y-auto"
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
                Przyspieszenia pojawiają się w losowych momentach cyklu pracy.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Acceleration Settings - Only visible when accelerations are enabled */}
        {watchedAccelerations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="minAccelerationDuration"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-base text-smalt-50 tracking-tight font-semibold">
                    Minimalny czas przyspieszenia
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center bg-smalt-900 rounded-lg">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          field.onChange(Math.max(field.value - 1, 2))
                        }
                        className="bg-smalt-500 text-2xl text-smalt-50 w-10 h-10 p-0 rounded-lg"
                        aria-label="Decrease min duration"
                      >
                        -
                      </motion.button>
                      <Input
                        {...field}
                        type="number"
                        min={2}
                        max={10}
                        readOnly
                        onKeyDown={(e) => e.preventDefault()}
                        className="w-20 border-none rounded-none text-center font-mono text-smalt-50 focus-visible:ring-0 focus-visible:ring-offset-0"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 2)
                        }
                      />
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          field.onChange(Math.min(field.value + 1, 10))
                        }
                        className="bg-smalt-500 text-2xl text-smalt-50 w-10 h-10 p-0 rounded-lg"
                        aria-label="Increase min duration"
                      >
                        +
                      </motion.button>
                    </div>
                  </FormControl>
                  <p className="text-xs text-smalt-400 mt-1 text-center">
                    Zakres: 2s - 10s
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxAccelerationDuration"
              render={({ field }) => {
                const minDuration = form.watch("minAccelerationDuration");
                const isValidMax = field.value >= minDuration;

                return (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-base text-smalt-50 tracking-tight font-semibold">
                      Maksymalny czas przyspieszenia
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center bg-smalt-900 rounded-lg">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            field.onChange(
                              Math.max(field.value - 1, minDuration)
                            )
                          }
                          className="bg-smalt-500 text-2xl text-smalt-50 w-10 h-10 p-0 rounded-lg"
                          aria-label="Decrease max duration"
                        >
                          -
                        </motion.button>
                        <Input
                          {...field}
                          type="number"
                          min={minDuration}
                          max={20}
                          readOnly
                          onKeyDown={(e) => e.preventDefault()}
                          className={`w-20 border-none rounded-none text-center font-mono focus-visible:ring-0 focus-visible:ring-offset-0 ${
                            isValidMax ? "text-smalt-50" : "text-red-400"
                          }`}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || minDuration
                            )
                          }
                        />
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            field.onChange(Math.min(field.value + 1, 20))
                          }
                          className="bg-smalt-500 text-2xl text-smalt-50 w-10 h-10 p-0 rounded-lg"
                          aria-label="Increase max duration"
                        >
                          +
                        </motion.button>
                      </div>
                    </FormControl>
                    {!isValidMax && (
                      <p className="text-xs text-red-400 mt-1">
                        Maksymalny czas musi być większy lub równy minimalnemu (
                        {minDuration}s)
                      </p>
                    )}
                    <p className="text-xs text-smalt-400 mt-1 text-center">
                      Zakres: {minDuration}s - 20s
                    </p>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="accelerationsPerMinute"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-base text-smalt-50 tracking-tight font-semibold">
                    Ilość przyspieszeń na minutę
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center bg-smalt-900 rounded-lg">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          field.onChange(Math.max(field.value - 1, 3))
                        }
                        className="bg-smalt-500 text-2xl text-smalt-50 w-10 h-10 p-0 rounded-lg"
                        aria-label="Decrease accelerations per minute"
                      >
                        -
                      </motion.button>
                      <Input
                        {...field}
                        type="number"
                        min={3}
                        max={6}
                        readOnly
                        onKeyDown={(e) => e.preventDefault()}
                        className="w-20 border-none rounded-none text-center font-mono text-smalt-50 focus-visible:ring-0 focus-visible:ring-offset-0"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 3)
                        }
                      />
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          field.onChange(Math.min(field.value + 1, 6))
                        }
                        className="bg-smalt-500 text-2xl text-smalt-50 w-10 h-10 p-0 rounded-lg"
                        aria-label="Increase accelerations per minute"
                      >
                        +
                      </motion.button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.9 }}
          className="w-1/3 bg-smalt-500 text-smalt-50 rounded-lg p-2"
        >
          Zapisz
        </motion.button>
      </form>
    </Form>
  );
};

export default SettingsForm;
