import { useState } from "react"
import { Image, TextInput, View } from "react-native"

import { Btn, SafeTop, Shell, Txt } from "../components/ui"
import { useSession } from "../lib/session"
import { useTheme } from "../theme"

export function AuthScreen() {
  const T = useTheme()
  const { continueAsGuest, loginRescuer } = useSession()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleRescuer = () => {
    const ok = loginRescuer(username.trim(), password.trim())
    if (!ok) setError("Invalid credentials")
  }

  const field = {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: T.r,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: T.text,
  }

  return (
    <Shell>
      <SafeTop />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          gap: 32,
        }}
      >
        {/* Brand */}
        <View style={{ alignItems: "center", gap: 14 }}>
          <Image
            source={require("../../assets/logo.png")}
            style={{
              width: 64,
              height: 64,
              borderRadius: 15,
            }}
            resizeMode="contain"
          />
          <Txt
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: T.text,
              letterSpacing: -0.6,
            }}
          >
            Silent Grid HF
          </Txt>
        </View>

        {/* Guest */}
        <Btn full onClick={continueAsGuest}>
          I need help
        </Btn>

        {/* Rescuer */}
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 2,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
            <Txt style={{ fontSize: 12, color: T.muted }}>or</Txt>
            <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
          </View>
          <TextInput
            value={username}
            onChangeText={(t) => {
              setUsername(t)
              setError(null)
            }}
            placeholder="Username"
            placeholderTextColor={T.muted}
            autoCapitalize="none"
            style={field}
          />
          <TextInput
            value={password}
            onChangeText={(t) => {
              setPassword(t)
              setError(null)
            }}
            placeholder="Password"
            placeholderTextColor={T.muted}
            secureTextEntry
            style={field}
          />
          {error ? (
            <Txt style={{ fontSize: 13, color: T.red }}>{error}</Txt>
          ) : null}
          <Btn full variant="outline" onClick={handleRescuer}>
            Rescuer
          </Btn>
          <Txt
            style={{ fontSize: 11, color: T.muted, textAlign: "center" }}
          >
            rescuer / silentgrid
          </Txt>
        </View>
      </View>
    </Shell>
  )
}
