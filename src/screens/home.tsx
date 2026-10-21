import { Pressable, TextInput, View } from "react-native"

import { Dot, Icon } from "../components/icons"
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
import { useTheme } from "../theme"

// ─── Screen: Home ─────────────────────────────────────────────────────────────

const STATUS = [
  { label: "HF Radio", val: "Online", ok: true },
  { label: "Frequency", val: "7.110 MHz", ok: true },
  { label: "Base Station 01", val: "Connected", ok: true },
]

export function ScreenHome({ onNav }: { onNav: (s: Screen) => void }) {
  const T = useTheme()
  const recents = [
    {
      from: "Base Station 01",
      code: "EVAC · BRGY5",
      time: "9:41",
      priority: "HIGH",
      color: T.red,
    },
    {
      from: "Command Center",
      code: "MED · BRGY2",
      time: "9:30",
      priority: "MED",
      color: T.amber,
    },
  ]

  return (
    <Shell>
      <SafeTop />
      <ScrollBody>
        {/* Header */}
        <View style={{ paddingTop: 8, paddingBottom: 4 }}>
          <Txt
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: T.muted,
              marginBottom: 4,
            }}
          >
            Emergency Comms
          </Txt>
          <Txt
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: T.text,
              letterSpacing: -1,
              lineHeight: 31,
            }}
          >
            Dashboard
          </Txt>
        </View>

        {/* Status banner */}
        <View style={{ backgroundColor: T.banner, borderRadius: T.rLg, padding: 20 }}>
          <Txt
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#555",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            System
          </Txt>
          {STATUS.map(({ label, val, ok }) => (
            <View
              key={label}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Txt style={{ fontSize: 14, color: "#888" }}>{label}</Txt>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Dot color={ok ? T.green : T.red} />
                <Txt
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: ok ? T.green : T.red,
                  }}
                >
                  {val}
                </Txt>
              </View>
            </View>
          ))}
        </View>

        {/* Quick actions — was a 2-column grid, now a flex row */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={() => onNav("new-message")}
            style={{
              flex: 1,
              backgroundColor: T.accent,
              borderRadius: T.rLg,
              padding: 20,
              paddingHorizontal: 16,
              alignItems: "flex-start",
            }}
          >
            <View style={{ marginBottom: 10 }}>{Icon.Send()}</View>
            <Txt style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
              New Message
            </Txt>
            <Txt
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                marginTop: 3,
              }}
            >
              Send alert
            </Txt>
          </Pressable>
          <Pressable
            onPress={() => onNav("inbox")}
            style={{
              flex: 1,
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.rLg,
              padding: 20,
              paddingHorizontal: 16,
              alignItems: "flex-start",
            }}
          >
            <View style={{ marginBottom: 10 }}>{Icon.Inbox(T.text)}</View>
            <Txt style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Inbox</Txt>
            <Txt style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
              2 unread
            </Txt>
          </Pressable>
        </View>

        {/* Recent */}
        <View>
          <Label>Recent</Label>
          <Card>
            {recents.map(({ from, code, time, priority, color }, i) => (
              <View key={from}>
                <View
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: T.card,
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Txt style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
                      {from[0]}
                    </Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Txt style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                        {from}
                      </Txt>
                      <Txt style={{ fontSize: 12, color: T.muted }}>{time}</Txt>
                    </View>
                    <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                      <Pill color={color}>{priority}</Pill>
                      <Txt mono style={{ fontSize: 12, color: T.sub }}>
                        {code}
                      </Txt>
                    </View>
                  </View>
                </View>
                {i < recents.length - 1 && (
                  <View
                    style={{ height: 1, backgroundColor: T.border, marginHorizontal: 16 }}
                  />
                )}
              </View>
            ))}
          </Card>
        </View>
      </ScrollBody>
      <NavBar screen="home" onNav={onNav} />
    </Shell>
  )
}

// ─── Screen: New Message ──────────────────────────────────────────────────────

export function ScreenNew({
  value,
  onChange,
  onNext,
  onNav,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  onNav: (s: Screen) => void
}) {
  const T = useTheme()
  return (
    <Shell>
      <SafeTop />
      <AppBar title="New Message" />
      <ScrollBody>
        {/* To */}
        <View>
          <Label>Recipient</Label>
          <View
            style={{
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.r,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Txt
              style={{ fontSize: 12, fontWeight: 700, color: T.muted }}
            >
              TO
            </Txt>
            <View style={{ width: 1, height: 14, backgroundColor: T.border }} />
            <Txt
              style={{ fontSize: 15, fontWeight: 500, color: T.text, flex: 1 }}
            >
              Base Station 01
            </Txt>
            {Icon.ChevronRight()}
          </View>
        </View>

        {/* Message */}
        <View style={{ flex: 1, flexDirection: "column" }}>
          <Label>Message</Label>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Type your emergency message..."
            placeholderTextColor={T.muted}
            multiline
            textAlignVertical="top"
            style={{
              minHeight: 180,
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.r,
              padding: 16,
              fontSize: 16,
              color: T.text,
              lineHeight: 26,
            }}
          />
        </View>

        {/* Hint */}
        <View
          style={{
            backgroundColor: "#FEF2F2",
            borderRadius: T.r,
            paddingVertical: 13,
            paddingHorizontal: 14,
            flexDirection: "row",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: T.accent,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            {Icon.Info()}
          </View>
          <Txt style={{ flex: 1, fontSize: 13, color: "#B91C1C", lineHeight: 20 }}>
            AI will extract emergency data automatically before sending.
          </Txt>
        </View>

        <Btn full onClick={onNext}>
          Extract &amp; Review
        </Btn>
      </ScrollBody>
      <NavBar screen="new-message" onNav={onNav} />
    </Shell>
  )
}
