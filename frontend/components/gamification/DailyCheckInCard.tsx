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
    const { fetchPendingRewards, fetchGamificationProfile, user } = useUserStore();
    const [status, setStatus] = useState<CheckInStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isDismissed, setIsDismissed] = useState(false);

    const DISMISS_KEY = 'daily_checkin_dismissed';

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

    const useMockFallback = () => {
        // Fallback for demo/dev when backend is unreachable
        const now = new Date();
        const nextCheckIn = new Date(now);
        nextCheckIn.setHours(now.getHours() + 14); // Next check-in in 14 hours

        const mockStatus: CheckInStatus = {
            canCheckIn: false,
            lastCheckIn: new Date().toISOString(),
            nextCheckInAt: nextCheckIn.toISOString(),
            hoursRemaining: 14,
            minutesRemaining: 0,
            currentStreak: 5
        };
        setStatus(mockStatus);
    };

    const loadStatus = async () => {
        // Removed !user guard to allow fallback to work even if profile load failed
        try {
            const response = await loyaltyService.getCheckInStatus();
            if (!response.error && response.data) {
                // console.log('[CheckIn] Status loaded:', response.data);
                setStatus(response.data);
            } else {
                console.log('Daily Check-in status load failed, using fallback mock:', response.error);
                useMockFallback();
            }
        } catch (error) {
            console.error('Failed to load check-in status, using fallback mock:', error);
            useMockFallback();
        } finally {
            setLoading(false);
        }
    };

    // Initial load and Data Polling
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            await loadDismissedState();
            if (mounted) {
                await loadStatus();
            }
        };

        init();

        const pollInterval = setInterval(() => {
            if (mounted) loadStatus();
        }, 60000);

        return () => {
            mounted = false;
            clearInterval(pollInterval);
        };
    }, []);

    // UI Timer Ticking
    useEffect(() => {
        let mounted = true;

        const tickInterval = setInterval(() => {
            if (mounted && status?.nextCheckInAt) {
                updateTimeRemaining();
            }
        }, 1000);

        return () => {
            mounted = false;
            clearInterval(tickInterval);
        };
    }, [status]);

    // ... (rest of code)

    const updateTimeRemaining = (currentStatus = status) => {
        if (!currentStatus || currentStatus.canCheckIn || !currentStatus.nextCheckInAt) {
            setTimeRemaining('');
            return;
        }

        const now = new Date().getTime();
        const nextCheckIn = new Date(currentStatus.nextCheckInAt).getTime();

        if (isNaN(nextCheckIn)) {
            setTimeRemaining('Invalid Date');
            return;
        }

        const diff = nextCheckIn - now;

        if (diff <= 0) {
            setTimeRemaining('Ready!');
            loadStatus(); // Refresh status
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Standard HH:MM:SS format
        const pad = (n: number) => n.toString().padStart(2, '0');
        setTimeRemaining(`${hours}h:${pad(minutes)}m:${pad(seconds)}s`);
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

    // Determine button state and text
    const canCheckIn = status?.canCheckIn ?? false;
    let buttonText = '';
    let isButtonDisabled = false;

    if (!status) {
        buttonText = 'Unavailable';
        isButtonDisabled = true;
    } else if (checking) {
        buttonText = 'Checking in...';
        isButtonDisabled = true;
    } else if (canCheckIn) {
        buttonText = 'Check In Now';
        isButtonDisabled = false;
    } else {
        // Fallback for initial render before effect runs
        if (!timeRemaining && status.nextCheckInAt) {
            const now = new Date().getTime();
            const nextCheckIn = new Date(status.nextCheckInAt).getTime();
            const diff = nextCheckIn - now;
            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                const pad = (n: number) => n.toString().padStart(2, '0');
                buttonText = `Next in ${hours}h:${pad(minutes)}m:${pad(seconds)}s`;
            } else {
                buttonText = 'Wait...';
            }
        } else {
            buttonText = `Next in ${timeRemaining}`;
        }
        isButtonDisabled = true;
    }

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
                        backgroundColor: !isButtonDisabled ? theme.colors.primary : theme.colors.background,
                        opacity: !isButtonDisabled ? 1 : 0.6,
                    },
                ]}
                onPress={handleCheckIn}
                disabled={isButtonDisabled}
                activeOpacity={0.8}
            >
                {checking ? (
                    <ActivityIndicator size="small" color={theme.colors.background} />
                ) : (
                    <>
                        <Gift size={18} color={!isButtonDisabled ? theme.colors.background : theme.colors.textSecondary} />
                        <Text
                            style={[
                                styles.buttonText,
                                { color: !isButtonDisabled ? theme.colors.background : theme.colors.textSecondary },
                            ]}
                        >
                            {buttonText}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
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
