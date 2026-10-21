import { useMemo, useState } from "react"
import { Pressable, ScrollView, View } from "react-native"

import { Dot, Icon } from "../components/icons"
import {
  AppBar,
  Btn,
  Card,
  Label,
  NavBar,
  SafeTop,
  ScrollBody,
  Shell,
  Toggle,
  Txt,
  type Screen,
} from "../components/ui"
import { GUEST_SENDER, useIncidents, type Incident, type Broadcast } from "../lib/incidents"
import { useSession } from "../lib/session"
import { useTheme, useThemeMode } from "../theme"

// ─── Screen: Inbox ────────────────────────────────────────────────────────────

type InboxItem = {
  id: string
  kind: "incident" | "broadcast"
  from: string
  preview: string
  at: number
  unread: boolean
  color: string
}

function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function priorityColor(priority: string, red: string): string {
  if (priority === "HIGH") return red
  if (priority === "MED") return "#F59E0B"
  return "#22C55E"
}

function buildInboxItems(
  incidents: Incident[],
  broadcasts: Broadcast[],
  red: string,
): InboxItem[] {
  const ownIncidents = incidents.filter((inc) => inc.from === GUEST_SENDER)
  const incidentItems: InboxItem[] = ownIncidents.map((inc) => {
    const latestReply = inc.replies[inc.replies.length - 1]
    const preview = latestReply
      ? `Rescuer: ${latestReply.text}`
      : `${inc.status.toUpperCase()} · ${inc.fields.map((f) => f.tag).join(" · ")}`
    return {
      id: inc.id,
      kind: "incident",
      from: "My Report",
      preview,
      at: latestReply ? latestReply.at : inc.createdAt,
      unread: !inc.read,
      color: priorityColor(inc.priority, red),
    }
  })
  const broadcastItems: InboxItem[] = broadcasts.map((b) => ({
    id: `b-${b.id}`,
    kind: "broadcast",
    from: b.audience === "all" ? "Base Station 01" : `Barangay ${b.audience}`,
    preview: b.message,
    at: b.createdAt,
    unread: true,
    color: priorityColor(b.priority, red),
  }))
  return [...incidentItems, ...broadcastItems].sort((a, b) => b.at - a.at)
}

export function ScreenInbox({ onNav }: { onNav: (s: Screen) => void }) {
  const T = useTheme()
  const { incidents, broadcasts, markIncidentRead } = useIncidents()
  const [tab, setTab] = useState("All")
  const all = useMemo(
    () => buildInboxItems(incidents, broadcasts, T.red),
    [incidents, broadcasts, T.red],
  )
  const list = tab === "Unread" ? all.filter((m) => m.unread) : all
  return (
    <Shell>
      <SafeTop />
      <AppBar title="Inbox" />
      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingVertical: 12,
          paddingHorizontal: 20,
          backgroundColor: T.surface,
          borderBottomWidth: 1,
          borderBottomColor: T.border,
          flexShrink: 0,
        }}
      >
        {["All", "Unread", "Favorites"].map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: tab === t ? T.accent : T.card,
            }}
          >
            <Txt
              style={{
                fontSize: 13,
                fontWeight: tab === t ? 600 : 400,
                color: tab === t ? "#fff" : T.sub,
              }}
            >
              {t}
            </Txt>
          </Pressable>
        ))}
      </View>
      <ScrollView style={{ flex: 1 }}>
        {list.map((msg, i) => (
          <View key={msg.id}>
            <Pressable
              onPress={() =>
                msg.kind === "incident" ? markIncidentRead(msg.id) : undefined
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                paddingHorizontal: 20,
              }}
            >
              <Dot color={msg.unread ? T.accent : "transparent"} />
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: T.card,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Txt style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
                  {msg.from[0]}
                </Txt>
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Txt
                    style={{
                      fontSize: 14,
                      fontWeight: msg.unread ? 700 : 500,
                      color: T.text,
                    }}
                  >
                    {msg.from}
                  </Txt>
                  <Txt style={{ fontSize: 12, color: T.muted }}>
                    {formatTime(msg.at)}
                  </Txt>
                </View>
                <Txt
                  mono
                  numberOfLines={1}
                  style={{ fontSize: 12, color: T.sub }}
                >
                  {msg.preview}
                </Txt>
              </View>
              {Icon.ChevronRight(T.muted)}
            </Pressable>
            {i < list.length - 1 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: T.border,
                  marginLeft: 62,
                  marginRight: 20,
                }}
              />
            )}
          </View>
        ))}
      </ScrollView>
      <NavBar screen="inbox" onNav={onNav} />
    </Shell>
  )
}

// ─── Screen: Settings ────────────────────────────────────────────────────────

export function ScreenSettings({ onNav }: { onNav: (s: Screen) => void }) {
  const T = useTheme()
  const { mode, setMode } = useThemeMode()
  const { session, logout } = useSession()
  const role = session?.role ?? "guest"
  const operatorName = session?.operatorName
  const [autoTx, setAutoTx] = useState(true)
  type SectionRow = {
    label: string
    value?: string
    toggle?: boolean
    chevron?: boolean
  }
  const sections: { title: string; rows: SectionRow[] }[] = [
    {
      title: "Account",
      rows: [
        {
          label: "Signed in as",
          value: role === "guest" ? "Guest User" : operatorName ?? "Rescuer",
        },
      ],
    },
    {
      title: "Communication",
      rows: [
        { label: "Connection Mode", value: "HF Radio" },
        { label: "Preferred Frequency", value: "7.110 MHz" },
        { label: "Auto Transmit", toggle: true },
      ],
    },
    {
      title: "App Preferences",
      rows: [
        { label: "Language", value: "English" },
        { label: "Theme", toggle: true },
      ],
    },
    {
      title: "About",
      rows: [
        { label: "App Version", value: "1.0.0" },
        { label: "About", chevron: true },
      ],
    },
  ]

  return (
    <Shell>
      <SafeTop />
      <AppBar title="Settings" />
      <ScrollBody>
        {sections.map(({ title, rows }) => (
          <View key={title}>
            <Label>{title}</Label>
            <Card>
              {rows.map(({ label, value, toggle, chevron }, i) => (
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
                    <Txt style={{ fontSize: 15, color: T.text }}>{label}</Txt>
                    {toggle ? (
                      <Toggle
                        on={label === "Theme" ? mode === "dark" : autoTx}
                        onToggle={() =>
                          label === "Theme"
                            ? setMode(mode === "dark" ? "light" : "dark")
                            : setAutoTx((p) => !p)
                        }
                      />
                    ) : chevron ? (
                      Icon.ChevronRight()
                    ) : (
                      <Txt style={{ fontSize: 14, color: T.muted }}>{value}</Txt>
                    )}
                  </View>
                  {i < rows.length - 1 && (
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
        ))}
        <View style={{ marginTop: 4 }}>
          <Btn full variant="outline" onClick={logout}>
            {role === "guest" ? "Switch Role" : "Log out"}
          </Btn>
        </View>
      </ScrollBody>
      <NavBar screen="settings" onNav={onNav} />
    </Shell>
  )
}
