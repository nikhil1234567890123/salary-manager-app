# AI Prompt Archive: Salary Manager

These are the core prompts and goals used during the AI-assisted development phase of the Salary Manager app.

## 1. SMS Expense Detection
**Goal**: Automatically detect expenses from bank and UPI transaction SMS messages.
**Key Rules**:
- Separate logic from UI (Service-oriented).
- Implement robust regex for various Indian bank formats.
- Avoid duplicate detection for the same transaction.

## 2. Notification System Expansion
**Goal**: Implement a modular notification service for instant and scheduled alerts.
**Key Rules**:
- Use lazy loading (`require`) to prevent Expo Go boot-time crashes.
- Handle permissions gracefully at app startup.
- Implement reusable functions like `sendNotification` and `scheduleNotification`.

## 3. Financial Analytics Engine
**Goal**: Create a "brain" that calculates high-level financial health.
**Key Rules**:
- Calculate "Safe Daily Spend" by subtracting fixed expenses and savings goals from total salary.
- Provide end-of-month predictions based on current run-rate.

## 4. Report Export System
**Goal**: Allow users to export their monthly data to CSV.
**Key Rules**:
- Use `expo-file-system/legacy` for stability with SDK 54.
- Facilitate sharing via `expo-sharing`.

## 5. Security & UI Privacy
**Goal**: Implement biometrics and premium aesthetics.
**Rules**:
- Use NativeWind for styling.
- Ensure 20% savings is the default smart target.
- Implement Local Authentication (Biometrics/PIN).
