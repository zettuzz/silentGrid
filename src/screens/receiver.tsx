import { useEffect, useMemo, useState } from "react"
import { Pressable, ScrollView, TextInput, View } from "react-native"

import { Dot } from "../components/icons"
import {
  AppBar,
  Btn,
  Card,
  Label,
  NavBar,
  Pill,
  SafeTop,
  ScrollBody,
  Shell,
  Txt,
  type Screen,
} from "../components/ui"
import { HighlightedMessage, type Field } from "../lib/extract"
import {
  type BroadcastType,
  type IncidentStatus,
  type Priority,
  useIncidents,
} from "../lib/incidents"
import { useSession } from "../lib/session"
import { useTheme } from "../theme"

function formatDateTime(at: number): string {
  return new Date(at).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function priorityColor(priority: Priority, red: string): string {
  if (priority === "HIGH") return red
  if (priority === "MED") return "#F59E0B"
  return "#22C55E"
}

function statusColor(status: IncidentStatus, red: string): string {
  if (status === "new") return red
  if (status === "acknowledged") return "#F59E0B"
  if (status === "dispatched") return "#09090B"
  return "#22C55E"
}

function nextStatus(status: IncidentStatus): IncidentStatus | null {
  if (status === "new") return "acknowledged"
  if (status === "acknowledged") return "dispatched"
  if (status === "dispatched") return "resolved"
  return null
}

function actionLabel(status: IncidentStatus): string | null {
  if (status === "new") return "Acknowledge"
  if (status === "acknowledged") return "Dispatch"
  if (status === "dispatched") return "Resolve"
  return null
}

export function ReceiverDashboard({
  onNav,
  onSelectIncident,
  onBroadcast,
}: {
  onNav: (s: Screen) => void
  onSelectIncident: (id: string) => void
  onBroadcast: () => void
}) {
  const T = useTheme()
  const { incidents, broadcasts } = useIncidents()

  const counts = useMemo(() => {
    const newCount = incidents.filter((i) => i.status === "new").length
    const high = incidents.filter((i) => i.priority === "HIGH").length
    const inProgress = incidents.filter(
      (i) => i.status === "acknowledged" || i.status === "dispatched",
    ).length
    const resolved = incidents.filter((i) => i.status === "resolved").length
    return { newCount, high, inProgress, resolved }
  }, [incidents])

  const recent = useMemo(
    () => incidents.slice(0, 3).sort((a, b) => b.createdAt - a.createdAt),
    [incidents],
  )

  return (
    <Shell>
      <SafeTop />
      <AppBar title="Base Station 01" />
      <ScrollBody>
        <Card>
          <View style={{ padding: 16, gap: 14 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Txt style={{ fontSize: 16, fontWeight: 700, color: T.text }}>
                HF Radio Link
              </Txt>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Dot color={T.green} />
                <Txt style={{ fontSize: 13, fontWeight: 600, color: T.green }}>
                  Online
                </Txt>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <View>
                <Txt style={{ fontSize: 11, color: T.muted }}>FREQUENCY</Txt>
                <Txt mono style={{ fontSize: 14, color: T.text }}>
                  7.110 MHz
                </Txt>
              </View>
              <View>
                <Txt style={{ fontSize: 11, color: T.muted }}>SIGNAL</Txt>
                <Txt style={{ fontSize: 14, color: T.text }}>Strong</Txt>
              </View>
              <View>
                <Txt style={{ fontSize: 11, color: T.muted }}>BROADCASTS</Txt>
                <Txt style={{ fontSize: 14, color: T.text }}>
                  {broadcasts.length}
                </Txt>
              </View>
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {[
            { label: "New", value: counts.newCount, color: T.red },
            { label: "High Priority", value: counts.high, color: T.red },
            { label: "In Progress", value: counts.inProgress, color: T.amber },
            { label: "Resolved", value: counts.resolved, color: T.green },
          ].map(({ label, value, color }) => (
            <View
              key={label}
              style={{
                flex: 1,
                minWidth: "45%",
                backgroundColor: T.surface,
                borderWidth: 1,
                borderColor: T.border,
                borderRadius: T.rLg,
                padding: 16,
              }}
            >
              <Txt
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color,
                  letterSpacing: -1,
                }}
              >
                {value}
              </Txt>
              <Txt style={{ fontSize: 13, color: T.sub }}>{label}</Txt>
            </View>
          ))}
        </View>

        <View>
          <Label>Recent Incidents</Label>
          <Card>
            {recent.length === 0 ? (
              <View style={{ padding: 20 }}>
                <Txt style={{ color: T.muted }}>No incidents yet.</Txt>
              </View>
            ) : (
              recent.map((inc, i) => (
                <View key={inc.id}>
                  <Pressable
                    onPress={() => onSelectIncident(inc.id)}
                    style={{ padding: 16, gap: 8 }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Pill color={priorityColor(inc.priority, T.red)}>
                          {inc.priority}
                        </Pill>
                        <Pill color={statusColor(inc.status, T.red)}>{inc.status}</Pill>
                      </View>
                      <Txt style={{ fontSize: 12, color: T.muted }}>
                        {formatDateTime(inc.createdAt)}
                      </Txt>
                    </View>
                    <Txt style={{ fontSize: 15, color: T.text }}>
                      {inc.location} · {inc.fields.map((f) => f.tag).join(" · ")}
                    </Txt>
                    <Txt mono numberOfLines={1} style={{ fontSize: 12, color: T.sub }}>
                      {inc.from}
                    </Txt>
                  </Pressable>
                  {i < recent.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: T.border,
                        marginHorizontal: 16,
                      }}
                    />
                  )}
                </View>
              ))
            )}
          </Card>
        </View>

        <Btn full onClick={onBroadcast}>
          Send Broadcast
        </Btn>
      </ScrollBody>
      <NavBar screen="receiver-dashboard" onNav={onNav} />
    </Shell>
  )
}

