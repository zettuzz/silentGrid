import React, { useEffect, useState } from "react"
import { Pressable, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import { Antenna, Pulse, Scanline, Spinner } from "../components/animations"
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
import { HighlightedMessage, type Field } from "../lib/extract"
import { useTheme } from "../theme"

// ─── Reveal ───────────────────────────────────────────────────────────────────
// Replacement for the CSS `transition: opacity .4s, transform .4s` used on the
// extraction and validation rows.

export function Reveal({
  revealed,
  children,
}: {
  revealed: boolean
  children: React.ReactNode
}) {
  const opacity = useSharedValue(0)
  const tx = useSharedValue(-16)
  useEffect(() => {
    opacity.value = withTiming(revealed ? 1 : 0, { duration: 400 })
    tx.value = withTiming(revealed ? 0 : -16, { duration: 400 })
  }, [revealed, opacity, tx])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }],
  }))

  return <Animated.View style={style}>{children}</Animated.View>
}

// ─── Screen: Extracting ───────────────────────────────────────────────────────

export function ScreenExtracting({
  message,
  fields,
  onContinue,
}: {
  message: string
  fields: Field[]
  onContinue: () => void
}) {
  const T = useTheme()
  const [step, setStep] = useState(0)
  const [cardW, setCardW] = useState(0)
  const done = step >= fields.length

  useEffect(() => {
    const timers = fields.map((_, i) =>
      setTimeout(() => setStep(i + 1), 300 + i * 540),
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Shell onClick={done ? onContinue : undefined}>
      <SafeTop />
      <AppBar title="Extracting Data" />
      <ScrollBody>
        {/* Message card */}
        <View
          onLayout={(e) => setCardW(e.nativeEvent.layout.width)}
          style={{
            backgroundColor: T.banner,
            borderRadius: T.rLg,
            padding: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Txt
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#555",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Analyzing Message
          </Txt>
          <HighlightedMessage text={message} step={step} fields={fields} />
          {!done && cardW > 0 && <Scanline width={cardW} />}
        </View>

        {/* Extracted chips */}
        <View>
          <Label>Extracted Data</Label>
          <Card>
            {fields.map(({ label, value, tag, color }, i) => {
              const revealed = i < step
              return (
                <View key={label}>
                  <Reveal revealed={revealed}>
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
                        <Txt style={{ fontSize: 15, fontWeight: 500, color: T.text }}>
                          {value}
                        </Txt>
                      </View>
                      <Pill color={color}>{tag}</Pill>
                    </View>
                  </Reveal>
                  {i < fields.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: T.border,
                        marginHorizontal: 16,
                        opacity: revealed ? 1 : 0,
                      }}
                    />
                  )}
                </View>
              )
            })}
          </Card>
        </View>

        {/* Status */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            justifyContent: "center",
            paddingVertical: 4,
            paddingBottom: 8,
          }}
        >
          {done ? (
            <>
              <Dot color={T.green} />
              <Txt style={{ fontSize: 14, fontWeight: 600, color: T.green }}>
                Extraction complete — tap to continue
              </Txt>
            </>
          ) : (
            <Txt style={{ fontSize: 14, color: T.muted }}>
              Extracting {fields[Math.min(step, fields.length - 1)].label}…
            </Txt>
          )}
        </View>
      </ScrollBody>
    </Shell>
  )
}

// ─── Screen: Confirm ─────────────────────────────────────────────────────────

