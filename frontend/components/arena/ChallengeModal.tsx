import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    FadeIn,
    SlideInUp,
} from 'react-native-reanimated';
import {
    X,
    Swords,
    Shield,
    Trophy,
    Flame,
    Star,
    Coins,
    Zap,
    Crown,
    Users,
    Target,
    Gift,
    AlertTriangle,
    Check,
    Skull,
    Heart,
} from 'lucide-react-native';
import { useAppTheme } from '@/store/themeStore';
import { useArenaStore, NearbyPlayer, BattleStake, BattleMode, StakeType } from '@/store/arenaStore';
import { useRouter } from 'expo-router';

interface ChallengeModalProps {
    visible: boolean;
    player: NearbyPlayer;
    onClose: () => void;
}

const BATTLE_MODES: { mode: BattleMode; label: string; icon: any; description: string; duration: string }[] = [
    { mode: '1v1', label: '1v1 Duel', icon: Swords, description: 'Classic battle, first to 3 kills', duration: '3-5 min' },
    { mode: '2v2', label: '2v2 Team', icon: Users, description: 'Team up with a partner', duration: '5-8 min' },
    { mode: 'koth', label: 'King of Hill', icon: Crown, description: 'Control the zone for points', duration: '4-6 min' },
    { mode: 'collect', label: 'Collect Rush', icon: Target, description: 'First to collect 10 items', duration: '3-4 min' },
];

const STAKE_PRESETS: { type: StakeType; amounts: number[]; icon: any; color: string }[] = [
    { type: 'pride', amounts: [0], icon: Trophy, color: '#FFD700' },
    { type: 'xp', amounts: [25, 50, 100, 200], icon: Zap, color: '#00D9A3' },
    { type: 'coins', amounts: [10, 25, 50, 100], icon: Coins, color: '#FFB800' },
];

