# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# Salary Manager

Salary Manager is a premium, high-performance fintech mobile application designed to act as your "premium personal accountant". With sleek dark and gold aesthetics, it helps users track monthly income, manage fixed obligations, and maintain financial discipline through intelligent automation. 

Unlike traditional manual trackers, Salary Manager drastically reduces user friction by automatically detecting transactions via SMS and providing proactive, data-driven financial insights. It is built with a privacy-first approach, keeping all sensitive data securely on your device.

---

## 🚀 Features

### 💰 Salary & Budget Setup
* **Configurable Income:** Easily set your monthly salary and fixed expenses (e.g., Rent, EMI).
* **Smart Targets:** Automatically calculates a default 20% savings goal.
* **Dynamic Daily Limit:** Computes a "Safe Daily Spend" based on your remaining balance and days left in the month to ensure you never overspend.

### 🤖 Automated Expense Detection
* **SMS Scanning:** Automatically detects bank and UPI transaction alerts from incoming SMS messages.
* **Intelligent Parsing:** Extracts the amount, merchant, and transaction type using advanced regex patterns.
* **Duplicate Prevention & Merchant Learning:** Identifies merchants from cryptic strings and actively prevents duplicate entries for the same transaction.

### 📊 Financial Analytics & Dashboard
* **Real-Time Overview:** Provides an instant snapshot of total expenses, spendable money, and current savings.
* **Predictive Forecasting:** Offers end-of-month predictions to let you know if you are on track to hit your savings target.
* **Spending Trends & Indicators:** Visual charts for weekly spending and color-coded progress bars (Safe/Warning/Overspent).

### 🔔 Smart Notifications & Security
* **Proactive Alerts:** Instant local notifications for newly detected expenses and overspending warnings when you exceed your daily limit.
* **Biometric Security:** Integrated app lock (Biometrics/PIN) to secure financial data.
* **CSV Export:** Export monthly spending data for tax filing or personal records.

---

## 🛠 Tech Stack

**Frontend & Mobile Framework**
* **Framework:** React Native with Expo (SDK 54)
* **Language:** TypeScript
* **Routing:** Expo Router (File-based navigation)
* **Styling:** NativeWind (Tailwind CSS v4)
* **Animations:** React Native Reanimated for high-frame-rate interactions

**Storage & Backend**
* **State Management:** React Context (`FinanceContext`)
* **Local Persistence:** `@react-native-async-storage/async-storage` for maximum privacy
* **Database Architecture:** Designed to be future-ready for multi-device real-time sync via Supabase

**Key Libraries**
* `expo-notifications`: Local alert system
* `react-native-svg`: Vector charts and icons
* `expo-file-system/legacy`: Document and data exports

---

## 🏗 Architecture

Salary Manager follows a strictly modular, service-oriented architecture designed for scalability and clean separation of concerns.

### Directory Structure
* `app/`: File-based routing for main tabs and guest onboarding flows.
* `services/`: Core business logic decoupled from the UI (e.g., `smsReaderService.ts`, `smsParserService.ts`, `expenseDetectionService.ts`).
* `context/`: `FinanceContext.tsx` acts as the single source of truth for financial data.
* `utils/`: Contains complex calculation engines, like the `analyticsEngine.ts` which serves as the "brain" behind financial projections.
* `components/`: Atomic and molecular UI components.

### Data Flow
1. **SMS Pipeline:** `smsReaderService` integrates natively and passes data to `smsParserService`, which then feeds into `expenseDetectionService` to update the global `FinanceContext`.
2. **Analytics Pipeline:** `FinanceContext` data is processed by the `analyticsEngine` and rendered on the Dashboard UI.
3. **Notification Pipeline:** Any service or component can trigger the `notificationService` for device alerts.

---

## 💻 Local Development

### Getting Started
1. **Install dependencies:** Run the standard package manager install command.
2. **Start the app:** Run the start command to open the Expo development menu.
3. **Run on Device:** Choose to open the app in a development build, Android emulator, iOS simulator, or Expo Go.

### Critical Developer Notes
* **File System Imports:** Always use the legacy import (`import * as FileSystem from 'expo-file-system/legacy'`) to avoid deprecation errors with `writeAsStringAsync` in SDK 54.
* **Lazy Loading Notifications:** Never use top-level static imports for `expo-notifications`. Load it via the `getNotifications()` helper to prevent boot-time crashes in Expo Go.
* **Permissions:** The `READ_SMS` permission is highly sensitive. Specific justification will be required when deploying to the Google Play Store to avoid rejection.

---

## 🚀 Deployment

The application uses **EAS (Expo Application Services)** for building and deploying the mobile binary.

* **Android Production Build:** Generate production-ready APK/AAB files for the Google Play Store.
* **Preview Build:** Create versions for internal testing using `dev-client`.
* **OTA Updates:** Push JavaScript changes instantly to users without requiring a full app store submission.

*Project Dashboard:* Monitor builds and updates via the Expo Dashboard (EAS Project ID: `83d9fd5d-19ee-4840-b8c7-0c695f5af591`).