// ─── Incident Queue ───────────────────────────────────────────────────────────

const FILTERS = ["All", "New", "High", "In Progress", "Resolved"] as const

export function ReceiverIncidents({
  onNav,
  onSelectIncident,
}: {
  onNav: (s: Screen) => void
  onSelectIncident: (id: string) => void
}) {
  const T = useTheme()
  const { incidents } = useIncidents()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All")

  const list = useMemo(() => {
    let data = [...incidents].sort((a, b) => b.createdAt - a.createdAt)
    if (filter === "New") data = data.filter((i) => i.status === "new")
    if (filter === "High") data = data.filter((i) => i.priority === "HIGH")
    if (filter === "In Progress")
      data = data.filter(
        (i) => i.status === "acknowledged" || i.status === "dispatched",
      )
    if (filter === "Resolved") data = data.filter((i) => i.status === "resolved")
    return data
  }, [incidents, filter])

  return (
    <Shell>
      <SafeTop />
      <AppBar title="Incidents" />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: T.surface,
          borderBottomWidth: 1,
          borderBottomColor: T.border,
        }}
      >
        {FILTERS.map((f) => {
          const on = filter === f
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingVertical: 5,
                paddingHorizontal: 11,
                borderRadius: T.r,
                backgroundColor: on ? T.accent : "transparent",
              }}
            >
              <Txt
                style={{
                  fontSize: 13,
                  fontWeight: on ? 600 : 400,
                  color: on ? "#fff" : T.sub,
                }}
              >
                {f}
              </Txt>
            </Pressable>
          )
        })}
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20, gap: 12 }}>
          {list.map((inc) => (
            <Card key={inc.id}>
              <Pressable
                onPress={() => onSelectIncident(inc.id)}
                style={{ padding: 16, gap: 10 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Pill color={priorityColor(inc.priority, T.red)}>
                      {inc.priority}
                    </Pill>
                    <Pill color={statusColor(inc.status, T.red)}>{inc.status}</Pill>
                  </View>
                  {!inc.read && <Dot color={T.accent} />}
                </View>
                <Txt style={{ fontSize: 15, fontWeight: 600, color: T.text }}>
                  {inc.location}
                </Txt>
                <Txt mono style={{ fontSize: 12, color: T.sub }}>
                  {inc.fields.map((f) => f.tag).join(" · ")}
                </Txt>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 4,
                  }}
                >
                  <Txt style={{ fontSize: 12, color: T.muted }}>{inc.from}</Txt>
                  <Txt style={{ fontSize: 12, color: T.muted }}>
                    {formatDateTime(inc.createdAt)}
                  </Txt>
                </View>
              </Pressable>
            </Card>
          ))}
          {list.length === 0 && (
            <Txt style={{ textAlign: "center", color: T.muted }}>
              No incidents match this filter.
            </Txt>
          )}
        </View>
      </ScrollView>
      <NavBar screen="receiver-incidents" onNav={onNav} />
    </Shell>
  )
}

// ─── Incident Detail ──────────────────────────────────────────────────────────

