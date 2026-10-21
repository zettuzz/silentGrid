import { createContext, useContext, type ReactNode } from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useSession } from "../lib/session"
import { ff, useTheme } from "../theme"
import { Icon } from "./icons"

// ─── Navigation model ─────────────────────────────────────────────────────────

export type Role = "guest" | "rescuer"

export type Screen =
  | "home"
  | "new-message"
  | "extracting"
  | "confirm"
  | "validation-pass"
  | "validation-fail"
  | "transmitting"
  | "received"
  | "inbox"
  | "settings"
  | "receiver-dashboard"
  | "receiver-incidents"
  | "receiver-incident"
  | "receiver-broadcast"

export const NAV_BY_ROLE: Record<
  Role,
  { label: string; dest: Screen; icon: (c: string) => React.ReactNode }[]
> = {
  guest: [
    { label: "Home", dest: "home", icon: Icon.Home },
    { label: "New", dest: "new-message", icon: Icon.Plus },
    { label: "Inbox", dest: "inbox", icon: Icon.Inbox },
    { label: "Settings", dest: "settings", icon: Icon.Settings },
  ],
  rescuer: [
    { label: "Dashboard", dest: "receiver-dashboard", icon: Icon.Home },
    { label: "Incidents", dest: "receiver-incidents", icon: Icon.Inbox },
    { label: "Broadcast", dest: "receiver-broadcast", icon: Icon.Send },
    { label: "Settings", dest: "settings", icon: Icon.Settings },
  ],
}

export function getTab(s: Screen, role: Role) {
  if (s === "home" || s === "receiver-dashboard") return NAV_BY_ROLE[role][0].label
  if (
    role === "guest" &&
    [
      "new-message",
      "extracting",
      "confirm",
      "validation-pass",
      "validation-fail",
      "transmitting",
      "received",
    ].includes(s)
  )
    return "New"
  if (s === "inbox" || s === "receiver-incidents" || s === "receiver-incident")
    return NAV_BY_ROLE[role][1].label
  if (s === "receiver-broadcast") return "Broadcast"
  return "Settings"
}

// ─── Breakpoint ───────────────────────────────────────────────────────────────
// `window.innerWidth` → `useWindowDimensions` (re-renders on rotate/resize).

type Breakpoint = "mobile" | "tablet" | "desktop"

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions()
  return width >= 1024 ? "desktop" : width >= 640 ? "tablet" : "mobile"
}

export const BpCtx = createContext<Breakpoint>("mobile")

export function useBp(): Breakpoint {
  return useContext(BpCtx)
}

// ─── Text ─────────────────────────────────────────────────────────────────────
// React Native has no `font` shorthand and Android ignores `fontWeight` once a
// custom family is set, so every text style resolves its family via `ff()`.

type TxtProps = TextProps & { mono?: boolean }

export function Txt({ style, mono, children, ...rest }: TxtProps) {
  const flat = StyleSheet.flatten(style) as TextStyle | undefined
  const family = ff(flat?.fontWeight, mono)
  return (
    <Text {...rest} style={[style, { fontFamily: family }]}>
      {children}
    </Text>
  )
}

// ─── Layout primitives ────────────────────────────────────────────────────────

export function Shell({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  const bp = useBp()
  const T = useTheme()
  const maxW = bp === "desktop" ? 720 : bp === "tablet" ? 600 : 480
  return (
    <Pressable
      onPress={onClick}
      style={{
        flex: 1,
        width: "100%",
        maxWidth: maxW,
        alignSelf: "center",
        backgroundColor: T.bg,
      }}
    >
      {children}
    </Pressable>
  )
}

export function SideNav({
  screen,
  onNav,
}: {
  screen: Screen
  onNav: (s: Screen) => void
}) {
  const T = useTheme()
  const { session } = useSession()
  const role: Role = session?.role ?? "guest"
  const active = getTab(screen, role)
  const nav = NAV_BY_ROLE[role]
  return (
    <View
      style={{
        width: 220,
        flexShrink: 0,
        backgroundColor: T.surface,
        borderRightWidth: 1,
        borderRightColor: T.border,
        paddingTop: 32,
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 4,
      }}
    >
      <View style={{ paddingHorizontal: 12, paddingBottom: 28 }}>
        <Txt
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.muted,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {role === "rescuer" ? "Silent Grid HF" : "Emergency Comms"}
        </Txt>
      </View>
      {nav.map(({ label, dest, icon }) => {
        const on = label === active
        return (
          <Pressable
            key={label}
            onPress={() => onNav(dest)}
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: on ? "#FEF2F2" : "transparent",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {icon(on ? T.accent : T.muted)}
            <Txt
              style={{
                fontSize: 14,
                fontWeight: on ? 600 : 400,
                color: on ? T.accent : T.sub,
                textAlign: "left",
              }}
            >
              {label}
            </Txt>
          </Pressable>
        )
      })}
    </View>
  )
}

export function SafeTop() {
  const insets = useSafeAreaInsets()
  return <View style={{ height: insets.top }} />
}

export function AppBar({
  title,
  onBack,
  right,
}: {
  title: string
  onBack?: () => void
  right?: ReactNode
}) {
  const T = useTheme()
  const bp = useBp()
  // Tablet/desktop get a larger header — the mobile size reads too small once
  // the shell widens out. Side slots scale with it so the title stays centred.
  const S =
    bp === "desktop"
      ? { title: 24, pt: 18, pb: 14, px: 32, slot: 40 }
      : bp === "tablet"
        ? { title: 21, pt: 16, pb: 12, px: 28, slot: 36 }
        : { title: 17, pt: 12, pb: 8, px: 20, slot: 32 }
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: S.pt,
        paddingHorizontal: S.px,
        paddingBottom: S.pb,
        gap: 8,
        backgroundColor: T.surface,
        borderBottomWidth: 1,
        borderBottomColor: T.border,
        flexShrink: 0,
      }}
    >
      <View style={{ width: S.slot, alignItems: "flex-start" }}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={10}>
            {Icon.Back(T.accent)}
          </Pressable>
        )}
      </View>
      <View style={{ flex: 1, alignItems: "center" }}>
        <Txt
          style={{
            fontSize: S.title,
            fontWeight: 600,
            color: T.text,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Txt>
      </View>
      <View style={{ width: S.slot, alignItems: "flex-end" }}>{right}</View>
    </View>
  )
}

