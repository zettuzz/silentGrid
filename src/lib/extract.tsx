import React from "react"
import { Text } from "react-native"

import { T, ff } from "../theme"
import { Txt } from "../components/ui"

export type Field = {
  label: string
  value: string
  tag: string
  color: string
  match: string
}

export const DEFAULT_FIELDS: Field[] = [
  {
    label: "Event",
    value: "EVAC — Evacuation",
    tag: "EVAC",
    color: T.red,
    match: "",
  },
  { label: "Hazard", value: "Storm", tag: "STORM", color: T.amber, match: "" },
  {
    label: "Location",
    value: "Barangay 5",
    tag: "BRGY5",
    color: T.accent,
    match: "",
  },
  { label: "ETA", value: "2 hours", tag: "2H", color: T.sub, match: "" },
  { label: "Priority", value: "High", tag: "HIGH", color: T.red, match: "" },
]

export function extractFields(message: string): Field[] {
  const find = (...words: string[]) => {
    for (const w of words) {
      const m = message.match(new RegExp(`\\b${w}[a-zñ]*`, "i"))
      if (m) return { found: true, matched: m[0] }
    }
    return { found: false, matched: "" }
  }

  // Event
  let ev = find("evacuat", "likas")
  let event: Field
  if (ev.found)
    event = {
      label: "Event",
      value: "EVAC — Evacuation",
      tag: "EVAC",
      color: T.red,
      match: ev.matched,
    }
  else if ((ev = find("medic", "injured", "sugat")).found)
    event = {
      label: "Event",
      value: "MED — Medical",
      tag: "MED",
      color: T.accent,
      match: ev.matched,
    }
  else if ((ev = find("relief")).found)
    event = {
      label: "Event",
      value: "RELIEF — Relief",
      tag: "RELIEF",
      color: T.green,
      match: ev.matched,
    }
  else if ((ev = find("sitrep")).found)
    event = {
      label: "Event",
      value: "SITREP — Situation Report",
      tag: "SITREP",
      color: T.sub,
      match: ev.matched,
    }
  else if ((ev = find("fire", "sunog")).found)
    event = {
      label: "Event",
      value: "FIRE — Fire",
      tag: "FIRE",
      color: T.red,
      match: ev.matched,
    }
  else event = DEFAULT_FIELDS[0]

  // Hazard
  let hz = find("bagyo", "storm", "typhoon")
  let hazard: Field
  if (hz.found)
    hazard = {
      label: "Hazard",
      value: "Storm",
      tag: "STORM",
      color: T.amber,
      match: hz.matched,
    }
  else if ((hz = find("baha", "flood")).found)
    hazard = {
      label: "Hazard",
      value: "Flood",
      tag: "FLOOD",
      color: T.accent,
      match: hz.matched,
    }
  else if ((hz = find("lindol", "earthquake", "quake")).found)
    hazard = {
      label: "Hazard",
      value: "Earthquake",
      tag: "QUAKE",
      color: T.amber,
      match: hz.matched,
    }
  else if ((hz = find("sunog", "fire")).found)
    hazard = {
      label: "Hazard",
      value: "Fire",
      tag: "FIRE",
      color: T.red,
      match: hz.matched,
    }
  else if ((hz = find("landslide", "pagguho")).found)
    hazard = {
      label: "Hazard",
      value: "Landslide",
      tag: "SLIDE",
      color: T.amber,
      match: hz.matched,
    }
  else hazard = DEFAULT_FIELDS[1]

  // Location
  const locMatch = message.match(/(?:brgy|barangay)\s*\.?\s*(\d+)/i)
  const location: Field = locMatch
    ? {
        label: "Location",
        value: `Barangay ${locMatch[1]}`,
        tag: `BRGY${locMatch[1]}`,
        color: T.accent,
        match: locMatch[0],
      }
    : DEFAULT_FIELDS[2]

  // ETA
  const etaMatch = message.match(
    /(?:within|sa loob ng|in)?\s*(\d+)\s*(?:hours?|hrs?|oras)/i,
  )
  const eta: Field = etaMatch
    ? {
        label: "ETA",
        value: `${etaMatch[1]} hours`,
        tag: `${etaMatch[1]}H`,
        color: T.sub,
        match: etaMatch[0],
      }
    : DEFAULT_FIELDS[3]

  // Priority
  let pr = find("urgent", "critical", "emergency", "high")
  let priority: Field
  if (pr.found)
    priority = {
      label: "Priority",
      value: "High",
      tag: "HIGH",
      color: T.red,
      match: pr.matched,
    }
  else if ((pr = find("medium", "moderate")).found)
    priority = {
      label: "Priority",
      value: "Medium",
      tag: "MEDIUM",
      color: T.amber,
      match: pr.matched,
    }
  else if ((pr = find("low")).found)
    priority = {
      label: "Priority",
      value: "Low",
      tag: "LOW",
      color: T.green,
      match: pr.matched,
    }
  else priority = DEFAULT_FIELDS[4]

  return [event, hazard, location, eta, priority]
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "")
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  )
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

export function HighlightedMessage({
  text,
  step,
  fields,
}: {
  text: string
  step: number
  fields: Field[]
}) {
  const matches = fields
    .map((f, i) => {
      if (!f.match) return null
      const start = text.toLowerCase().indexOf(f.match.toLowerCase())
      return start >= 0
        ? { i, start, end: start + f.match.length, color: f.color }
        : null
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => a.start - b.start)

  const segments: React.ReactNode[] = []
  let cursor = 0
  matches.forEach((m, idx) => {
    if (m.start > cursor) {
      segments.push(text.slice(cursor, m.start))
    }
    const segStart = Math.max(m.start, cursor)
    if (m.end <= segStart) return
    const revealed = m.i < step
    segments.push(
      <Text
        key={`m${idx}`}
        style={{
          backgroundColor: revealed ? hexToRgba(m.color, 0.55) : "transparent",
          color: revealed ? "#fff" : "rgba(255,255,255,0.5)",
          fontWeight: revealed ? 700 : 400,
          fontFamily: revealed ? ff(700) : ff(400),
          borderRadius: 4,
          paddingHorizontal: 3,
          marginHorizontal: 1,
        }}
      >
        {text.slice(segStart, m.end)}
      </Text>,
    )
    cursor = Math.max(cursor, m.end)
  })
  if (cursor < text.length) {
    segments.push(text.slice(cursor))
  }

  return (
    <Txt style={{ fontSize: 15, color: "#fff", lineHeight: 25 }}>
      {segments}
    </Txt>
  )
}
