# Emergency Comms — Expo mobile app

React Native mobile app built with **Expo SDK 57** and **react-native-web** so it still runs in the browser preview panel.

## Development Server

The project now uses Expo/Metro instead of Vite.

- **Web preview (Figma panel):** `pnpm web` — serves Metro web on port `8443`.
- **Mobile dev:** `pnpm start` starts Metro, then scan the QR code with Expo Go or press `a` / `i` for an emulator.
- **Hot reload:** Changes to source files are reflected immediately.

> Note: SDK 57 runs in the current Expo Go app today. If you later bump to SDK 58, wait for the matching Expo Go update.

## Key Files

- `index.ts` — Expo entry point (`registerRootComponent`)
- `src/App.tsx` — Root component, session/role gate, guest + receiver apps
- `src/screens/auth.tsx` — Login screen: guest mode + fake rescuer login
- `src/screens/receiver.tsx` — Rescuer/base-station dashboard, incident queue, detail, broadcast
- `src/screens/wifi.tsx` — WiFi base-station gate (guest only)
- `src/screens/home.tsx` — Guest home / new message
- `src/screens/message.tsx` — Guest extraction/validation/transmission/received flow
- `src/screens/inbox.tsx` — Guest inbox + Settings (shared with receiver)
- `src/components/ui.tsx` — Shared primitives and role-aware navigation
- `src/components/icons.tsx` & `src/components/animations.tsx` — SVG icons and Reanimated effects
- `src/lib/extract.tsx` — Emergency-field extraction from free-text messages
- `src/lib/session.tsx` — Role/session provider with AsyncStorage persistence
- `src/lib/incidents.tsx` — Incident + broadcast store with AsyncStorage persistence
- `src/theme.tsx` — Color/type tokens, theme provider, and the `ff()` font-family helper
- `app.json` — Expo configuration
- `babel.config.js` — Babel preset (`babel-preset-expo`)
- `package.json` — Scripts and dependencies
- `.mise.toml` — Toolchain versions (Node.js, pnpm)

## Styling

Styling is done with React Native inline style objects against the shared token object `T` in `src/theme.tsx`. Fonts are loaded with `expo-font` from `@expo-google-fonts/inter` and `@expo-google-fonts/jetbrains-mono`; Android needs weight-specific family names, so `Txt` resolves the right family via `ff(fontWeight, mono`).

## Verifying

- `pnpm exec tsc --noEmit` — type check
- `pnpm web` — smoke test in the browser preview