export function NavBar({
  screen,
  onNav,
}: {
  screen: Screen
  onNav: (s: Screen) => void
}) {
  const T = useTheme()
  const bp = useBp()
  const insets = useSafeAreaInsets()
  const { session } = useSession()
  const role: Role = session?.role ?? "guest"
  if (bp === "desktop") return null // SideNav handles desktop
  const active = getTab(screen, role)
  const nav = NAV_BY_ROLE[role]
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: T.border,
        flexDirection: "row",
        backgroundColor: T.surface,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        flexShrink: 0,
      }}
    >
      {nav.map(({ label, dest, icon }) => {
        const on = label === active
        const color = on ? T.accent : T.muted
        return (
          <Pressable
            key={label}
            onPress={() => onNav(dest)}
            style={{ flex: 1, alignItems: "center", paddingTop: 12, paddingBottom: 8, gap: 4 }}
          >
            {icon(color)}
            <Txt
              style={{
                fontSize: 10,
                fontWeight: on ? 700 : 400,
                color,
                letterSpacing: 0.2,
              }}
            >
              {label}
            </Txt>
          </Pressable>
        )
      })}
    </View>
  )
}

export function ScrollBody({
  children,
  pad = true,
}: {
  children: ReactNode
  pad?: boolean
}) {
  const bp = useBp()
  const px = bp === "desktop" ? 32 : bp === "tablet" ? 28 : 20
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: 20,
        paddingHorizontal: pad ? px : 0,
        paddingBottom: bp === "desktop" ? 36 : 24,
        gap: bp === "desktop" ? 20 : 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  )
}

export function Card({
  children,
  style,
}: {
  children: ReactNode
  style?: ViewStyle
}) {
  const T = useTheme()
  return (
    <View
      style={[
        {
          backgroundColor: T.surface,
          borderWidth: 1,
          borderColor: T.border,
          borderRadius: T.rLg,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export function Row({
  left,
  right,
  sub,
  isLast,
}: {
  left: string
  right?: ReactNode
  sub?: string
  isLast?: boolean
}) {
  const T = useTheme()
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 14,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexShrink: 1, paddingRight: 12 }}>
          <Txt style={{ fontSize: 15, color: T.text }}>{left}</Txt>
          {sub ? (
            <Txt style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{sub}</Txt>
          ) : null}
        </View>
        <View style={{ marginLeft: 12 }}>{right}</View>
      </View>
      {!isLast && (
        <View style={{ height: 1, backgroundColor: T.border, marginHorizontal: 16 }} />
      )}
    </View>
  )
}

export function Label({ children }: { children: ReactNode }) {
  const T = useTheme()
  return (
    <View style={{ marginBottom: 8 }}>
      <Txt
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.8,
          color: T.muted,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Txt>
    </View>
  )
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

type Variant = "primary" | "outline" | "ghost" | "danger"

export function Btn({
  children,
  variant = "primary",
  onClick,
  full,
  disabled,
}: {
  children: ReactNode
  variant?: Variant
  onClick?: () => void
  full?: boolean
  disabled?: boolean
}) {
  const T = useTheme()
  const VARIANTS: Record<Variant, { box: ViewStyle; text: string }> = {
    primary: { box: { backgroundColor: T.accent }, text: "#fff" },
    outline: { box: { borderWidth: 1.5, borderColor: T.border }, text: T.text },
    ghost: { box: { backgroundColor: T.card }, text: T.text },
    danger: { box: { backgroundColor: T.red }, text: "#fff" },
  }
  const v = VARIANTS[variant]
  return (
    <Pressable
      disabled={disabled}
      onPress={onClick}
      style={({ pressed }) => [
        {
          borderRadius: T.r,
          paddingVertical: 15,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          alignSelf: full ? "stretch" : "flex-start",
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        v.box,
      ]}
    >
      <Txt
        style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, color: v.text }}
      >
        {children}
      </Txt>
    </Pressable>
  )
}

export function Pill({
  children,
  color,
}: {
  children: ReactNode
  color: string
}) {
  return (
    <Txt
      mono
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: "#fff",
        backgroundColor: color,
        paddingVertical: 3,
        paddingHorizontal: 7,
        borderRadius: 6,
        letterSpacing: 0.3,
        alignSelf: "flex-start",
        overflow: "hidden",
      }}
    >
      {children}
    </Txt>
  )
}

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const T = useTheme()
  return (
    <Pressable
      onPress={onToggle}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        backgroundColor: on ? T.accent : T.border,
        padding: 3,
        justifyContent: "center",
        alignItems: on ? "flex-end" : "flex-start",
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      />
    </Pressable>
  )
}
