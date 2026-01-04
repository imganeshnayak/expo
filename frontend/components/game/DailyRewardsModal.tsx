import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Flame, Gift, Check, Lock, Sparkles } from 'lucide-react-native';
import { useGameStore, DailyReward } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface DailyRewardsModalProps {
    visible: boolean;
    onClose: () => void;
}

const REWARD_COLORS: Record<number, string[]> = {
    1: ['#4CAF50', '#66BB6A'],
    2: ['#2196F3', '#42A5F5'],
    3: ['#9C27B0', '#AB47BC'],
    4: ['#FF9800', '#FFB74D'],
    5: ['#E91E63', '#EC407A'],
    6: ['#673AB7', '#7E57C2'],
    7: ['#FFD700', '#FFEB3B'],
};

export default function DailyRewardsModal({ visible, onClose }: DailyRewardsModalProps) {
    const { streak, dailyRewards, claimDailyReward, xpMultiplier } = useGameStore();
    const { addXP } = useUserStore();
    const [claimAnimation] = useState(new Animated.Value(1));
    const [claimedToday, setClaimedToday] = useState(false);

    const handleClaim = (day: number, xp: number) => {
        if (day > streak.currentStreak || dailyRewards[day - 1].claimed) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Animate
        Animated.sequence([
            Animated.timing(claimAnimation, {
                toValue: 1.2,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(claimAnimation, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();

        const success = claimDailyReward(day);
        if (success) {
            // Add XP with multiplier
            const xpEarned = Math.floor(xp * xpMultiplier);
            addXP?.(xpEarned);
            setClaimedToday(true);
        }
    };

    const renderRewardDay = (reward: DailyReward) => {
        const isUnlocked = reward.day <= streak.currentStreak;
        const isClaimed = reward.claimed;
        const isToday = reward.day === streak.currentStreak && !isClaimed;
        const colors = REWARD_COLORS[reward.day] || ['#666', '#888'];

        return (
            <TouchableOpacity
                key={reward.day}
                style={[
                    styles.rewardCard,
                    isToday && styles.rewardCardToday,
                    !isUnlocked && styles.rewardCardLocked,
                ]}
                onPress={() => isToday && handleClaim(reward.day, reward.xp)}
                disabled={!isToday || isClaimed}
                activeOpacity={isToday ? 0.7 : 1}
            >
                <LinearGradient
                    colors={isClaimed ? (['#333', '#444'] as const) : isUnlocked ? (colors as [string, string]) : (['#222', '#333'] as const)}
                    style={styles.rewardGradient}
                >
                    <Text style={styles.dayText}>Day {reward.day}</Text>

                    {isClaimed ? (
                        <View style={styles.claimedIcon}>
                            <Check size={24} color="#00D9A3" />
                        </View>
                    ) : !isUnlocked ? (
                        <View style={styles.lockedIcon}>
                            <Lock size={20} color="#666" />
                        </View>
                    ) : (
                        <View style={styles.giftIcon}>
                            <Gift size={28} color="#FFF" />
                        </View>
                    )}

                    <Text style={[styles.xpText, !isUnlocked && styles.xpTextLocked]}>
                        +{reward.xp} XP
                    </Text>

                    {reward.bonus && isUnlocked && (
                        <Text style={styles.bonusText}>{reward.bonus}</Text>
                    )}
                </LinearGradient>

                {isToday && !isClaimed && (
                    <View style={styles.claimBadge}>
                        <Sparkles size={12} color="#FFD700" />
                        <Text style={styles.claimText}>CLAIM</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Flame size={28} color="#FF6B35" />
                            <View>
                                <Text style={styles.title}>Daily Streak</Text>
                                <Text style={styles.subtitle}>
                                    {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''} • {xpMultiplier}x XP
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {/* XP Multiplier Banner */}
                    {xpMultiplier > 1 && (
                        <LinearGradient
                            colors={['#FF6B35', '#FF8F5E']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.multiplierBanner}
                        >
                            <Sparkles size={18} color="#FFF" />
                            <Text style={styles.multiplierText}>
                                {xpMultiplier}x XP Boost Active! Keep your streak going!
                            </Text>
                        </LinearGradient>
                    )}

                    {/* Rewards Grid */}
                    <View style={styles.rewardsGrid}>
                        {dailyRewards.map(renderRewardDay)}
                    </View>

                    {/* Bottom Info */}
                    <View style={styles.bottomInfo}>
                        <Text style={styles.infoText}>
                            🛡️ Streak Protection: {streak.streakProtectionUsed ? 'Used' : 'Available'} (7+ day streaks)
                        </Text>
                        <Text style={styles.infoText}>
                            🏆 Longest Streak: {streak.longestStreak} days
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width - 32,
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
    subtitle: {
        fontSize: 14,
        color: '#999',
        marginTop: 2,
    },
    closeButton: {
        padding: 8,
    },
    multiplierBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    multiplierText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 13,
    },
    rewardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    rewardCard: {
        width: (width - 32 - 40 - 20) / 4,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    rewardCardToday: {
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    rewardCardLocked: {
        opacity: 0.5,
    },
    rewardGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        minHeight: 90,
    },
    dayText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFF',
        opacity: 0.8,
        marginBottom: 6,
    },
    giftIcon: {
        marginVertical: 4,
    },
    claimedIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 217, 163, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 4,
    },
    lockedIcon: {
        marginVertical: 4,
    },
    xpText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: 6,
    },
    xpTextLocked: {
        color: '#666',
    },
    bonusText: {
        fontSize: 9,
        color: '#FFD700',
        marginTop: 4,
        textAlign: 'center',
    },
    claimBadge: {
        position: 'absolute',
        bottom: -8,
        left: '50%',
        transform: [{ translateX: -30 }],
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    claimText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    bottomInfo: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#333',
        gap: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});
