"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="relative p-2 w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1F1F23] animate-pulse" />
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-all duration-200 cursor-pointer select-none active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
      aria-label="Alternar tema"
    >
      <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300 transition-all duration-200 dark:hidden dark:rotate-90 dark:scale-0" />
      <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300 transition-all duration-200 hidden dark:block rotate-0 scale-100" />
      <span className="sr-only">Alternar tema</span>
    </button>
  )
}
