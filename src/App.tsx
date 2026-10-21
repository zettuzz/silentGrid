import { useEffect, useState } from "react"
import { BackHandler, View } from "react-native"
import { useFonts } from "expo-font"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"

import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter"
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono"

import { BpCtx, SideNav, useBreakpoint, type Screen } from "./components/ui"
import { extractFields } from "./lib/extract"
import {
  GUEST_SENDER,
  IncidentsProvider,
  locationFromFields,
  priorityFromFields,
  useIncidents,
} from "./lib/incidents"
import { SessionProvider, useSession } from "./lib/session"
import { AuthScreen } from "./screens/auth"
import { ScreenHome, ScreenNew } from "./screens/home"
import { ScreenInbox, ScreenSettings } from "./screens/inbox"
import {
  ScreenConfirm,
  ScreenExtracting,
  ScreenReceived,
  ScreenTransmitting,
  ScreenValidationFail,
  ScreenValidationPass,
} from "./screens/message"
import {
  ReceiverBroadcast,
  ReceiverDashboard,
  ReceiverIncidentDetail,
  ReceiverIncidents,
} from "./screens/receiver"
import { WifiGate } from "./screens/wifi"
import { ThemeProvider, useTheme, useThemeMode } from "./theme"

// ─── Fonts ────────────────────────────────────────────────────────────────────

const FONTS = {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
}

// ─── Back handlers ────────────────────────────────────────────────────────────

function useGuestBackHandler(screen: Screen, nav: (s: Screen) => void) {
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "home" || screen === "inbox" || screen === "settings") {
        return false
      }
      if (
        screen === "new-message" ||
        screen === "extracting" ||
        screen === "confirm"
      ) {
        nav("home")
      } else if (screen === "validation-pass" || screen === "validation-fail") {
        nav("confirm")
      } else if (screen === "transmitting" || screen === "received") {
        nav("inbox")
      }
      return true
    })
    return () => sub.remove()
  }, [screen, nav])
}

function useReceiverBackHandler(
  screen: Screen,
  nav: (s: Screen) => void,
  onCloseIncident: () => void,
) {
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "receiver-dashboard") return false
      if (screen === "receiver-incident") {
        onCloseIncident()
        return true
      }
      nav("receiver-dashboard")
      return true
    })
    return () => sub.remove()
  }, [screen, nav, onCloseIncident])
}

// ─── Guest app ────────────────────────────────────────────────────────────────

function GuestApp() {
  const [screen, setScreen] = useState<Screen>("home")
  const [draft, setDraft] = useState(
    "May bagyo, kailangan mag evacuate sa Brgy 5 within 2 hours",
  )
  const [connected, setConnected] = useState(false)
  const { addIncident } = useIncidents()

  const extracted = extractFields(draft)
  const nav = (s: Screen) => setScreen(s)
  const bp = useBreakpoint()

  useGuestBackHandler(screen, nav)

  const handleTransmitDone = () => {
    addIncident({
      from: GUEST_SENDER,
      message: draft,
      fields: extracted,
      priority: priorityFromFields(extracted),
      status: "new",
      validation: "passed",
      location: locationFromFields(extracted),
    })
    nav("received")
  }

  const content = (
    <>
      {screen === "home" && <ScreenHome onNav={nav} />}
      {screen === "new-message" && (
        <ScreenNew
          value={draft}
          onChange={setDraft}
          onNext={() => nav("extracting")}
          onNav={nav}
        />
      )}
      {screen === "extracting" && (
        <ScreenExtracting
          message={draft}
          fields={extracted}
          onContinue={() => nav("confirm")}
        />
      )}
      {screen === "confirm" && (
        <ScreenConfirm
          fields={extracted}
          onBack={() => nav("new-message")}
          onConfirm={() => nav("validation-pass")}
          onEdit={() => nav("new-message")}
          onNav={nav}
        />
      )}
      {screen === "validation-pass" && (
        <ScreenValidationPass
          onBack={() => nav("confirm")}
          onProceed={() => nav("transmitting")}
          onNav={nav}
        />
      )}
      {screen === "validation-fail" && (
        <ScreenValidationFail
          onBack={() => nav("confirm")}
          onFix={() => nav("new-message")}
          onNav={nav}
        />
      )}
      {screen === "transmitting" && (
        <ScreenTransmitting onDone={handleTransmitDone} />
      )}
      {screen === "received" && (
        <ScreenReceived message={draft} fields={extracted} onNav={nav} />
      )}
      {screen === "inbox" && <ScreenInbox onNav={nav} />}
      {screen === "settings" && <ScreenSettings onNav={nav} />}
    </>
  )

  return (
    <BpCtx.Provider value={bp}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {bp === "desktop" && connected && (
          <SideNav screen={screen} onNav={nav} />
        )}
        <View style={{ flex: 1 }}>
          {!connected ? (
            <WifiGate onConnected={() => setConnected(true)} />
          ) : (
            content
          )}
        </View>
      </View>
    </BpCtx.Provider>
  )
}

// ─── Receiver app ─────────────────────────────────────────────────────────────

function ReceiverApp() {
  const [screen, setScreen] = useState<Screen>("receiver-dashboard")
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  const nav = (s: Screen) => setScreen(s)
  const bp = useBreakpoint()

  const closeIncident = () => {
    setSelectedIncidentId(null)
    nav("receiver-incidents")
  }

  useReceiverBackHandler(screen, nav, closeIncident)

  const content = (
    <>
      {screen === "receiver-dashboard" && (
        <ReceiverDashboard
          onNav={nav}
          onSelectIncident={(id) => {
            setSelectedIncidentId(id)
            nav("receiver-incident")
          }}
          onBroadcast={() => nav("receiver-broadcast")}
        />
      )}
      {screen === "receiver-incidents" && (
        <ReceiverIncidents
          onNav={nav}
          onSelectIncident={(id) => {
            setSelectedIncidentId(id)
            nav("receiver-incident")
          }}
        />
      )}
      {screen === "receiver-incident" && selectedIncidentId && (
        <ReceiverIncidentDetail id={selectedIncidentId} onBack={closeIncident} />
      )}
      {screen === "receiver-broadcast" && (
        <ReceiverBroadcast onNav={nav} onSent={() => nav("receiver-dashboard")} />
      )}
      {screen === "settings" && <ScreenSettings onNav={nav} />}
    </>
  )

  return (
    <BpCtx.Provider value={bp}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {bp === "desktop" && <SideNav screen={screen} onNav={nav} />}
        <View style={{ flex: 1 }}>{content}</View>
      </View>
    </BpCtx.Provider>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function Root() {
  const T = useTheme()
  const { mode } = useThemeMode()
  const { session, hydrated: sessionHydrated } = useSession()
  const [fontsLoaded] = useFonts(FONTS)

  if (!fontsLoaded || !sessionHydrated) return null

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      {session ? (
        session.role === "guest" ? (
          <GuestApp />
        ) : (
          <ReceiverApp />
        )
      ) : (
        <AuthScreen />
      )}
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <IncidentsProvider>
            <Root />
          </IncidentsProvider>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
