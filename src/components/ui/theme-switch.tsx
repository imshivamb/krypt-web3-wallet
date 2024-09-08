"use client";

import { useTheme } from "@/context/theme-context";
import React from "react";
import { Sun, Moon } from "lucide-react";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="fixed bottom-5 right-5 bg-white w-[3rem] h-[3rem] bg-opacity-80
     backdrop-blur-[0.5rem] border border-gray-700 dark:border-white border-opacity-50 shadow-3xl rounded-full
     flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all dark:bg-gray-950"
      onClick={toggleTheme}
    >
      {theme === "light" ? <Sun /> : <Moon />}
    </button>
  );
};

export default ThemeSwitch;
