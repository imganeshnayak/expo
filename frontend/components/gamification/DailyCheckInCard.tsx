import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, Flame, Gift, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loyaltyService, CheckInStatus } from '@/services/api/loyaltyService';
import { useUserStore } from '@/store/userStore';
import { useAppTheme } from '@/store/themeStore';

interface DailyCheckInCardProps {
    onCheckInSuccess?: () => void;
}

export const DailyCheckInCard: React.FC<DailyCheckInCardProps> = ({ onCheckInSuccess }) => {
    const theme = useAppTheme();
    const { fetchPendingRewards, fetchGamificationProfile } = useUserStore();
    const [status, setStatus] = useState<CheckInStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isDismissed, setIsDismissed] = useState(false);

    const DISMISS_KEY = 'daily_checkin_dismissed';

    useEffect(() => {
        loadDismissedState();
        loadStatus();
        const interval = setInterval(loadStatus, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (status && !status.canCheckIn && status.nextCheckInAt) {
            const interval = setInterval(() => {
                updateTimeRemaining();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status]);

    const loadDismissedState = async () => {
        try {
            const dismissed = await AsyncStorage.getItem(DISMISS_KEY);
            if (dismissed) {
                const dismissedTime = new Date(dismissed).getTime();
                const now = new Date().getTime();
                const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);

                // Auto-show after 24 hours
                if (hoursSinceDismissed >= 24) {
                    setIsDismissed(false);
                    await AsyncStorage.removeItem(DISMISS_KEY);
                } else {
                    setIsDismissed(true);
                }
            }
        } catch (error) {
            console.error('Failed to load dismissed state:', error);
        }
    };

    const handleDismiss = async () => {
        try {
            await AsyncStorage.setItem(DISMISS_KEY, new Date().toISOString());
            setIsDismissed(true);
        } catch (error) {
            console.error('Failed to save dismissed state:', error);
        }
    };

    const loadStatus = async () => {
        try {
            const response = await loyaltyService.getCheckInStatus();
            if (!response.error && response.data) {
                setStatus(response.data);
                updateTimeRemaining();
            }
        } catch (error) {
            console.error('Failed to load check-in status:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTimeRemaining = () => {
        if (!status || status.canCheckIn || !status.nextCheckInAt) {
            setTimeRemaining('');
            return;
        }

        const now = new Date().getTime();
        const nextCheckIn = new Date(status.nextCheckInAt).getTime();
        const diff = nextCheckIn - now;

        if (diff <= 0) {
            setTimeRemaining('Ready!');
            loadStatus(); // Refresh status
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    const handleCheckIn = async () => {
        if (!status?.canCheckIn || checking) return;

        setChecking(true);
        try {
            const response = await loyaltyService.dailyCheckIn();
            if (!response.error && response.data) {
                await loadStatus();
                await fetchPendingRewards();
                await fetchGamificationProfile();
                onCheckInSuccess?.();
            }
        } catch (error: any) {
            console.error('Check-in failed:', error);
            // Refresh status in case of error
            await loadStatus();
        } finally {
            setChecking(false);
        }
    };

    if (isDismissed) {
        return null;
    }

    if (loading) {
        return (
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }

    const canCheckIn = status?.canCheckIn ?? false;

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
                        <Calendar size={20} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Daily Check-in</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Earn 10 XP every day
                        </Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    {status && status.currentStreak > 0 && (
                        <View style={styles.streakBadge}>
                            <Flame size={14} color="#FF6B35" />
                            <Text style={[styles.streakText, { color: theme.colors.text }]}>
                                {status.currentStreak}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
                        onPress={handleDismiss}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <X size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor: canCheckIn ? theme.colors.primary : theme.colors.background,
                        opacity: canCheckIn ? 1 : 0.6,
                    },
                ]}
                onPress={handleCheckIn}
                disabled={!canCheckIn || checking}
                activeOpacity={0.8}
            >
                {checking ? (
                    <ActivityIndicator size="small" color={theme.colors.background} />
                ) : (
                    <>
                        <Gift size={18} color={canCheckIn ? theme.colors.background : theme.colors.textSecondary} />
                        <Text
                            style={[
                                styles.buttonText,
                                { color: canCheckIn ? theme.colors.background : theme.colors.textSecondary },
                            ]}
                        >
                            {canCheckIn ? 'Check In Now' : `Next in ${timeRemaining}`}
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {status && !canCheckIn && (
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                        Come back in {status.hoursRemaining}h {status.minutesRemaining}m
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
    },
    streakText: {
        fontSize: 14,
        fontWeight: '700',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
