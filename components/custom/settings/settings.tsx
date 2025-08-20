"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import SettingsForm from "@/components/custom/settings/settings-form";
import { motion } from "motion/react";
import { Settings as SettingsIcon } from "lucide-react";

interface SettingsProps {
  onClick: () => void;
  buttonAccelerationClasses: string;
}

const Settings = ({ onClick, buttonAccelerationClasses }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger>
        <motion.div
          className={`w-14 h-14 rounded-full flex items-center justify-center ${buttonAccelerationClasses}`}
          whileHover={{
            scale: 1.1,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
        >
          <SettingsIcon
            className="text-smalt-50 font-regular"
            style={{
              strokeWidth: 1.2,
              width: 25,
              height: 25,
            }}
          />
        </motion.div>
      </DrawerTrigger>
      <DrawerContent className="bg-smalt-0 shadow-xl border-none outline-none">
        <DrawerHeader>
          <DrawerTitle className="text-smalt-50">Ustawienia</DrawerTitle>
          <DrawerDescription>Dostosuj swój trening</DrawerDescription>
        </DrawerHeader>
        <SettingsForm onClose={handleClose} />
      </DrawerContent>
    </Drawer>
  );
};

export default Settings;
