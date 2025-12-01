import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BarChart3, Megaphone, Users, User, Bell } from 'lucide-react-native';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationCenter from './notifications';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function BusinessLayout() {
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = useNotificationStore(state => state.unreadCount);
    const theme = useAppTheme();

    const styles = getStyles(theme);

    return (
        <>
            <Tabs
                key={theme.mode}
                screenOptions={{
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
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: theme.colors.background,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.surfaceLight,
                    },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: {
                        fontWeight: '600',
                        fontSize: 22,
                    },
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => setShowNotifications(true)}
                            style={styles.notificationButton}
                        >
                            <Bell size={22} color={theme.colors.text} />
                            {unreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ),
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
                        href: null, // Hide from tabs - only accessible via navigation
                    }}
                />
                <Tabs.Screen
                    name="notifications"
                    options={{
                        href: null, // Hide from tabs - modal only
                    }}
                />
                <Tabs.Screen
                    name="campaign-creator-modal"
                    options={{
                        href: null, // Hide from tabs - modal only
                    }}
                />
                <Tabs.Screen
                    name="business-profile-edit-modal"
                    options={{
                        href: null, // Hide from tabs - modal only
                    }}
                />
            </Tabs>

            <NotificationCenter
                visible={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    notificationButton: {
        marginRight: 16,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: theme.colors.secondary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
});