function AiReadable({ fields }: { fields: Field[] }) {
  const T = useTheme()
  const [lang, setLang] = useState<"EN" | "TL">("EN")
  const by = (label: string) => fields.find((f) => f.label === label)!
  const hazard = by("Hazard").value
  const location = by("Location").value
  const eta = by("ETA").value
  const readable =
    lang === "EN"
      ? `A ${hazard.toLowerCase()} is expected in ${location} within ${eta}. Immediate evacuation is advised.`
      : `Inaasahang darating ang ${hazard.toLowerCase()} sa ${location} sa loob ng ${eta}. Inirerekomenda ang agarang paglikas.`

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Label>AI Readable</Label>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {(["EN", "TL"] as const).map((l) => (
            <Pressable
              key={l}
              onPress={() => setLang(l)}
              style={{
                paddingVertical: 5,
                paddingHorizontal: 12,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: lang === l ? T.accent : T.border,
                backgroundColor: lang === l ? T.accent : T.surface,
              }}
            >
              <Txt
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: lang === l ? "#fff" : T.sub,
                }}
              >
                {l}
              </Txt>
            </Pressable>
          ))}
        </View>
      </View>
      <Card>
        <Txt
          style={{
            fontSize: 15,
            color: T.text,
            lineHeight: 26,
            fontStyle: "italic",
            padding: 16,
          }}
        >
          {readable}
        </Txt>
      </Card>
    </View>
  )
}

