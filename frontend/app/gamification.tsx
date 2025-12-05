import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, Trophy, Lock, CheckCircle, Zap, Star, Info, X,
    Target, Map, BrainCircuit, User, CreditCard, Award, Crown, Palette, Ban, Flame, ChevronRight
} from 'lucide-react-native';
import { theme as staticTheme } from '@/constants/theme';
import { useAppTheme } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { RANKS, XP_ACTIONS, FEATURE_UNLOCKS, type FeatureId } from '@/constants/gamification';
import { XPBar } from '@/components/gamification/XPBar';
import { DailyCheckInCard } from '@/components/gamification/DailyCheckInCard';

// 1. Flattened Feature List (Single List, No Tiers)
const ALL_FEATURES = [
    { id: 'MISSIONS', name: 'Missions', xp: FEATURE_UNLOCKS.MISSIONS, icon: Target },
    { id: 'UTOPIA_MAP', name: 'Map', xp: FEATURE_UNLOCKS.UTOPIA_MAP, icon: Map },
    { id: 'AVATAR', name: 'Avatar', xp: FEATURE_UNLOCKS.AVATAR, icon: User },
    { id: 'FLASH_DEALS', name: 'Flash Deals', xp: FEATURE_UNLOCKS.FLASH_DEALS, icon: Zap },
    { id: 'SKILL_TREES', name: 'Skills', xp: FEATURE_UNLOCKS.SKILL_TREES, icon: BrainCircuit },
    { id: 'PAY_LATER', name: 'Pay Later', xp: FEATURE_UNLOCKS.PAY_LATER, icon: CreditCard },
    { id: 'LEADERBOARD', name: 'Rankings', xp: FEATURE_UNLOCKS.LEADERBOARD, icon: Award },
    { id: 'XP_MULTIPLIER', name: '2x XP', xp: FEATURE_UNLOCKS.XP_MULTIPLIER, icon: Flame },
    { id: 'PREMIUM_SKIN', name: 'Skins', xp: FEATURE_UNLOCKS.PREMIUM_SKIN, icon: Palette },
    { id: 'NO_ADS', name: 'No Ads', xp: FEATURE_UNLOCKS.NO_ADS, icon: Ban },
    { id: 'FOUNDERS_CLUB', name: 'Club', xp: FEATURE_UNLOCKS.FOUNDERS_CLUB, icon: Crown },
];

const XP_INFO = [
    { label: 'Sign Up', val: XP_ACTIONS.SIGNUP },
    { label: 'Check-in', val: XP_ACTIONS.DAILY_CHECKIN },
    { label: 'Scan QR', val: XP_ACTIONS.SCAN_QR },
    { label: 'Mission', val: XP_ACTIONS.DAILY_MISSION },
    { label: 'Referral', val: XP_ACTIONS.REFERRAL },
];

