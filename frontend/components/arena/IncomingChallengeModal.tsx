import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import {
    Swords,
    X,
    Check,
    Flame,
    Trophy,
    Star,
    Coins,
    Zap,
    Skull,
    Clock,
} from 'lucide-react-native';
import { useAppTheme } from '@/store/themeStore';
import { useArenaStore, BattleChallenge } from '@/store/arenaStore';
import { useRouter } from 'expo-router';

interface IncomingChallengeModalProps {
    challenge: BattleChallenge;
}

export default function IncomingChallengeModal({ challenge }: IncomingChallengeModalProps) {
    const theme = useAppTheme();
    const router = useRouter();
    const { respondToChallenge, clearExpiredChallenges } = useArenaStore();

    const [timeLeft, setTimeLeft] = useState(30);
    const [isResponding, setIsResponding] = useState(false);

    // Animations
    const pulseScale = useSharedValue(1);
    const shakeX = useSharedValue(0);
    const glowOpacity = useSharedValue(0.5);
    const timerProgress = useSharedValue(1);

    useEffect(() => {
        // Intense haptic feedback - someone is challenging you!
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Vibration.vibrate([0, 200, 100, 200]);

        // Pulse animation for avatar
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 300 }),
                withTiming(1, { duration: 300 })
            ),
            -1,
            true
        );

        // Shake animation for urgency
        shakeX.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 50 }),
                withTiming(5, { duration: 100 }),
                withTiming(0, { duration: 50 })
            ),
            4,
            false
        );

        // Glow animation
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(0.3, { duration: 800 })
            ),
            -1,
            true
        );

        // Timer countdown
        const expiresAt = new Date(challenge.expiresAt).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeft(remaining);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    clearExpiredChallenges();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Animate timer bar
        timerProgress.value = withTiming(0, {
            duration: remaining * 1000,
            easing: Easing.linear,
        });

        return () => clearInterval(timer);
    }, [challenge.id]);

    // Periodic urgency haptics
    useEffect(() => {
        if (timeLeft <= 10 && timeLeft > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        if (timeLeft <= 5 && timeLeft > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    }, [timeLeft]);

    const handleAccept = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsResponding(true);
        respondToChallenge(challenge.id, true);

        // Navigate to battle loading
        router.push({
            pathname: '/arena/battle' as any,
            params: { challengeId: challenge.id },
        });
    }, [challenge.id]);

    const handleDecline = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsResponding(true);
        respondToChallenge(challenge.id, false);
    }, [challenge.id]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const timerBarStyle = useAnimatedStyle(() => ({
        width: `${timerProgress.value * 100}%`,
    }));

    const getStakeDisplay = () => {
        if (challenge.stake.type === 'pride') return 'Pride Only';
        if (challenge.stake.type === 'xp') return `${challenge.stake.amount} XP`;
        if (challenge.stake.type === 'coins') return `${challenge.stake.amount} Coins`;
        return '';
    };

    const getStakeIcon = () => {
        if (challenge.stake.type === 'xp') return <Zap size={14} color="#00D9A3" />;
        if (challenge.stake.type === 'coins') return <Coins size={14} color="#FFB800" />;
        return <Trophy size={14} color="#FFD700" />;
    };

    const getModeLabel = () => {
        switch (challenge.mode) {
            case '1v1': return '1v1 DUEL';
            case '2v2': return '2v2 TEAM';
            case 'koth': return 'KING OF HILL';
            case 'collect': return 'COLLECT RUSH';
            default: return 'BATTLE';
        }
    };

    if (timeLeft <= 0) return null;

    return (
        <Modal visible transparent animationType="fade">
            <View style={styles.overlay}>
                {/* Pulsing glow background */}
                <Animated.View style={[styles.glowBg, glowStyle]}>
                    <LinearGradient
                        colors={['transparent', '#FF475750', 'transparent'] as const}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>

                <Animated.View style={[styles.modal, shakeStyle]}>
                    {/* Urgent Header */}
                    <View style={styles.header}>
                        <LinearGradient
                            colors={['#FF4757', '#FF6B35'] as const}
                            style={styles.headerGradient}
                        >
                            <Swords size={24} color="#FFF" />
                            <Text style={styles.headerText}>⚔️ BATTLE REQUEST!</Text>
                        </LinearGradient>
                    </View>

                    {/* Timer Bar */}
                    <View style={styles.timerContainer}>
                        <Animated.View
                            style={[
                                styles.timerBar,
                                timerBarStyle,
                                { backgroundColor: timeLeft <= 10 ? '#FF4757' : '#00D9A3' },
                            ]}
                        />
                        <View style={styles.timerTextContainer}>
                            <Clock size={12} color={timeLeft <= 10 ? '#FF4757' : '#FFF'} />
                            <Text style={[
                                styles.timerText,
                                { color: timeLeft <= 10 ? '#FF4757' : '#FFF' },
                            ]}>
                                {timeLeft}s
                            </Text>
                        </View>
                    </View>

                    {/* Challenger Info */}
                    <View style={styles.challengerSection}>
                        <Animated.View style={[styles.challengerAvatar, pulseStyle]}>
                            <Text style={styles.challengerEmoji}>{challenge.challengerAvatar}</Text>
                        </Animated.View>

                        <Text style={styles.challengerName}>{challenge.challengerName}</Text>

                        <View style={styles.challengerStats}>
                            <View style={styles.statItem}>
                                <Star size={14} color={theme.colors.primary} />
                                <Text style={styles.statText}>Lvl {challenge.challengerLevel}</Text>
                            </View>
                            {challenge.challengerStreak > 0 && (
                                <View style={styles.statItem}>
                                    <Flame size={14} color="#FF6B35" />
                                    <Text style={styles.statText}>{challenge.challengerStreak}🔥</Text>
                                </View>
                            )}
                        </View>

                        {/* Trash talk message */}
                        {challenge.message && (
                            <View style={styles.messageBox}>
                                <Text style={styles.messageText}>"{challenge.message}"</Text>
                            </View>
                        )}
                    </View>

                    {/* Battle Details */}
                    <View style={styles.detailsSection}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>MODE</Text>
                            <Text style={styles.detailValue}>{getModeLabel()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>STAKES</Text>
                            <View style={styles.stakeValue}>
                                {getStakeIcon()}
                                <Text style={styles.detailValue}>{getStakeDisplay()}</Text>
                            </View>
                        </View>
                        {challenge.locationName && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>LOCATION</Text>
                                <Text style={styles.detailValue}>📍 {challenge.locationName}</Text>
                            </View>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.declineBtn}
                            onPress={handleDecline}
                            disabled={isResponding}
                            activeOpacity={0.8}
                        >
                            <X size={20} color="#FF4757" />
                            <Text style={styles.declineText}>DECLINE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.acceptBtn, isResponding && styles.btnDisabled]}
                            onPress={handleAccept}
                            disabled={isResponding}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#00D9A3', '#00A878'] as const}
                                style={styles.acceptGradient}
                            >
                                <Check size={20} color="#FFF" />
                                <Text style={styles.acceptText}>
                                    {isResponding ? 'LOADING...' : 'ACCEPT'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Stakes Warning */}
                    {challenge.stake.type !== 'pride' && (
                        <View style={styles.warningRow}>
                            <Skull size={12} color="#FF4757" />
                            <Text style={styles.warningText}>
                                You will lose {getStakeDisplay()} if you decline or lose!
                            </Text>
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    glowBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modal: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        width: '100%',
        maxWidth: 350,
        overflow: 'hidden',
    },
    header: {
        overflow: 'hidden',
    },
    headerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 1,
    },
    timerContainer: {
        height: 24,
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'relative',
    },
    timerBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },
    timerTextContainer: {
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timerText: {
        fontSize: 12,
        fontWeight: '700',
    },
    challengerSection: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    challengerAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,107,53,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FF6B35',
    },
    challengerEmoji: {
        fontSize: 36,
    },
    challengerName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
        marginTop: 10,
    },
    challengerStats: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },
    messageBox: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B35',
    },
    messageText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
    },
    detailsSection: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '600',
    },
    stakeValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
    },
    declineBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FF4757',
    },
    declineText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF4757',
    },
    acceptBtn: {
        flex: 1.5,
        borderRadius: 12,
        overflow: 'hidden',
    },
    btnDisabled: {
        opacity: 0.6,
    },
    acceptGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    acceptText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    warningText: {
        fontSize: 11,
        color: '#FF4757',
    },
});