export default function ChallengeModal({ visible, player, onClose }: ChallengeModalProps) {
    const theme = useAppTheme();
    const router = useRouter();
    const { sendChallenge, winStreak } = useArenaStore();

    const [selectedMode, setSelectedMode] = useState<BattleMode>('1v1');
    const [selectedStakeType, setSelectedStakeType] = useState<StakeType>('pride');
    const [selectedStakeAmount, setSelectedStakeAmount] = useState(0);
    const [customMessage, setCustomMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Animations
    const buttonScale = useSharedValue(1);
    const pulseAnim = useSharedValue(1);

    useEffect(() => {
        pulseAnim.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 800 }),
                withTiming(1, { duration: 800 })
            ),
            -1,
            true
        );
    }, []);

    const buttonAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseAnim.value }],
    }));

    const handleStakeTypeSelect = (type: StakeType) => {
        Haptics.selectionAsync();
        setSelectedStakeType(type);
        const preset = STAKE_PRESETS.find(p => p.type === type);
        setSelectedStakeAmount(preset?.amounts[0] || 0);
    };

    const handleSendChallenge = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsSending(true);
        buttonScale.value = withSpring(0.95, {}, () => {
            buttonScale.value = withSpring(1);
        });

        const stake: BattleStake = {
            type: selectedStakeType,
            amount: selectedStakeAmount,
        };

        // Send the challenge
        const challenge = sendChallenge(player, selectedMode, stake, customMessage || undefined);

        // Navigate to waiting screen
        setTimeout(() => {
            onClose();
            router.push({
                pathname: '/arena/waiting' as any,
                params: { challengeId: challenge.id },
            });
        }, 500);
    };

    const getWinReward = (): string => {
        if (selectedStakeType === 'pride') return 'Leaderboard Points + XP';
        if (selectedStakeType === 'xp') return `+${Math.floor(selectedStakeAmount * winStreak.multiplier)} XP`;
        if (selectedStakeType === 'coins') return `+${selectedStakeAmount} Coins`;
        return '';
    };

    const getLoseRisk = (): string => {
        if (selectedStakeType === 'pride') return 'Just pride (no loss)';
        if (selectedStakeType === 'xp') return `-${Math.floor(selectedStakeAmount * 0.5)} XP`;
        if (selectedStakeType === 'coins') return `-${selectedStakeAmount} Coins`;
        return '';
    };

    const isRival = player.headToHead.losses > player.headToHead.wins;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    entering={SlideInUp.springify().damping(15)}
                    style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
                >
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Opponent Header */}
                        <View style={styles.opponentSection}>
                            <Animated.View style={[styles.avatarBig, pulseStyle]}>
                                <Text style={styles.avatarBigEmoji}>{player.avatar}</Text>
                                {isRival && (
                                    <View style={styles.rivalBadge}>
                                        <Skull size={14} color="#FFF" />
                                    </View>
                                )}
                            </Animated.View>

                            <Text style={[styles.opponentName, { color: theme.colors.text }]}>
                                {player.username}
                            </Text>

                            <View style={styles.opponentStats}>
                                <View style={styles.opponentStat}>
                                    <Star size={14} color={theme.colors.primary} />
                                    <Text style={styles.opponentStatText}>Lvl {player.level}</Text>
                                </View>
                                <View style={styles.opponentStat}>
                                    <Trophy size={14} color="#FFD700" />
                                    <Text style={styles.opponentStatText}>{player.winRate}% WR</Text>
                                </View>
                                <View style={styles.opponentStat}>
                                    <Flame size={14} color="#FF6B35" />
                                    <Text style={styles.opponentStatText}>{player.currentStreak}🔥</Text>
                                </View>
                            </View>

                            {/* Head to Head */}
                            {(player.headToHead.wins > 0 || player.headToHead.losses > 0) && (
                                <View style={[styles.h2hBox, isRival && styles.h2hBoxRival]}>
                                    <Text style={styles.h2hLabel}>HEAD TO HEAD</Text>
                                    <Text style={styles.h2hRecord}>
                                        {player.headToHead.wins}W - {player.headToHead.losses}L
                                    </Text>
                                    {isRival && (
                                        <Text style={styles.revengeText}>⚡ REVENGE MATCH</Text>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Battle Mode Selection */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Battle Mode
                            </Text>
                            <View style={styles.modesGrid}>
                                {BATTLE_MODES.map(({ mode, label, icon: Icon, description, duration }) => (
                                    <TouchableOpacity
                                        key={mode}
                                        style={[
                                            styles.modeCard,
                                            {
                                                backgroundColor: selectedMode === mode
                                                    ? theme.colors.primary + '20'
                                                    : 'rgba(255,255,255,0.05)',
                                                borderColor: selectedMode === mode
                                                    ? theme.colors.primary
                                                    : 'transparent',
                                            },
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setSelectedMode(mode);
                                        }}
                                    >
                                        <Icon
                                            size={20}
                                            color={selectedMode === mode ? theme.colors.primary : theme.colors.textSecondary}
                                        />
                                        <Text style={[
                                            styles.modeLabel,
                                            { color: selectedMode === mode ? theme.colors.primary : theme.colors.text }
                                        ]}>
                                            {label}
                                        </Text>
                                        <Text style={styles.modeDuration}>{duration}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Stake Selection */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Stakes
                            </Text>

                            {/* Stake Type Tabs */}
                            <View style={styles.stakeTabs}>
                                {STAKE_PRESETS.map(({ type, icon: Icon, color }) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.stakeTab,
                                            selectedStakeType === type && { backgroundColor: color + '20', borderColor: color },
                                        ]}
                                        onPress={() => handleStakeTypeSelect(type)}
                                    >
                                        <Icon size={18} color={selectedStakeType === type ? color : theme.colors.textSecondary} />
                                        <Text style={[
                                            styles.stakeTabText,
                                            { color: selectedStakeType === type ? color : theme.colors.textSecondary },
                                        ]}>
                                            {type === 'pride' ? 'Pride' : type.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Amount Selection */}
                            {selectedStakeType !== 'pride' && (
                                <View style={styles.amountRow}>
                                    {STAKE_PRESETS.find(p => p.type === selectedStakeType)?.amounts.map(amount => (
                                        <TouchableOpacity
                                            key={amount}
                                            style={[
                                                styles.amountBtn,
                                                selectedStakeAmount === amount && {
                                                    backgroundColor: theme.colors.primary,
                                                    borderColor: theme.colors.primary,
                                                },
                                            ]}
                                            onPress={() => {
                                                Haptics.selectionAsync();
                                                setSelectedStakeAmount(amount);
                                            }}
                                        >
                                            <Text style={[
                                                styles.amountText,
                                                selectedStakeAmount === amount && { color: '#FFF' },
                                            ]}>
                                                {amount}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Win/Lose Preview */}
                            <View style={styles.stakePreview}>
                                <View style={styles.previewItem}>
                                    <View style={[styles.previewIcon, { backgroundColor: '#00D9A320' }]}>
                                        <Check size={14} color="#00D9A3" />
                                    </View>
                                    <View>
                                        <Text style={styles.previewLabel}>If you WIN</Text>
                                        <Text style={[styles.previewValue, { color: '#00D9A3' }]}>
                                            {getWinReward()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.previewItem}>
                                    <View style={[styles.previewIcon, { backgroundColor: '#FF475720' }]}>
                                        <X size={14} color="#FF4757" />
                                    </View>
                                    <View>
                                        <Text style={styles.previewLabel}>If you LOSE</Text>
                                        <Text style={[styles.previewValue, { color: '#FF4757' }]}>
                                            {getLoseRisk()}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Streak Multiplier Banner */}
                            {winStreak.current > 0 && selectedStakeType !== 'pride' && (
                                <View style={styles.streakBanner}>
                                    <Flame size={16} color="#FF6B35" />
                                    <Text style={styles.streakBannerText}>
                                        {winStreak.multiplier}x XP MULTIPLIER ACTIVE! ({winStreak.current} streak)
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Optional Message */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Trash Talk (optional)
                            </Text>
                            <TextInput
                                style={[styles.messageInput, {
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    color: theme.colors.text,
                                }]}
                                placeholder="Say something to your opponent..."
                                placeholderTextColor={theme.colors.textSecondary}
                                value={customMessage}
                                onChangeText={setCustomMessage}
                                maxLength={50}
                            />
                        </View>

                        {/* Challenge Button */}
                        <Animated.View style={[styles.challengeBtnWrapper, buttonAnimStyle]}>
                            <TouchableOpacity
                                style={[styles.challengeBtn, isSending && styles.challengeBtnDisabled]}
                                onPress={handleSendChallenge}
                                disabled={isSending}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={['#FF6B35', '#FF4757'] as const}
                                    style={styles.challengeBtnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Swords size={22} color="#FFF" />
                                    <Text style={styles.challengeBtnText}>
                                        {isSending ? 'SENDING...' : 'SEND CHALLENGE'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Warning for real stakes */}
                        {selectedStakeType !== 'pride' && (
                            <View style={styles.warningBox}>
                                <AlertTriangle size={14} color="#FFB800" />
                                <Text style={styles.warningText}>
                                    Real stakes: You will {selectedStakeType === 'coins' ? 'lose coins' : 'lose XP'} if you forfeit or lose!
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 4,
    },
    opponentSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarBig: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarBigEmoji: {
        fontSize: 42,
    },
    rivalBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#FF4757',
        borderRadius: 12,
        padding: 4,
    },
    opponentName: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    opponentStats: {
        flexDirection: 'row',
        gap: 16,
    },
    opponentStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    opponentStatText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },
    h2hBox: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        alignItems: 'center',
    },
    h2hBoxRival: {
        backgroundColor: 'rgba(255,71,87,0.1)',
        borderWidth: 1,
        borderColor: '#FF4757',
    },
    h2hLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
    },
    h2hRecord: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    revengeText: {
        fontSize: 11,
        color: '#FF4757',
        fontWeight: '700',
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    modesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    modeCard: {
        width: '48%',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
    },
    modeLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 6,
    },
    modeDuration: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    stakeTabs: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    stakeTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    stakeTabText: {
        fontSize: 12,
        fontWeight: '600',
    },
    amountRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    amountBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
    },
    stakePreview: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    previewItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 10,
    },
    previewIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
    },
    previewValue: {
        fontSize: 12,
        fontWeight: '700',
    },
    streakBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,107,53,0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF6B35',
    },
    streakBannerText: {
        fontSize: 11,
        color: '#FF6B35',
        fontWeight: '600',
    },
    messageInput: {
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
    },
    challengeBtnWrapper: {
        marginTop: 10,
    },
    challengeBtn: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    challengeBtnDisabled: {
        opacity: 0.6,
    },
    challengeBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    challengeBtnText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 1,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,184,0,0.1)',
        borderRadius: 8,
    },
    warningText: {
        fontSize: 11,
        color: '#FFB800',
        flex: 1,
    },
});
