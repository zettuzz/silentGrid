import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Role = "guest" | "rescuer"

export type Session = {
  role: Role
  operatorName?: string
}

type SessionCtx = {
  session: Session | null
  hydrated: boolean
  continueAsGuest: () => void
  loginRescuer: (username: string, password: string) => boolean
  logout: () => void
}

const STORAGE_KEY = "@emergency-comms:session"

const DEMO_RESCUER = {
  username: "rescuer",
  password: "silentgrid",
  operatorName: "Rescuer",
}

const SessionCtx = createContext<SessionCtx | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSession(JSON.parse(raw))
      })
      .finally(() => setHydrated(true))
  }, [])

  const persist = (s: Session | null) => {
    setSession(s)
    if (s) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    else AsyncStorage.removeItem(STORAGE_KEY)
  }

  const continueAsGuest = () => persist({ role: "guest" })

  const loginRescuer = (username: string, password: string) => {
    if (
      username === DEMO_RESCUER.username &&
      password === DEMO_RESCUER.password
    ) {
      persist({ role: "rescuer", operatorName: DEMO_RESCUER.operatorName })
      return true
    }
    return false
  }

  const logout = () => persist(null)

  const value: SessionCtx = {
    session,
    hydrated,
    continueAsGuest,
    loginRescuer,
    logout,
  }

  if (!hydrated) return null
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>
}

export function useSession(): SessionCtx {
  const ctx = useContext(SessionCtx)
  if (!ctx) throw new Error("useSession must be used inside SessionProvider")
  return ctx
}

export const GUEST_SENDER = "Guest User"