export default function GamificationScreen() {
    const router = useRouter();
    const theme = useAppTheme();
    const { gamification, canAccessFeature, fetchPendingRewards, claimReward } = useUserStore();
    const { xp, rank, isUtopiaMode, unlockedFeatures, pendingRewards } = gamification;
    const [showGuide, setShowGuide] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    React.useEffect(() => {
        fetchPendingRewards();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchPendingRewards();
        setRefreshing(false);
    }, []);

    const handleClaim = async (rewardId: string) => {
        setClaimingId(rewardId);
        try {
            await claimReward(rewardId);
        } catch (error) {
            console.error(error);
        } finally {
            setClaimingId(null);
        }
    };

    // Calculate progress to next feature
    const nextFeature = ALL_FEATURES.find(f => xp.current < f.xp);

    const colors = isUtopiaMode ? {
        primary: '#00FFF0',
        bg: '#0A0A0F',
        surface: '#1A1A2E',
        text: '#FFFFFF',
        muted: '#666666',
        success: '#00FF9D'
    } : {
        primary: theme.colors.primary,
        bg: theme.colors.background,
        surface: theme.colors.surface,
        text: theme.colors.text,
        muted: theme.colors.textSecondary,
        success: theme.colors.success
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Journey</Text>
                <TouchableOpacity onPress={() => setShowGuide(true)} hitSlop={10}>
                    <Info size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >

                {/* 1. Main Stats Card */}
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={[styles.rankTitle, { color: colors.primary }]}>{rank.name}</Text>
                            <Text style={[styles.xpText, { color: colors.muted }]}>
                                {xp.current.toLocaleString()} XP Total
                            </Text>
                        </View>
                        <View style={[styles.iconBox, { backgroundColor: colors.bg }]}>
                            <Trophy size={20} color={colors.primary} />
                        </View>
                    </View>

                    <View style={styles.barContainer}>
                        <XPBar height={10} showText={false} />
                    </View>

                    {nextFeature && (
                        <View style={styles.nextUnlockRow}>
                            <Text style={[styles.nextLabel, { color: colors.muted }]}>
                                Next Reward: <Text style={{ color: colors.text, fontWeight: '700' }}>{nextFeature.name}</Text>
                            </Text>
                            <Text style={[styles.nextVal, { color: colors.primary }]}>
                                {nextFeature.xp - xp.current} XP left
                            </Text>
                        </View>
                    )}
                </View>

                {/* 2. Pending Rewards (New Section) */}
                {pendingRewards && pendingRewards.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Rewards</Text>
                        {pendingRewards.map((reward) => (
                            <View key={reward._id} style={[styles.rewardCard, { backgroundColor: colors.surface }]}>
                                <View style={styles.rewardInfo}>
                                    <View style={[styles.rewardIcon, { backgroundColor: colors.bg }]}>
                                        <Star size={16} color={colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.rewardTitle, { color: colors.text }]}>{reward.title}</Text>
                                        <Text style={[styles.rewardSource, { color: colors.muted }]}>From {reward.source}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[styles.claimButton, { backgroundColor: colors.primary }]}
                                    onPress={() => handleClaim(reward._id)}
                                    disabled={claimingId === reward._id}
                                >
                                    <Text style={[styles.claimText, { color: colors.bg }]}>
                                        {claimingId === reward._id ? '...' : `+${reward.xp} XP`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* 3. Horizontal Rank Timeline (Single Line) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Rank Path</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rankScroll}>
                        {RANKS.map((r, i) => {
                            const isUnlocked = xp.current >= r.xp;
                            const isCurrent = r.name === rank.name;
                            const isLast = i === RANKS.length - 1;

                            return (
                                <View key={r.name} style={styles.rankStepContainer}>
                                    <View style={[
                                        styles.rankCircle,
                                        {
                                            backgroundColor: isCurrent ? colors.primary : (isUnlocked ? colors.surface : 'transparent'),
                                            borderColor: isUnlocked ? colors.primary : colors.muted,
                                            borderWidth: isUnlocked ? 0 : 1
                                        }
                                    ]}>
                                        {isUnlocked ? (
                                            <CheckCircle size={14} color={isCurrent ? colors.bg : colors.primary} />
                                        ) : (
                                            <Lock size={14} color={colors.muted} />
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.rankName,
                                        { color: isUnlocked ? colors.text : colors.muted, fontWeight: isCurrent ? '700' : '400' }
                                    ]}>
                                        {r.name}
                                    </Text>
                                    {!isLast && <View style={[styles.connector, { backgroundColor: colors.surface }]} />}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* 4. Feature Grid (Single Grid) */}
                <View style={styles.section}>
                    <View style={styles.flexRow}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Feature Unlocks</Text>
                        <Text style={[styles.countText, { color: colors.muted }]}>
                            {unlockedFeatures.length}/{ALL_FEATURES.length} Unlocked
                        </Text>
                    </View>

                    <View style={styles.grid}>
                        {ALL_FEATURES.map((feature) => {
                            const isUnlocked = canAccessFeature(feature.id as FeatureId);
                            const Icon = feature.icon;

                            return (
                                <View
                                    key={feature.id}
                                    style={[
                                        styles.gridItem,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: isUnlocked ? colors.primary : 'transparent',
                                            borderWidth: isUnlocked ? 1 : 0,
                                            opacity: isUnlocked ? 1 : 0.6
                                        }
                                    ]}
                                >
                                    <View style={styles.gridIconHeader}>
                                        <Icon size={20} color={isUnlocked ? colors.primary : colors.muted} />
                                        {isUnlocked ? (
                                            <CheckCircle size={12} color={colors.primary} />
                                        ) : (
                                            <Text style={[styles.xpReq, { color: colors.muted }]}>{feature.xp / 1000}k</Text>
                                        )}
                                    </View>
                                    <Text style={[styles.gridName, { color: colors.text }]} numberOfLines={1}>
                                        {feature.name}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

            </ScrollView>

            {/* XP Guide Modal */}
            <Modal visible={showGuide} transparent animationType="fade" onRequestClose={() => setShowGuide(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>How to earn XP</Text>
                            <TouchableOpacity onPress={() => setShowGuide(false)}>
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        {XP_INFO.map((item, i) => (
                            <View key={i} style={[styles.xpRow, { borderBottomColor: colors.bg }]}>
                                <Text style={[styles.xpLabel, { color: colors.text }]}>{item.label}</Text>
                                <View style={[styles.xpPill, { backgroundColor: colors.bg }]}>
                                    <Text style={[styles.xpVal, { color: colors.primary }]}>+{item.val}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    // Card
    card: { padding: 20, borderRadius: 24, marginBottom: 24 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    rankTitle: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
    xpText: { fontSize: 13, fontWeight: '500' },
    iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    barContainer: { marginBottom: 16 },
    nextUnlockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    nextLabel: { fontSize: 12 },
    nextVal: { fontSize: 12, fontWeight: '700' },

    // Section
    section: { marginBottom: 24 },
    flexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    countText: { fontSize: 12 },

    // Rewards
    rewardCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
    rewardInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rewardIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    rewardTitle: { fontSize: 14, fontWeight: '600' },
    rewardSource: { fontSize: 12 },
    claimButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    claimText: { fontSize: 12, fontWeight: '700' },

    // Rank Path
    rankScroll: { paddingRight: 20, alignItems: 'center' },
    rankStepContainer: { flexDirection: 'row', alignItems: 'center' },
    rankCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    rankName: { fontSize: 13, marginRight: 12 },
    connector: { width: 20, height: 2, marginRight: 12 },

    // Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    gridItem: { width: '31%', padding: 12, borderRadius: 16, height: 90, justifyContent: 'space-between' },
    gridIconHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    xpReq: { fontSize: 10, fontWeight: '700' },
    gridName: { fontSize: 12, fontWeight: '600' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', padding: 24, borderRadius: 24, maxWidth: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    xpLabel: { fontSize: 15, fontWeight: '500' },
    xpPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    xpVal: { fontSize: 14, fontWeight: '700' },
});