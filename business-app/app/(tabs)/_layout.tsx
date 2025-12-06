import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BarChart3, Megaphone, Users, User } from 'lucide-react-native';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationCenter from './notifications';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function BusinessLayout() {
    const { isModalOpen, setModalOpen } = useNotificationStore();
    const theme = useAppTheme();

    return (
        <>
            <Tabs
                key={theme.mode}
                screenOptions={{
                    headerShown: false, // Disabling default header
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.textTertiary,
                    tabBarStyle: {
                        backgroundColor: theme.colors.surface,
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.surfaceLight,
                        height: 70,
                        paddingBottom: 10,
                        paddingTop: 10,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '500',
                        marginTop: 4,
                    },
                    tabBarIconStyle: {
                        marginBottom: 0,
                    },
                }}
            >
                <Tabs.Screen
                    name="analytics"
                    options={{
                        title: 'Analytics',
                        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                            <BarChart3 color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="campaigns"
                    options={{
                        title: 'Promotions',
                        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                            <Megaphone color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="crm"
                    options={{
                        title: 'Customers',
                        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                            <Users color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                            <User color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="customer-detail"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="notifications"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="campaign-creator-modal"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="business-profile-edit-modal"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>

            <NotificationCenter
                visible={isModalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
}
