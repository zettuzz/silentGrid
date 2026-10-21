import { View } from "react-native"
import Svg, { Circle, Path, Rect } from "react-native-svg"

import { T } from "../theme"

/**
 * Solid icons, ported from the web version's inline `<svg>` elements.
 * Each entry is a function returning an element so callers can pass a color,
 * e.g. `Icon.Home(T.accent)`.
 */
export const Icon = {
  Home: (c: string = T.text) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill={c}>
      <Path d="M10 2L2 8.5V18h5v-5h6v5h5V8.5L10 2z" />
    </Svg>
  ),
  Plus: (c: string = T.text) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill={c}>
      <Path d="M10 3a1 1 0 011 1v5h5a1 1 0 010 2h-5v5a1 1 0 01-2 0v-5H4a1 1 0 010-2h5V4a1 1 0 011-1z" />
    </Svg>
  ),
  Inbox: (c: string = T.text) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill={c}>
      <Path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-3 3-3-3H4a2 2 0 01-2-2V4zm2 1v6h3.586L10 13.414 12.414 11H16V5H4z" />
    </Svg>
  ),
  Settings: (c: string = T.text) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill={c}>
      <Path
        fillRule="evenodd"
        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </Svg>
  ),
  Back: (c: string = T.accent) => (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M11.5 3.5L6 9l5.5 5.5"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  Check: (c: string = T.green) => (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M13 4L6.5 11 3 7.5"
        stroke={c}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  X: (c: string = T.red) => (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M2 2l10 10M12 2L2 12"
        stroke={c}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  ),
  Warning: (c: string = T.red) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={c}>
      <Path
        d="M12 2L2 21h20L12 2zm0 5v6m0 3v2"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  ),
  ChevronRight: (c: string = T.muted) => (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M6 3l5 5-5 5"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  Send: () => (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="#fff">
      <Path d="M2 2l14 7-14 7V10.5l10-1.5-10-1.5V2z" />
    </Svg>
  ),
  Signal: (c: string = T.green) => (
    <Svg width={18} height={14} viewBox="0 0 18 14" fill={c}>
      <Rect x={0} y={8} width={3} height={6} rx={1.5} />
      <Rect x={5} y={5} width={3} height={9} rx={1.5} />
      <Rect x={10} y={2} width={3} height={12} rx={1.5} />
      <Rect x={15} y={0} width={3} height={14} rx={1.5} />
    </Svg>
  ),
  Radio: (c: string = T.text) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={3} fill={c} />
      <Path
        d="M5.05 5.05a7 7 0 009.9 9.9M5.05 14.95A7 7 0 0114.95 5.05"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  ),
  Info: () => (
    <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
      <Path
        d="M5 2v4M5 7.5V8.5"
        stroke="#fff"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  ),
  CheckLarge: () => (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Path
        d="M7 16L13 22L25 10"
        stroke={T.green}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  WarningLarge: () => (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 6L28 26H4L16 6z"
        fill="#FEE2E2"
        stroke={T.red}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M16 14v6M16 22.5v1.5"
        stroke={T.red}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  ),
  EmergencyTriangle: () => (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="#fff">
      <Path
        d="M9 1L1 16h16L9 1zm0 5v5M9 13v1.5"
        stroke="#fff"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  ),
  Lock: (c: string = T.text) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={c}>
      <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </Svg>
  ),
}

/** Non-SVG status dot used across lists and status banners. */
export function Dot({ color = T.green }: { color?: string }) {
  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  )
}
