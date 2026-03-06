# Architecture Documentation: Salary Manager

The Salary Manager app follows a modular, service-oriented architecture designed for scalability, maintainability, and clean separation of concerns.

## 1. Directory Structure

- **`app/`**: File-based routing for Expo Router.
  - `(tabs)/`: Main navigation screens (Home, Dashboard, Settings).
  - `(guest)/`: Onboarding and initial setup flow.
- **`services/`**: Core business logic and background processes.
  - `smsReaderService.ts`: Native SMS integration.
  - `smsParserService.ts`: Regex engines for transaction data extraction.
  - `notificationService.ts`: Local alert management with lazy loading.
  - `expenseDetectionService.ts`: Bridges SMS results with finance state.
- **`context/`**: Global state management.
  - `FinanceContext.tsx`: Manages core financial data (salary, expenses, dashboard).
- **`store/`**: Configuration state.
  - `settingsStore.tsx`: Manages user preferences and persistent app settings.
- **`components/`**: Atomic and molecular UI components.
  - `ui/`: Foundation components (buttons, cards).
- **`utils/`**: Shared logic, formatters, and complex calculation engines.
  - `analyticsEngine.ts`: The "brain" behind projections and safe-spend limits.

## 2. Global State & Data Flow

### Finance Context
The `FinanceProvider` acts as the central source of truth. It persists data to local storage and provides methods to:
1. Update salary configuration.
2. Register manual or detected expenses.
3. Refresh dashboard analytics.

### Service Interactions
1. **SMS Pipeline**: `smsReaderService` → `smsParserService` → `expenseDetectionService` → `FinanceContext`.
2. **Notification Pipeline**: Any Service/Component → `notificationService` → Device Alerts.
3. **Analytics Pipeline**: `FinanceContext` → `analyticsEngine` → Dashboard UI.

## 3. Communication Patterns
- **Hooks**: Use custom hooks like `useFinance` and `useSettings` for component-to-state communication.
- **Services**: Pure logic classes or function sets that operate independently of the UI.
- **Lazy Loading**: Critical libraries (like `expo-notifications`) are loaded only when needed to optimize startup performance in Expo Go.

## 4. Technology Decisions
- **Expo Router**: Chosen for its robust navigation and deep linking capabilities.
- **NativeWind**: Provides a consistent design system while staying close to web standards.
- **React Native Reanimated**: Leveraged for high-frame-rate interactions without blocking the JS thread.
- **Legacy Filesystem Support**: Uses `expo-file-system/legacy` to maintain stability during SDK transistions (SDK 54).

## 5. Security Architecture
- **Local Persistence**: Data sensitive to the user remains on-device.
- **Biometric Integration**: Access controlled via hardware-level authentication APIs where available.
