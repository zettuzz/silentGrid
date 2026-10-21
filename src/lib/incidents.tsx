import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

import { extractFields, type Field } from "./extract"
import { GUEST_SENDER } from "./session"

export type IncidentStatus = "new" | "acknowledged" | "dispatched" | "resolved"
export type ValidationState = "passed" | "needs_review"
export type Priority = "HIGH" | "MED" | "LOW"

export type TimelineEntry = {
  status: IncidentStatus
  at: number
  by: string
}

export type Reply = {
  id: string
  from: "rescuer" | "system"
  text: string
  at: number
}

export type Incident = {
  id: string
  createdAt: number
  from: string
  message: string
  fields: Field[]
  priority: Priority
  status: IncidentStatus
  validation: ValidationState
  location: string
  assignedTo?: string
  timeline: TimelineEntry[]
  replies: Reply[]
  read: boolean
}

export type BroadcastAudience = "all" | string
export type BroadcastType = "advisory" | "evacuation" | "all-clear"

export type Broadcast = {
  id: string
  createdAt: number
  audience: BroadcastAudience
  type: BroadcastType
  priority: Priority
  message: string
}

type IncidentsCtx = {
  incidents: Incident[]
  broadcasts: Broadcast[]
  addIncident: (
    payload: Omit<
      Incident,
      "id" | "createdAt" | "timeline" | "replies" | "read"
    >,
  ) => string
  updateIncidentStatus: (id: string, status: IncidentStatus, by: string) => void
  addReply: (id: string, text: string) => void
  markIncidentRead: (id: string) => void
  addBroadcast: (payload: Omit<Broadcast, "id" | "createdAt">) => void
}

const INCIDENTS_KEY = "@emergency-comms:incidents"
const BROADCASTS_KEY = "@emergency-comms:broadcasts"

const id = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36)

export function priorityFromFields(fields: Field[]): Priority {
  const value = fields.find((f) => f.label === "Priority")?.value.toLowerCase() ?? ""
  if (value.includes("high")) return "HIGH"
  if (value.includes("medium") || value.includes("moderate")) return "MED"
  return "LOW"
}

export function locationFromFields(fields: Field[]): string {
  return fields.find((f) => f.label === "Location")?.value ?? "Unknown"
}

const makeIncident = (
  message: string,
  from: string,
  status: IncidentStatus,
  overrides?: Partial<Incident>,
): Incident => {
  const fields = extractFields(message)
  const now = Date.now()
  return {
    id: id(),
    createdAt: now,
    from,
    message,
    fields,
    priority: priorityFromFields(fields),
    status,
    validation: "passed",
    location: locationFromFields(fields),
    timeline: [{ status, at: now, by: from }],
    replies: [],
    read: false,
    ...overrides,
  }
}

const seedIncidents = (): Incident[] => {
  const base = Date.now()
  return [
    makeIncident(
      "May bagyo, kailangan mag evacuate sa Brgy 5 within 2 hours",
      "Barangay 5 Resident",
      "acknowledged",
      { createdAt: base - 1000 * 60 * 35, read: false },
    ),
    makeIncident(
      "Medical emergency, 3 injured in Brgy 2 due to landslide, need medevac",
      "Barangay 2 Watch",
      "new",
      { createdAt: base - 1000 * 60 * 22, read: false },
    ),
    makeIncident(
      "Relief supplies needed in Brgy 3, food and water",
      "Barangay 3 Coordinator",
      "dispatched",
      { createdAt: base - 1000 * 60 * 60 * 2, read: true },
    ),
    makeIncident(
      "Situation report Brgy 1 all clear after the typhoon",
      "Barangay 1 Captain",
      "resolved",
      { createdAt: base - 1000 * 60 * 60 * 5, read: true },
    ),
  ]
}

const seedBroadcasts = (): Broadcast[] => [
  {
    id: id(),
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    audience: "all",
    type: "advisory",
    priority: "HIGH",
    message:
      "Storm surge advisory: residents of Barangay 5 are advised to prepare for evacuation.",
  },
]

const IncidentsCtx = createContext<IncidentsCtx | null>(null)

export function IncidentsProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(INCIDENTS_KEY),
      AsyncStorage.getItem(BROADCASTS_KEY),
    ]).then(([rawIncidents, rawBroadcasts]) => {
      let loadedIncidents: Incident[] = []
      if (rawIncidents) {
        try {
          loadedIncidents = JSON.parse(rawIncidents)
        } catch {}
      }
      if (loadedIncidents.length === 0) loadedIncidents = seedIncidents()

      let loadedBroadcasts: Broadcast[] = []
      if (rawBroadcasts) {
        try {
          loadedBroadcasts = JSON.parse(rawBroadcasts)
        } catch {}
      }
      if (loadedBroadcasts.length === 0) loadedBroadcasts = seedBroadcasts()

      setIncidents(loadedIncidents)
      setBroadcasts(loadedBroadcasts)
      setHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!hydrated) return
    AsyncStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents))
    AsyncStorage.setItem(BROADCASTS_KEY, JSON.stringify(broadcasts))
  }, [incidents, broadcasts, hydrated])

  const addIncident: IncidentsCtx["addIncident"] = (payload) => {
    const incident: Incident = {
      ...payload,
      id: id(),
      createdAt: Date.now(),
      timeline: [{ status: "new", at: Date.now(), by: payload.from }],
      replies: [],
      read: true,
    }
    setIncidents((prev) => [incident, ...prev])
    return incident.id
  }

  const updateIncidentStatus: IncidentsCtx["updateIncidentStatus"] = (
    incidentId,
    status,
    by,
  ) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status,
              read: false,
              timeline: [...inc.timeline, { status, at: Date.now(), by }],
            }
          : inc,
      ),
    )
  }

  const addReply: IncidentsCtx["addReply"] = (incidentId, text) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              read: false,
              replies: [
                ...inc.replies,
                { id: id(), from: "rescuer", text, at: Date.now() },
              ],
            }
          : inc,
      ),
    )
  }

  const markIncidentRead: IncidentsCtx["markIncidentRead"] = (incidentId) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, read: true } : inc)),
    )
  }

  const addBroadcast: IncidentsCtx["addBroadcast"] = (payload) => {
    const broadcast: Broadcast = { ...payload, id: id(), createdAt: Date.now() }
    setBroadcasts((prev) => [broadcast, ...prev])
  }

  const value: IncidentsCtx = {
    incidents,
    broadcasts,
    addIncident,
    updateIncidentStatus,
    addReply,
    markIncidentRead,
    addBroadcast,
  }

  if (!hydrated) return null
  return <IncidentsCtx.Provider value={value}>{children}</IncidentsCtx.Provider>
}

export function useIncidents(): IncidentsCtx {
  const ctx = useContext(IncidentsCtx)
  if (!ctx) throw new Error("useIncidents must be used inside IncidentsProvider")
  return ctx
}

export { GUEST_SENDER }
