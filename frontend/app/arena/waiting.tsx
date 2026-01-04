import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Swords, Clock, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/store/themeStore';
import { useArenaStore } from '@/store/arenaStore';

export default function WaitingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const { currentChallenge, cancelChallenge } = useArenaStore();

    const [countdown, setCountdown] = useState(30);
    const [dots, setDots] = useState('');

    useEffect(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const dotTimer = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        // Simulate opponent accepting after a few seconds (demo)
        const demoTimer = setTimeout(() => {
            handleAccepted();
        }, 5000);

        return () => {
            clearInterval(timer);
            clearInterval(dotTimer);
            clearTimeout(demoTimer);
        };
    }, []);

    const handleTimeout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        cancelChallenge();
        router.replace('/arena' as any);
    };

    const handleAccepted = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({
            pathname: '/arena/battle' as any,
            params: { challengeId: params.challengeId },
        });
    };

    const handleCancel = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        cancelChallenge();
        router.replace('/arena' as any);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={['#0a1628', '#1a2a4a', '#0f1f3a']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
                {/* Spinning loader */}
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                </View>

                <Text style={styles.title}>Waiting for opponent{dots}</Text>
                <Text style={styles.subtitle}>
                    {currentChallenge?.opponentName || 'Opponent'} is deciding...
                </Text>

                {/* Countdown */}
                <View style={styles.countdownBox}>
                    <Clock size={20} color={countdown <= 10 ? '#FF4757' : '#FFF'} />
                    <Text style={[
                        styles.countdownText,
                        countdown <= 10 && styles.countdownUrgent
                    ]}>
                        {countdown}s
                    </Text>
                </View>

                {/* Battle Info */}
                {currentChallenge && (
                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Mode</Text>
                            <Text style={styles.infoValue}>
                                {(currentChallenge.mode || '1v1').toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Stake</Text>
                            <Text style={styles.infoValue}>
                                {currentChallenge.stake?.type === 'pride'
                                    ? 'Pride Only'
                                    : `${currentChallenge.stake?.amount || 0} ${(currentChallenge.stake?.type || 'XP').toUpperCase()}`
                                }
                            </Text>
                        </View>
                    </View>
                )}

                {/* Cancel Button */}
                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleCancel}
                >
                    <X size={20} color="#FF4757" />
                    <Text style={styles.cancelText}>Cancel Challenge</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a1628',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loaderContainer: {
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 24,
    },
    countdownBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 30,
    },
    countdownText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
    },
    countdownUrgent: {
        color: '#FF4757',
    },
    infoBox: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF4757',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF4757',
    },
});
