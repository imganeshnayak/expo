import { Stack } from 'expo-router';

export default function ArenaLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen
                name="waiting"
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="battle"
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="results"
                options={{
                    gestureEnabled: false,
                }}
            />
        </Stack>
    );
}