export function ScreenConfirm({
  onBack,
  onConfirm,
  onEdit,
  onNav,
  fields,
}: {
  onBack: () => void
  onConfirm: () => void
  onEdit: () => void
  onNav: (s: Screen) => void
  fields: Field[]
}) {
  const T = useTheme()
  return (
    <Shell>
      <SafeTop />
      <AppBar title="Confirm Details" onBack={onBack} />
      <ScrollBody>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Dot color={T.green} />
          <Txt style={{ fontSize: 13, fontWeight: 600, color: T.green }}>
            AI Extracted
          </Txt>
          <Txt style={{ fontSize: 13, color: T.muted }}>· Review before sending</Txt>
        </View>

        <Card>
          {fields.map(({ label, value, tag, color }, i) => (
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
                  <Txt style={{ fontSize: 15, fontWeight: 500, color: T.text }}>
                    {value}
                  </Txt>
                </View>
                <Pill color={color}>{tag}</Pill>
              </View>
              {i < fields.length - 1 && (
                <View
                  style={{ height: 1, backgroundColor: T.border, marginHorizontal: 16 }}
                />
              )}
            </View>
          ))}
        </Card>

        <View>
          <Label>Optional Note</Label>
          <View
            style={{
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.r,
              paddingVertical: 14,
              paddingHorizontal: 16,
            }}
          >
            <Txt
              style={{ fontSize: 15, color: T.sub, fontStyle: "italic" }}
            >
              Flood water rising fast
            </Txt>
          </View>
        </View>

        {/* was `grid-template-columns: 1fr 2fr` */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Btn variant="outline" onClick={onEdit}>
              Edit
            </Btn>
          </View>
          <View style={{ flex: 2 }}>
            <Btn onClick={onConfirm}>Confirm &amp; Validate</Btn>
          </View>
        </View>
      </ScrollBody>
      <NavBar screen="confirm" onNav={onNav} />
    </Shell>
  )
}

// ─── Screen: Validation Pass ─────────────────────────────────────────────────

const CHECKS = [
  "All required fields complete",
  "Event type is valid",
  "Location recognized",
  "ETA within range",
  "Priority level set",
]

export function ScreenValidationPass({
  onBack,
  onProceed,
  onNav,
}: {
  onBack: () => void
  onProceed: () => void
  onNav: (s: Screen) => void
}) {
  const T = useTheme()
  const [step, setStep] = useState(0)
  const done = step >= CHECKS.length

  useEffect(() => {
    const timers = CHECKS.map((_, i) =>
      setTimeout(() => setStep(i + 1), 500 + i * 650),
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Shell>
      <SafeTop />
      <AppBar title="Validation" onBack={onBack} />
      <ScrollBody>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            paddingVertical: 16,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: done ? "#DCFCE7" : "#FEF2F2",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {done ? Icon.CheckLarge() : <Spinner size={32} thickness={3} />}
          </View>
          <View style={{ alignItems: "center" }}>
            <Txt
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: T.text,
                letterSpacing: -0.5,
              }}
            >
              {done ? "Validation Passed" : "Validating…"}
            </Txt>
            <Txt style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>
              {done ? "All fields verified" : "Checking all requirements"}
            </Txt>
          </View>
        </View>

        <Card>
          {CHECKS.map((item, i) => {
            const passed = i < step
            const active = i === step
            return (
              <View key={item}>
                <View
                  style={{
                    paddingVertical: 13,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: passed
                        ? "#DCFCE7"
                        : active
                          ? "#FEF2F2"
                          : T.card,
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {passed ? (
                      Icon.Check(T.green)
                    ) : active ? (
                      <Spinner size={14} thickness={2} />
                    ) : null}
                  </View>
                  <Txt
                    style={{
                      fontSize: 14,
                      color: passed || active ? T.text : T.muted,
                    }}
                  >
                    {item}
                  </Txt>
                </View>
                {i < CHECKS.length - 1 && (
                  <View
                    style={{ height: 1, backgroundColor: T.border, marginHorizontal: 16 }}
                  />
                )}
              </View>
            )
          })}
        </Card>

        <Pulse active={done}>
          <Btn full disabled={!done} onClick={onProceed}>
            Proceed to Send
          </Btn>
        </Pulse>
      </ScrollBody>
      <NavBar screen="validation-pass" onNav={onNav} />
    </Shell>
  )
}

// ─── Screen: Validation Fail ─────────────────────────────────────────────────

const ISSUES = [
  { field: "Location", reason: "Area code not recognized" },
  { field: "ETA", reason: "Time format unclear" },
]

export function ScreenValidationFail({
  onBack,
  onFix,
  onNav,
}: {
  onBack: () => void
  onFix: () => void
  onNav: (s: Screen) => void
}) {
  const T = useTheme()
  return (
    <Shell>
      <SafeTop />
      <AppBar title="Validation" onBack={onBack} />
      <ScrollBody>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            paddingVertical: 16,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#FEE2E2",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {Icon.WarningLarge()}
          </View>
          <View style={{ alignItems: "center" }}>
            <Txt
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: T.text,
                letterSpacing: -0.5,
              }}
            >
              Validation Failed
            </Txt>
            <Txt style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>
              Fix issues and resubmit
            </Txt>
          </View>
        </View>

        <Card>
          <View
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: T.border,
            }}
          >
            <Txt
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.red,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Invalid Fields
            </Txt>
          </View>
          {ISSUES.map(({ field, reason }, i) => (
            <View key={field}>
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
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#FEE2E2",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {Icon.X(T.red)}
                </View>
                <View>
                  <Txt style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                    {field}
                  </Txt>
                  <Txt style={{ fontSize: 12, color: T.red, marginTop: 2 }}>
                    {reason}
                  </Txt>
                </View>
              </View>
              {i < ISSUES.length - 1 && (
                <View
                  style={{ height: 1, backgroundColor: T.border, marginHorizontal: 16 }}
                />
              )}
            </View>
          ))}
        </Card>

        <Btn full variant="danger" onClick={onFix}>
          Fix Input
        </Btn>
      </ScrollBody>
      <NavBar screen="validation-fail" onNav={onNav} />
    </Shell>
  )
}

// ─── Screen: Transmitting ─────────────────────────────────────────────────────

const TX_LOG = [
  "Encoding packet...",
  "Establishing frequency...",
  "Transmitting via HF Radio...",
  "Delivered ✓",
]

