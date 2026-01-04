import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppTheme } from '../hooks/useAppTheme';

export default function Index() {
    const theme = useAppTheme();
    const { user, token, loadUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await loadUser();
            setIsLoading(false);
        };
        init();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Not logged in -> go to login
    if (!token || !user) {
        return <Redirect href="/(auth)/login" />;
    }

    // Logged in but setup not complete -> go to setup
    const isSetupComplete = user?.businessType && user?.address;
    if (!isSetupComplete) {
        return <Redirect href="/(auth)/setup" />;
    }

    // Logged in and setup complete -> go to main app
    return <Redirect href="/(tabs)/analytics" />;
}
