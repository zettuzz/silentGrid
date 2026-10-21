import AsyncStorage from "@react-native-async-storage/async-storage"
import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = {
  bg: string
  surface: string
  card: string
  border: string
  text: string
  sub: string
  muted: string
  accent: string
  red: string
  green: string
  amber: string
  banner: string // near-black cards (status banner, antenna, packet, etc.)
  r: number
  rLg: number
}

export const LIGHT: Theme = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  card: "#F4F4F5",
  border: "#E9E9EB",
  text: "#09090B",
  sub: "#71717A",
  muted: "#A1A1AA",
  accent: "#EA0200",
  red: "#B91C1C",
  green: "#22C55E",
  amber: "#F59E0B",
  banner: "#09090B",
  r: 14,
  rLg: 20,
}

export const DARK: Theme = {
  bg: "#09090B",
  surface: "#18181B",
  card: "#27272A",
  border: "#3F3F46",
  text: "#FAFAFA",
  sub: "#A1A1AA",
  muted: "#71717A",
  accent: "#FF3B30",
  red: "#DC2626",
  green: "#22C55E",
  amber: "#F59E0B",
  banner: "#09090B",
  r: 14,
  rLg: 20,
}

// ─── Fonts ────────────────────────────────────────────────────────────────────
// Android ignores `fontWeight` once a custom family is set, so every text style
// resolves its family via `ff()`.

export const FAMILIES = {
  Inter_300Light: "Inter_300Light",
  Inter_400Regular: "Inter_400Regular",
  Inter_500Medium: "Inter_500Medium",
  Inter_600SemiBold: "Inter_600SemiBold",
  Inter_700Bold: "Inter_700Bold",
  Inter_800ExtraBold: "Inter_800ExtraBold",
  JetBrainsMono_400Regular: "JetBrainsMono_400Regular",
  JetBrainsMono_600SemiBold: "JetBrainsMono_600SemiBold",
  JetBrainsMono_700Bold: "JetBrainsMono_700Bold",
} as const

function normWeight(w: unknown): number {
  if (typeof w === "number" && !Number.isNaN(w)) return w
  const s = String(w ?? "400").toLowerCase()
  if (s === "bold") return 700
  if (s === "normal") return 400
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? 400 : n
}

export function ff(weight: unknown = 400, mono = false): string {
  const w = normWeight(weight)
  if (mono) {
    if (w >= 700) return FAMILIES.JetBrainsMono_700Bold
    if (w >= 600) return FAMILIES.JetBrainsMono_600SemiBold
    return FAMILIES.JetBrainsMono_400Regular
  }
  if (w >= 800) return FAMILIES.Inter_800ExtraBold
  if (w >= 700) return FAMILIES.Inter_700Bold
  if (w >= 600) return FAMILIES.Inter_600SemiBold
  if (w >= 500) return FAMILIES.Inter_500Medium
  if (w >= 300) return FAMILIES.Inter_300Light
  return FAMILIES.Inter_400Regular
}

// ─── Theme context ────────────────────────────────────────────────────────────

const STORAGE_KEY = "@emergency-comms:theme-mode"
export type ThemeMode = "light" | "dark"

type ThemeCtx = {
  theme: Theme
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
}

const ThemeCtx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "dark" || saved === "light") setModeState(saved)
      })
      .finally(() => setHydrated(true))
  }, [])

  const setMode = (m: ThemeMode) => {
    setModeState(m)
    AsyncStorage.setItem(STORAGE_KEY, m)
  }

  const value: ThemeCtx = {
    theme: mode === "dark" ? DARK : LIGHT,
    mode,
    setMode,
  }

  // Keep the splash screen up until we've read the saved mode — same as fonts.
  if (!hydrated) return null

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx.theme
}

export function useThemeMode(): { mode: ThemeMode; setMode: (m: ThemeMode) => void } {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error("useThemeMode must be used inside ThemeProvider")
  return { mode: ctx.mode, setMode: ctx.setMode }
}

/** Static light tokens for non-component files that only use semantic colors. */
export const T = LIGHT
