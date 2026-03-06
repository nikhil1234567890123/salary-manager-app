# Salary Manager App Structure

## Frontend
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: Expo Router (File-based)
- **Styling**: NativeWind (Tailwind CSS)
- **Language**: TypeScript

## Main Features
- **Salary Tracking**: Configure monthly income and fixed obligations.
- **Expense Management**: Add, categorize, and monitor daily spending.
- **SMS Expense Detection**: Automatically capture UPI/Bank alerts.
- **Smart Spending Insights**: Predictive analytics for end-of-month balance.
- **Notifications**: Local alerts for overspending and expense confirmation.
- **Reports & Analytics**: Weekly trends and monthly summary exports.

## Backend
- **Database**: Supabase (Architecture is future-ready for sync).
- **Authentication**: Local/Guest mode with optional Biometrics.

## Storage
- **Local Persistence**: `@react-native-async-storage/async-storage` for all financial data.

## Key Libraries
- `expo-router`: Modern navigation stack.
- `expo-notifications`: Local alert system.
- `react-native-svg`: Vector charts and icons.
- `react-native-reanimated`: High-performance animations.
- `expo-file-system`: Document and data exports.
