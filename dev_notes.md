# Developer Notes: Salary Manager

Essential notes for developers maintaining or building upon the Salary Manager codebase.

## Known Issues & Limitations
- **SMS Permission**: The `READ_SMS` permission is sensitive. When deploying to the Play Store, specific justification may be required to avoid rejection.
- **Expo Go Notifications**: Android Push notification warnings are unavoidable in Expo Go SDK 54. These are suppressed via `LogBox` in `_layout.tsx` but do not affect local notification functionality.
- **SVG Versioning**: Occasional warnings regarding `react-native-svg` versions are common in Expo 54; the current implementation is stable.

## Critical Implementation Notes
- **Filing System**: Always use the `/legacy` import for `expo-file-system` (`import * as FileSystem from 'expo-file-system/legacy'`) to avoid deprecation errors with `writeAsStringAsync`.
- **Notification Loading**: Never use a top-level static import for `expo-notifications`. Always load it via the `getNotifications()` helper to ensure lazy loading.

## Development Environment
- **Build Tool**: EAS (Expo Application Services).
- **Styling**: NativeWind (Tailwind CSS v4).
- **Architecture**: Service-oriented with React Context for state.
