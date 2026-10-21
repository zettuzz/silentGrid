import NetInfo, { type NetInfoState } from "@react-native-community/netinfo"
import * as Location from "expo-location"
import { useEffect, useState } from "react"
import { AppState, Linking, Platform, View } from "react-native"

import { Spinner } from "../components/animations"
import { Icon } from "../components/icons"
import { Btn, SafeTop, Txt } from "../components/ui"
import { useTheme } from "../theme"

// ─── Real network gate ────────────────────────────────────────────────────────
// There is no OS-level API for an app to *join* a WiFi network — Android 10 and
// iOS both forbid it (an app may only suggest a network, the user confirms in
// system UI). So this gate reads the device's genuine network state via netinfo
// and holds the app until the phone is actually on WiFi, deep-linking out to the
// OS WiFi panel so the user can associate themselves. It live-updates, so the
// gate clears the moment the radio connects.
//
// Web has no WiFi stack at all, so the gate is skipped there and the browser
// preview stays usable.

const BASE_STATION_SSID = "BASE-STATION-01"

/** `details` is a union type that doesn't expose `ssid` on every branch. */
function ssidFrom(state: NetInfoState | null): string | null {
  const details = state?.details as { ssid?: string | null } | null
  const ssid = details?.ssid
  return typeof ssid === "string" && ssid.length > 0 ? ssid : null
}

async function openWifiSettings() {
  try {
    // Android can jump straight to the WiFi panel; iOS has no public URL for
    // it, so app settings is the closest the OS allows.
    if (Platform.OS === "android") {
      await Linking.sendIntent("android.settings.WIFI_SETTINGS")
      return
    }
    await Linking.openSettings()
  } catch {
    await Linking.openSettings().catch(() => {})
  }
}

function StatusMark({ state }: { state: "checking" | "on" | "off" }) {
  const T = useTheme()
  if (state === "checking") {
    return (
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: T.card,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner size={36} thickness={3} />
      </View>
    )
  }
  return (
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: state === "on" ? "#DCFCE7" : "#FEF2F2",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {state === "on" ? Icon.CheckLarge() : Icon.WarningLarge()}
    </View>
  )
}

export function WifiGate({ onConnected }: { onConnected: () => void }) {
  const T = useTheme()
  const [state, setState] = useState<NetInfoState | null>(null)
  const [ready, setReady] = useState(false)
  const [granted, setGranted] = useState(false)

  // Web: no WiFi stack to query — pass straight through.
  useEffect(() => {
    if (Platform.OS === "web") onConnected()
  }, [onConnected])

  // Subscribe to genuine network state. `NetInfo.fetch` seeds the first read so
  // we can distinguish "still checking" from "genuinely offline".
  useEffect(() => {
    if (Platform.OS === "web") return
    let alive = true
    const apply = (s: NetInfoState) => {
      if (alive) setState(s)
    }
    NetInfo.fetch()
      .then(apply)
      .catch(() => {})
      .finally(() => alive && setReady(true))
    const unsubscribe = NetInfo.addEventListener(apply)
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  // SSID needs location permission on Android; on iOS it additionally needs the
  // "Access Wi-Fi Information" entitlement. Asked once, when the gate mounts —
  // never on launch. Refetch afterwards so netinfo picks the SSID up.
  useEffect(() => {
    if (Platform.OS === "web") return
    let alive = true
    Location.requestForegroundPermissionsAsync()
      .then((res) => {
        if (alive) setGranted(res.status === "granted")
        return NetInfo.refresh()
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // Returning from the OS settings panel doesn't always emit a netinfo event,
  // so re-check whenever the app comes back to the foreground.
  useEffect(() => {
    if (Platform.OS === "web") return
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") NetInfo.refresh().catch(() => {})
    })
    return () => sub.remove()
  }, [])

  const onWifi =
    state?.isConnected === true &&
    (state.type === "wifi" || state.type === "ethernet")

  if (Platform.OS === "web") return null

  const ssid = ssidFrom(state)
  const isCellular = state?.type === "cellular"
  const mark: "checking" | "on" | "off" = !ready
    ? "checking"
    : onWifi
      ? "on"
      : "off"

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <SafeTop />
      {onWifi ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <StatusMark state="on" />
          <Txt
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: T.text,
              marginTop: 24,
              textAlign: "center",
            }}
          >
            Connected to WiFi
          </Txt>
          <Txt
            style={{
              fontSize: 14,
              color: T.muted,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {ssid ?? BASE_STATION_SSID}
          </Txt>
          <View style={{ marginTop: 32, width: "100%" }}>
            <Btn full onClick={onConnected}>
              Enter the App
            </Btn>
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <StatusMark state={mark} />
          <Txt
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: T.text,
              marginTop: 24,
              textAlign: "center",
            }}
          >
            {!ready
              ? "Checking network…"
              : isCellular
                ? "On cellular data"
                : "No WiFi connection"}
          </Txt>
          <Txt
            style={{
              fontSize: 14,
              color: T.muted,
              marginTop: 8,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {!ready
              ? "Reading the device's network state."
              : isCellular
                ? "Emergency traffic needs a WiFi link. Switch to a WiFi network to continue."
                : "Join a WiFi network to continue. The app unlocks automatically once connected."}
          </Txt>
          {!ready ? null : (
            <View style={{ marginTop: 32, width: "100%", gap: 10 }}>
              <Btn full onClick={openWifiSettings}>
                Open WiFi Settings
              </Btn>
              <Txt
                style={{ fontSize: 12, color: T.muted, textAlign: "center" }}
              >
                {granted ? `Network: ${ssid ?? "connected"}` : "Network name hidden"}
              </Txt>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
