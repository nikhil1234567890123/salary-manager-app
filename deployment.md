# Deployment Process: Salary Manager

The application uses **EAS (Expo Application Services)** for building and deploying the mobile binary.

## Build Commands

### Android Production Build
Build a production-ready APK/AAB for the Google Play Store.
```bash
npx eas build -p android
```

### Preview Build
Build a version for internal testing (requires dev-client or specific configuration).
```bash
npx eas build -p android --profile preview
```

## Over-The-Air (OTA) Updates
Push JS changes instantly without requiring a full app store submission.
```bash
npx eas update --message "Describe your changes"
```

## Dashboard & Monitoring
- **Expo Dashboard**: [https://expo.dev](https://expo.dev)
- **EAS Project ID**: `83d9fd5d-19ee-4840-b8c7-0c695f5af591`

## Versioning
- Current Version: `1.0.1` (Incremented in `app.json`)
- SDK Version: `54.0.0`
