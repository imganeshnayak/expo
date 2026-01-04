import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
    Trophy,
    Skull,
    Flame,
    Zap,
    Coins,
    RefreshCw,
    Home,
    Share2,
    Star,
    Shield,
    ArrowLeft,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useArenaStore } from '@/store/arenaStore';

export default function ResultsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { battleHistory, winStreak, stats } = useArenaStore();

    const won = params.won === 'true';
    const lastBattle = battleHistory[0];

    useEffect(() => {
        if (won) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    }, []);

    const handleRematch = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/arena' as any);
    };

    const handleGoHome = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.replace('/arena' as any);
    };

    const handleShare = async () => {
        Haptics.selectionAsync();
        try {
            await Share.share({
                message: won
                    ? `🏆 I just won a battle in Utopia Arena! ${winStreak.current} win streak! 🔥`
                    : `⚔️ Just had an intense battle in Utopia Arena! Time for revenge! 💪`,
            });
        } catch (e) {
            console.log('Share failed');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={won
                    ? ['#0D0D0D', '#0A2E1A', '#16213E', '#0D0D0D']
                    : ['#0D0D0D', '#2E0A0A', '#16213E', '#0D0D0D']
                }
                locations={[0, 0.3, 0.7, 1]}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Victory/Defeat Header */}
                <View style={styles.header}>
                    <View style={[styles.iconCircle, {
                        backgroundColor: won ? 'rgba(0,217,163,0.15)' : 'rgba(255,71,87,0.15)',
                        borderColor: won ? '#00D9A3' : '#FF4757',
                    }]}>
                        {won ? (
                            <Trophy size={56} color="#FFD700" />
                        ) : (
                            <Skull size={56} color="#FF4757" />
                        )}
                    </View>

                    <Text style={[styles.resultText, { color: won ? '#00D9A3' : '#FF4757' }]}>
                        {won ? '🏆 VICTORY!' : '💀 DEFEAT'}
                    </Text>

                    {lastBattle && (
                        <Text style={styles.scoreText}>
                            {lastBattle.myScore} - {lastBattle.opponentScore}
                        </Text>
                    )}
                </View>

                {/* Streak Display */}
                {won && winStreak.current > 0 && (
                    <View style={styles.streakSection}>
                        <LinearGradient
                            colors={['#FF6B35', '#FF4444']}
                            style={styles.streakGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Flame size={24} color="#FFF" />
                            <Text style={styles.streakText}>
                                {winStreak.current} WIN STREAK!
                            </Text>
                            <View style={styles.multiplierBadge}>
                                <Text style={styles.multiplierText}>{winStreak.multiplier}x XP</Text>
                            </View>
                        </LinearGradient>
                    </View>
                )}

                {/* Streak Shield Notice */}
                {!won && winStreak.shieldActive && (
                    <View style={styles.shieldSection}>
                        <Shield size={18} color="#00D9A3" />
                        <Text style={styles.shieldText}>
                            Streak Shield protected your {winStreak.current} streak!
                        </Text>
                    </View>
                )}

                {/* Rewards */}
                {lastBattle && (
                    <View style={styles.rewardsSection}>
                        <Text style={styles.sectionTitle}>BATTLE REWARDS</Text>

                        <View style={styles.rewardRow}>
                            <View style={styles.rewardItem}>
                                <LinearGradient
                                    colors={lastBattle.rewards.xp >= 0 ? ['#00D9A330', '#00D9A310'] : ['#FF475730', '#FF475710']}
                                    style={styles.rewardIcon}
                                >
                                    <Zap size={22} color={lastBattle.rewards.xp >= 0 ? '#00D9A3' : '#FF4757'} />
                                </LinearGradient>
                                <Text style={[
                                    styles.rewardValue,
                                    { color: lastBattle.rewards.xp >= 0 ? '#00D9A3' : '#FF4757' }
                                ]}>
                                    {lastBattle.rewards.xp >= 0 ? '+' : ''}{lastBattle.rewards.xp}
                                </Text>
                                <Text style={styles.rewardLabel}>XP</Text>
                            </View>

                            {lastBattle.rewards.coins !== 0 && (
                                <View style={styles.rewardItem}>
                                    <LinearGradient
                                        colors={['#FFB80030', '#FFB80010']}
                                        style={styles.rewardIcon}
                                    >
                                        <Coins size={22} color="#FFB800" />
                                    </LinearGradient>
                                    <Text style={[
                                        styles.rewardValue,
                                        { color: lastBattle.rewards.coins >= 0 ? '#FFB800' : '#FF4757' }
                                    ]}>
                                        {lastBattle.rewards.coins >= 0 ? '+' : ''}{lastBattle.rewards.coins}
                                    </Text>
                                    <Text style={styles.rewardLabel}>Coins</Text>
                                </View>
                            )}
                        </View>

                        {lastBattle.rewards.streakBonus && lastBattle.rewards.streakBonus > 1 && (
                            <Text style={styles.bonusText}>
                                🔥 Streak Bonus: {lastBattle.rewards.streakBonus}x
                            </Text>
                        )}

                        {lastBattle.wasClutch && won && (
                            <Text style={styles.bonusText}>
                                💪 Clutch Victory! (+50% XP)
                            </Text>
                        )}

                        {lastBattle.isRevenge && won && (
                            <Text style={styles.bonusText}>
                                ⚡ Revenge Complete! (+25% XP, +50 Coins)
                            </Text>
                        )}
                    </View>
                )}

                {/* Stats Update */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>YOUR ARENA STATS</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalWins}</Text>
                            <Text style={styles.statLabel}>Wins</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalLosses}</Text>
                            <Text style={styles.statLabel}>Losses</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.winRate.toFixed(0)}%</Text>
                            <Text style={styles.statLabel}>Win Rate</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    <TouchableOpacity
                        style={styles.rematchBtn}
                        onPress={handleRematch}
                    >
                        <LinearGradient
                            colors={['#FF4757', '#C0392B', '#8B0000']}
                            style={styles.rematchGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <RefreshCw size={22} color="#FFF" />
                            <Text style={styles.rematchText}>FIND NEW OPPONENT</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.secondaryButtons}>
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={handleShare}
                        >
                            <Share2 size={18} color="#FFF" />
                            <Text style={styles.secondaryBtnText}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={handleGoHome}
                        >
                            <Home size={18} color="#FFF" />
                            <Text style={styles.secondaryBtnText}>Game Hub</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Spacer */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    // Header
    header: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 40,
    },
    iconCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
    },
    resultText: {
        fontSize: 38,
        fontWeight: '900',
        letterSpacing: 2,
    },
    scoreText: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFF',
        marginTop: 8,
    },
    // Streak
    streakSection: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
    },
    streakGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    streakText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    multiplierBadge: {
        backgroundColor: 'rgba(255,215,0,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    multiplierText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFD700',
    },
    // Shield
    shieldSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,217,163,0.1)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,217,163,0.3)',
    },
    shieldText: {
        fontSize: 13,
        color: '#00D9A3',
        fontWeight: '600',
    },
    // Rewards
    rewardsSection: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 18,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 2,
        marginBottom: 16,
        textAlign: 'center',
    },
    rewardRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 50,
        marginBottom: 12,
    },
    rewardItem: {
        alignItems: 'center',
    },
    rewardIcon: {
        width: 50,
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    rewardValue: {
        fontSize: 22,
        fontWeight: '800',
    },
    rewardLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    bonusText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#FFD700',
        marginTop: 8,
    },
    // Stats
    statsSection: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 18,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statValue: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFF',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
    },
    // Actions
    actionsSection: {
        gap: 14,
    },
    rematchBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#FF4757',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    rematchGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
    },
    rematchText: {
        fontSize: 17,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 1,
    },
    secondaryButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    secondaryBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
});
