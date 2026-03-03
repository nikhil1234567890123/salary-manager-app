import { Stack } from 'expo-router';

export default function GuestLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="setup" />
            <Stack.Screen name="dashboard" />
        </Stack>
    );
}
