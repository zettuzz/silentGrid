import React, { useEffect } from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import Svg, { Circle, Line, Path } from "react-native-svg"

import { useTheme } from "../theme"

// ─── Scanline ─────────────────────────────────────────────────────────────────
// Replaces `.figma-scanline`: a translucent bar sweeping left → right.

export function Scanline({ width }: { width: number }) {
  const t = useSharedValue(0)
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
    )
  }, [t])

  const bar = width * 0.45
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-bar * 1.1, bar * 3.2]) },
    ],
  }))

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: bar,
          backgroundColor: "rgba(96,165,250,0.25)",
        },
        style,
      ]}
    />
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
// Replaces `.figma-spinner`.

export function Spinner({
  size = 20,
  thickness = 2.5,
}: {
  size?: number
  thickness?: number
}) {
  const T = useTheme()
  const rot = useSharedValue(0)
  useEffect(() => {
    rot.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.linear }),
      -1,
    )
  }, [rot])

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 360}deg` }],
  }))

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: thickness,
          borderColor: "rgba(37,99,235,0.2)",
          borderTopColor: T.accent,
        },
        style,
      ]}
    />
  )
}

// ─── Pulse ────────────────────────────────────────────────────────────────────
// Replaces `.figma-pulse`: an expanding, fading ring around the child.

export function Pulse({
  active,
  children,
}: {
  active: boolean
  children: React.ReactNode
}) {
  const T = useTheme()
  const t = useSharedValue(0)
  useEffect(() => {
    t.value = active
      ? withRepeat(
          withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
          -1,
        )
      : 0
  }, [active, t])

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [0.35, 0]),
    transform: [{ scale: interpolate(t.value, [0, 1], [1, 1.18]) }],
  }))

  return (
    <View>
      {active && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: T.r, borderWidth: 2, borderColor: T.accent },
            style,
          ]}
        />
      )}
      {children}
    </View>
  )
}

// ─── Antenna ──────────────────────────────────────────────────────────────────
// Replaces the static antenna `<svg>` plus its `.figma-ant-wave` paths.

function AntWave({ d, delay }: { d: string; delay: number }) {
  const t = useSharedValue(0)
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
      ),
    )
  }, [delay, t])

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.2, 0.7, 1], [0, 1, 0.4, 0]),
    transform: [{ scale: interpolate(t.value, [0, 1], [0.2, 1.6]) }],
  }))

  const box: ViewStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: 56,
    height: 64,
    transformOrigin: "28px 10px",
  }

  return (
    <Animated.View style={[box, style]}>
      <Svg width={56} height={64} viewBox="0 0 56 64" fill="none">
        <Path
          d={d}
          stroke="rgba(96,165,250,0.85)"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  )
}

// ─── Radar ────────────────────────────────────────────────────────────────────
// Concentric rings used on the WiFi scan screen.

function RadarRing({
  size,
  delay,
}: {
  size: number
  delay: number
}) {
  const T = useTheme()
  const t = useSharedValue(0)
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
        -1,
      ),
    )
  }, [delay, t])

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.2, 1], [0.6, 0.4, 0]),
    transform: [{ scale: interpolate(t.value, [0, 1], [0.2, 1]) }],
  }))

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: T.accent,
        },
        style,
      ]}
    />
  )
}

export function Radar({ size = 180 }: { size?: number }) {
  const T = useTheme()
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: size / 6,
          height: size / 6,
          borderRadius: size / 12,
          backgroundColor: T.accent,
          opacity: 0.9,
        }}
      />
      {[0, 1, 2].map((i) => (
        <RadarRing key={i} size={size} delay={i * 800} />
      ))}
    </View>
  )
}

export function Antenna() {
  return (
    <View style={{ position: "relative", width: 56, height: 64 }}>
      <Svg width={56} height={64} viewBox="0 0 56 64" fill="none">
        <Line
          x1={28}
          y1={44}
          x2={28}
          y2={10}
          stroke="#fff"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Line
          x1={16}
          y1={44}
          x2={40}
          y2={44}
          stroke="#fff"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Line
          x1={20}
          y1={56}
          x2={36}
          y2={56}
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Line
          x1={16}
          y1={44}
          x2={20}
          y2={56}
          stroke="#fff"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Line
          x1={40}
          y1={44}
          x2={36}
          y2={56}
          stroke="#fff"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Circle cx={28} cy={10} r={2.5} fill="#22C55E" />
      </Svg>
      <AntWave d="M20,22 Q28,10 36,22" delay={0} />
      <AntWave d="M14,30 Q28,10 42,30" delay={650} />
      <AntWave d="M8,38 Q28,10 48,38" delay={1300} />
    </View>
  )
}
