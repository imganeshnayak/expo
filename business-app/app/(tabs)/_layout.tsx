import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BarChart3, Megaphone, Users, User, Sparkles } from 'lucide-react-native';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationCenter from './notifications';
import { useAppTheme } from '../../hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function BusinessLayout() {
    const { isModalOpen, setModalOpen } = useNotificationStore();
    const theme = useAppTheme();

    return (
        <>
            <Tabs
                key={theme.mode}
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.textTertiary,
                    tabBarShowLabel: false, // Minimalist: No labels
                    tabBarStyle: {
                        backgroundColor: theme.colors.surface,
                        borderTopWidth: 0,
                        height: 70, // Taller for better touch
                        elevation: 0,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                        paddingTop: 12,
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
                        tabBarIcon: ({ color, size, focused }) => (
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <BarChart3 color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
                                {focused && (
                                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
                                )}
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="campaigns"
                    options={{
                        title: 'Promotions',
                        tabBarIcon: ({ color, size, focused }) => (
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <Megaphone color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
                                {focused && (
                                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
                                )}
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="ai-agent"
                    options={{
                        title: 'Nova AI',
                        tabBarIcon: ({ color, size, focused }) => (
                            <View style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: -20,
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: focused ? theme.colors.primary : theme.colors.background,
                                borderWidth: 3,
                                borderColor: theme.colors.surface,
                                shadowColor: theme.colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: focused ? 0.4 : 0.2,
                                shadowRadius: 8,
                                elevation: 8,
                            }}>
                                <Sparkles color={focused ? '#000' : theme.colors.primary} size={26} strokeWidth={2} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="crm"
                    options={{
                        title: 'Customers',
                        tabBarIcon: ({ color, size, focused }) => (
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <Users color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
                                {focused && (
                                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
                                )}
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, size, focused }) => (
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
                                {focused && (
                                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
                                )}
                            </View>
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
