"use client";
import { Play, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import Settings from "@/components/custom/settings";
import { Button } from "@/components/ui/button";

export default function Home() {
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
        className="text-muted-foreground  opacity-50 text-xl font-semibold tracking-tight mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        Runda 1/3
      </motion.p>

      <motion.div
        className="flex flex-col items-center justify-center my-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      >
        <p className="text-smalt-600 text-[8rem] font-[900] tracking-tight">
          02:00
        </p>
        <p className="text-smalt-50 text-xl font-semibold tracking-tight -my-6 mb-8">
          Spokojna praca
        </p>
      </motion.div>

      <motion.div
        className="flex items-center justify-center w-full gap-6 mt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
      >
        <Settings />

        <Button className="w-20 h-20 bg-smalt-600 rounded-full flex items-center justify-center">
          <Play className="text-smalt-50 font-bold text-6xl w-10 h-10" />
        </Button>

        <Button className="w-14 h-14 bg-smalt-600 rounded-full flex items-center justify-center">
          <RotateCcw className="text-smalt-50 font-bold" />
        </Button>
      </motion.div>
    </main>
  );
}