export function ScreenTransmitting({ onDone }: { onDone: () => void }) {
  const T = useTheme()
  const [step, setStep] = useState(0)

  useEffect(() => {
    let cancelled = false
    const durations = [1400, 1400, 1400, 1600]
    let i = 0
    let timer = 0
    const tick = () => {
      if (cancelled) return
      i = (i + 1) % durations.length
      setStep(i)
      timer = setTimeout(tick, durations[i])
    }
    timer = setTimeout(tick, durations[0])
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return (
    <Shell onClick={onDone}>
      <SafeTop />
      <AppBar title="Transmitting" />
      <ScrollBody>
        {/* Antenna card */}
        <View
          style={{
            backgroundColor: T.banner,
            borderRadius: T.rLg,
            paddingVertical: 32,
            paddingHorizontal: 20,
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Antenna />
          <View style={{ alignItems: "center" }}>
            <Txt
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: step === 3 ? T.green : "#fff",
              }}
            >
              {TX_LOG[Math.min(step, 3)]}
            </Txt>
            <Txt mono style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
              7.110 MHz · HF Radio
            </Txt>
          </View>
        </View>

        {/* Signal */}
        <View>
          <Label>Signal Strength</Label>
          <Card>
            <View
              style={{
                padding: 16,
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              {[16, 22, 28, 34, 40].map((h, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: h,
                    borderRadius: 4,
                    backgroundColor: i < 4 ? T.accent : T.border,
                  }}
                />
              ))}
              <Txt
                style={{
                  marginLeft: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.text,
                  alignSelf: "center",
                }}
              >
                Strong
              </Txt>
            </View>
          </Card>
        </View>

        {/* Packet */}
        <View>
          <Label>Encoded Packet</Label>
          <View style={{ backgroundColor: T.banner, borderRadius: T.r, padding: 16 }}>
            <Txt
              mono
              style={{ fontSize: 13, color: "#4ADE80", lineHeight: 26 }}
            >
              {"{\n  E: 1\n  H: 2\n  L: 5\n  T: 2\n  P: 1\n}"}
            </Txt>
          </View>
        </View>

        {/* Log */}
        <View>
          <Label>Status Log</Label>
          <Card>
            {TX_LOG.slice(0, step + 1).map((s, i) => (
              <View key={i}>
                <View
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Dot
                    color={
                      i < step ? T.green : i === step && step < 3 ? T.amber : T.green
                    }
                  />
                  <Txt style={{ fontSize: 13, color: T.text }}>{s}</Txt>
                </View>
                {i < step && (
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
      </ScrollBody>
    </Shell>
  )
}

// ─── Screen: Received ────────────────────────────────────────────────────────

export function ScreenReceived({
  message,
  fields,
  onNav,
}: {
  message: string
  fields: Field[]
  onNav: (s: Screen) => void
}) {
  const T = useTheme()
  const [lang, setLang] = useState<"EN" | "TL">("EN")
  const by = (label: string) => fields.find((f) => f.label === label)!
  const hazard = by("Hazard").value
  const location = by("Location").value
  const eta = by("ETA").value
  const rows = [
    ["Type", by("Event").value],
    ["Location", location],
    ["ETA", eta],
    ["Hazard", hazard],
    ["Priority", by("Priority").value],
  ] as const
  const readable =
    lang === "EN"
      ? `"A ${hazard} is expected in ${location} within ${eta}. Immediate evacuation is advised."`
      : `"Inaasahang darating ang ${hazard.toLowerCase()} sa ${location} sa loob ng ${eta}. Inirerekomenda ang agarang paglikas."`

  return (
    <Shell>
      <SafeTop />
      <AppBar title="Message Received" />
      <ScrollBody>
        {/* Sent message */}
        <View>
          <Label>Sent Message</Label>
          <View
            style={{
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.r,
              padding: 16,
            }}
          >
            <Txt style={{ fontSize: 15, color: T.text, lineHeight: 25 }}>
              {message}
            </Txt>
          </View>
        </View>

        {/* Emergency card */}
        <View
          style={{ backgroundColor: T.red, borderRadius: T.rLg, overflow: "hidden" }}
        >
          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.15)",
            }}
          >
            {Icon.EmergencyTriangle()}
            <Txt
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: 0.3,
              }}
            >
              EMERGENCY ALERT
            </Txt>
          </View>
          <View style={{ padding: 16 }}>
            {rows.map(([k, v]) => (
              <View
                key={k}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Txt style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                  {k}
                </Txt>
                <Txt style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                  {v}
                </Txt>
              </View>
            ))}
          </View>
        </View>

        {/* AI readable */}
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
          <View
            style={{
              backgroundColor: T.surface,
              borderWidth: 1,
              borderColor: T.border,
              borderRadius: T.r,
              padding: 16,
            }}
          >
            <Txt style={{ fontSize: 15, color: T.text, lineHeight: 26, fontStyle: "italic" }}>
              {readable}
            </Txt>
          </View>
        </View>

        <Btn full onClick={() => onNav("inbox")}>
          Go to Inbox
        </Btn>
      </ScrollBody>
      <NavBar screen="received" onNav={onNav} />
    </Shell>
  )
}