export function ReceiverIncidentDetail({
  id,
  onBack,
}: {
  id: string
  onBack: () => void
}) {
  const T = useTheme()
  const { session } = useSession()
  const { incidents, updateIncidentStatus, addReply, markIncidentRead } =
    useIncidents()
  const [reply, setReply] = useState("")

  const incident = incidents.find((i) => i.id === id)

  useEffect(() => {
    markIncidentRead(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!incident) {
    return (
      <Shell>
        <SafeTop />
        <AppBar title="Incident" onBack={onBack} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Txt style={{ color: T.muted }}>Incident not found.</Txt>
        </View>
      </Shell>
    )
  }

  const next = nextStatus(incident.status)
  const nextLabel = actionLabel(incident.status)
  const by = session?.operatorName ?? "Rescuer"

  const handleAction = () => {
    if (!next) return
    updateIncidentStatus(id, next, by)
  }

  const handleReply = () => {
    if (!reply.trim()) return
    addReply(id, reply.trim())
    setReply("")
  }

  return (
    <Shell>
      <SafeTop />
      <AppBar title="Incident" onBack={onBack} />
      <ScrollBody>
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Pill color={priorityColor(incident.priority, T.red)}>
              {incident.priority}
            </Pill>
            <Pill color={statusColor(incident.status, T.red)}>{incident.status}</Pill>
            <Txt style={{ fontSize: 12, color: T.muted }}>
              {formatDateTime(incident.createdAt)}
            </Txt>
          </View>
          <Txt
            style={{
              fontSize: 13,
              color: T.muted,
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            From {incident.from}
          </Txt>
        </View>

        <View>
          <Label>Original Message</Label>
          <View
            style={{
              backgroundColor: T.banner,
              borderRadius: T.rLg,
              padding: 20,
            }}
          >
            <HighlightedMessage
              text={incident.message}
              step={incident.fields.length}
              fields={incident.fields}
            />
          </View>
        </View>

        <View>
          <Label>Extracted Data</Label>
          <Card>
            {incident.fields.map(({ label, value, tag, color }, i) => (
              <View key={label}>
                <View
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Txt
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.muted,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        marginBottom: 2,
                      }}
                    >
                      {label}
                    </Txt>
                    <Txt
                      style={{ fontSize: 15, fontWeight: 500, color: T.text }}
                    >
                      {value}
                    </Txt>
                  </View>
                  <Pill color={color}>{tag}</Pill>
                </View>
                {i < incident.fields.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: T.border,
                      marginHorizontal: 16,
                    }}
                  />
                )}
              </View>
            ))}
          </Card>
        </View>

        <Card>
          <View
            style={{
              paddingVertical: 13,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Dot color={incident.validation === "passed" ? T.green : T.amber} />
            <Txt style={{ fontSize: 14, color: T.text }}>
              {incident.validation === "passed"
                ? "Validation passed"
                : "Needs manual review"}
            </Txt>
          </View>
        </Card>

        <AiReadable fields={incident.fields} />

        <View>
          <Label>Timeline</Label>
          <Card>
            {incident.timeline.map((entry, i) => (
              <View key={i}>
                <View
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Txt
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: T.text,
                      textTransform: "capitalize",
                    }}
                  >
                    {entry.status}
                  </Txt>
                  <View style={{ alignItems: "flex-end" }}>
                    <Txt style={{ fontSize: 12, color: T.muted }}>
                      {formatDateTime(entry.at)}
                    </Txt>
                    <Txt style={{ fontSize: 11, color: T.sub }}>{entry.by}</Txt>
                  </View>
                </View>
                {i < incident.timeline.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: T.border,
                      marginHorizontal: 16,
                    }}
                  />
                )}
              </View>
            ))}
          </Card>
        </View>

        {incident.replies.length > 0 && (
          <View>
            <Label>Replies</Label>
            <View style={{ gap: 8 }}>
              {incident.replies.map((r) => (
                <Card key={r.id}>
                  <View style={{ padding: 14, gap: 4 }}>
                    <Txt style={{ fontSize: 13, color: T.text }}>{r.text}</Txt>
                    <Txt style={{ fontSize: 11, color: T.muted }}>
                      {formatDateTime(r.at)}
                    </Txt>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {next && (
          <Btn full onClick={handleAction}>
            {nextLabel}
          </Btn>
        )}

        <View style={{ gap: 8 }}>
          <Label>Reply to Sender</Label>
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder="Type a short update…"
            placeholderTextColor={T.muted}
            multiline
            style={{
              minHeight: 80,
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.r,
              padding: 14,
              fontSize: 15,
              color: T.text,
            }}
          />
          <Btn full variant="outline" onClick={handleReply}>
            Send Reply
          </Btn>
        </View>
      </ScrollBody>
    </Shell>
  )
}

// ─── Broadcast ────────────────────────────────────────────────────────────────

const AUDIENCES: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Barangay 5", value: "Barangay 5" },
  { label: "Barangay 2", value: "Barangay 2" },
  { label: "Barangay 3", value: "Barangay 3" },
  { label: "Barangay 1", value: "Barangay 1" },
]

const TYPES: { label: string; value: BroadcastType }[] = [
  { label: "Advisory", value: "advisory" },
  { label: "Evacuation", value: "evacuation" },
  { label: "All-clear", value: "all-clear" },
]

const PRIORITIES: { label: string; value: Priority }[] = [
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MED" },
  { label: "Low", value: "LOW" },
]

export function ReceiverBroadcast({
  onNav,
  onSent,
}: {
  onNav: (s: Screen) => void
  onSent: () => void
}) {
  const T = useTheme()
  const { addBroadcast } = useIncidents()
  const [audience, setAudience] = useState("all")
  const [type, setType] = useState<BroadcastType>("advisory")
  const [priority, setPriority] = useState<Priority>("HIGH")
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (!message.trim()) return
    addBroadcast({
      audience,
      type,
      priority,
      message: message.trim(),
    })
    setMessage("")
    onSent()
  }

  return (
    <Shell>
      <SafeTop />
      <AppBar title="Broadcast" />
      <ScrollBody>
        <View>
          <Label>Audience</Label>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            {AUDIENCES.map((a) => (
              <Pressable
                key={a.value}
                onPress={() => setAudience(a.value)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: audience === a.value ? T.accent : T.card,
                }}
              >
                <Txt
                  style={{
                    fontSize: 13,
                    fontWeight: audience === a.value ? 600 : 400,
                    color: audience === a.value ? "#fff" : T.sub,
                  }}
                >
                  {a.label}
                </Txt>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View>
          <Label>Type</Label>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {TYPES.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => setType(t.value)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: type === t.value ? T.accent : T.card,
                }}
              >
                <Txt
                  style={{
                    fontSize: 13,
                    fontWeight: type === t.value ? 600 : 400,
                    color: type === t.value ? "#fff" : T.sub,
                  }}
                >
                  {t.label}
                </Txt>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Label>Priority</Label>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                onPress={() => setPriority(p.value)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: priority === p.value ? T.accent : T.card,
                }}
              >
                <Txt
                  style={{
                    fontSize: 13,
                    fontWeight: priority === p.value ? 600 : 400,
                    color: priority === p.value ? "#fff" : T.sub,
                  }}
                >
                  {p.label}
                </Txt>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Label>Message</Label>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type the broadcast message…"
            placeholderTextColor={T.muted}
            multiline
            textAlignVertical="top"
            style={{
              minHeight: 140,
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.r,
              padding: 16,
              fontSize: 15,
              color: T.text,
              lineHeight: 24,
            }}
          />
        </View>

        <Btn full onClick={handleSend}>
          Send Broadcast
        </Btn>
      </ScrollBody>
      <NavBar screen="receiver-broadcast" onNav={onNav} />
    </Shell>
  )
}
