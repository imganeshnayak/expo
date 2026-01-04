import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, Trophy, Lock, CheckCircle, Zap, Star, Info, X,
    Target, Map, BrainCircuit, User, CreditCard, Award, Crown, Palette, Ban, Flame, ChevronRight,
    Gift, Users, Moon, Sparkles, Gamepad2, Ticket, Eye, ShieldCheck, Ghost, Search,
    Headset, Box, Copy
} from 'lucide-react-native';
import { theme as staticTheme } from '@/constants/theme';
import { useAppTheme } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { RANKS, XP_ACTIONS, FEATURE_UNLOCKS, type FeatureId } from '@/constants/gamification';
import { XPBar } from '@/components/gamification/XPBar';

// Feature Definition with Metadata - Exciting rewards at each tier!
const FEATURE_META = [
    // Bronze (Starter Perks)
    { id: 'DAILY_SCRATCH_CARD', name: 'Daily Scratch Card', xp: FEATURE_UNLOCKS.DAILY_SCRATCH_CARD, icon: Sparkles, desc: 'Win XP & coin prizes daily!', rank: 'Bronze' },
    { id: 'MISSIONS', name: 'Missions', xp: FEATURE_UNLOCKS.MISSIONS, icon: Target, desc: 'Available now! Complete for XP.', rank: 'Bronze' },
    { id: 'VOUCHERS', name: 'Deal Vouchers', xp: FEATURE_UNLOCKS.VOUCHERS, icon: Ticket, desc: 'Claim exclusive discounts.', rank: 'Bronze' },

    // Silver (Growing Benefits)
    { id: 'LOYALTY_CARDS', name: 'Loyalty Cards', xp: FEATURE_UNLOCKS.LOYALTY_CARDS, icon: CreditCard, desc: 'Link & track store rewards.', rank: 'Silver' },
    { id: 'DEAL_ALERTS', name: 'Deal Alerts', xp: FEATURE_UNLOCKS.DEAL_ALERTS, icon: Map, desc: 'Notifications for nearby deals.', rank: 'Silver' },
    { id: 'EXCLUSIVE_DEALS', name: 'Exclusive Deals', xp: FEATURE_UNLOCKS.EXCLUSIVE_DEALS, icon: Star, desc: 'Silver-only special offers.', rank: 'Silver' },

    // Gold (Premium Rewards)
    { id: 'FLASH_DROPS', name: 'Flash Drops', xp: FEATURE_UNLOCKS.FLASH_DROPS, icon: Zap, desc: '15-min mega deal alerts.', rank: 'Gold' },
    { id: 'PRIORITY_SUPPORT', name: 'Priority Support', xp: FEATURE_UNLOCKS.PRIORITY_SUPPORT, icon: Headset, desc: 'Skip the queue - VIP help.', rank: 'Gold' },
    { id: 'XP_BOOST_1_5X', name: '1.5x XP Boost', xp: FEATURE_UNLOCKS.XP_BOOST_1_5X, icon: Flame, desc: 'Level up 50% faster!', rank: 'Gold' },

    // Platinum (Elite Status)
    { id: 'DOUBLE_DAILY', name: 'Double Daily', xp: FEATURE_UNLOCKS.DOUBLE_DAILY, icon: Copy, desc: '2x Scratch Cards per day.', rank: 'Platinum' },
    { id: 'GIFT_MODE', name: 'Gift Mode', xp: FEATURE_UNLOCKS.GIFT_MODE, icon: Gift, desc: 'Send rewards to friends.', rank: 'Platinum' },
    { id: 'MONTHLY_LOOT', name: 'Monthly Loot', xp: FEATURE_UNLOCKS.MONTHLY_LOOT, icon: Box, desc: 'Free Mystery Box/Month.', rank: 'Platinum' },

    // Diamond (VIP Treatment)
    { id: 'VIP_LOUNGE', name: 'VIP Lounge', xp: FEATURE_UNLOCKS.VIP_LOUNGE, icon: Crown, desc: 'Exclusive merchant events.', rank: 'Diamond' },
    { id: 'PROFILE_AURA', name: 'Profile Aura', xp: FEATURE_UNLOCKS.PROFILE_AURA, icon: Sparkles, desc: 'Glowing profile effects.', rank: 'Diamond' },
    { id: 'VERIFIED_BADGE', name: 'Verified Badge', xp: FEATURE_UNLOCKS.VERIFIED_BADGE, icon: ShieldCheck, desc: 'The prestigious checkmark.', rank: 'Diamond' },

    // Legendary (The Ultimate)
    { id: 'LEGENDARY_UI', name: 'Legendary Status', xp: FEATURE_UNLOCKS.LEGENDARY_UI, icon: Crown, desc: 'Custom theme & ultimate perks.', rank: 'Legendary' },
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

    // Group Features by Rank
    const featuresByRank = {
        Bronze: FEATURE_META.filter(f => f.rank === 'Bronze'),
        Silver: FEATURE_META.filter(f => f.rank === 'Silver'),
        Gold: FEATURE_META.filter(f => f.rank === 'Gold'),
        Platinum: FEATURE_META.filter(f => f.rank === 'Platinum'),
        Diamond: FEATURE_META.filter(f => f.rank === 'Diamond'),
        Legendary: FEATURE_META.filter(f => f.rank === 'Legendary'),
    };

    const getRankColor = (r: string) => {
        switch (r) {
            case 'Bronze': return '#CD7F32';
            case 'Silver': return '#C0C0C0';
            case 'Gold': return '#FFD700';
            case 'Platinum': return '#E5E4E2';
            case 'Diamond': return '#B9F2FF';
            case 'Legendary': return '#FF4500'; // Red/Orange
            default: return theme.colors.text;
        }
    };

    const nextFeature = FEATURE_META.find(f => xp.current < f.xp);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Journey</Text>
                <TouchableOpacity onPress={() => setShowGuide(true)} hitSlop={10}>
                    <Info size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
            >

                {/* 1. Main Stats Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={[styles.rankTitle, { color: getRankColor(rank.league) }]}>{rank.name}</Text>
                            <Text style={[styles.xpText, { color: theme.colors.textSecondary }]}>
                                {xp.current.toLocaleString()} XP Total
                            </Text>
                        </View>
                        <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
                            <Trophy size={20} color={getRankColor(rank.league)} />
                        </View>
                    </View>

                    <View style={styles.barContainer}>
                        <XPBar height={10} showText={false} />
                    </View>

                    {nextFeature && (
                        <View style={styles.nextUnlockRow}>
                            <Text style={[styles.nextLabel, { color: theme.colors.textSecondary }]}>
                                Next: <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{nextFeature.name}</Text>
                            </Text>
                            <Text style={[styles.nextVal, { color: theme.colors.primary }]}>
                                {nextFeature.xp - xp.current} XP left
                            </Text>
                        </View>
                    )}
                </View>

                {/* 2. Pending Rewards */}
                {pendingRewards && pendingRewards.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pending Rewards</Text>
                        {pendingRewards.map((reward) => (
                            <View key={reward._id} style={[styles.rewardCard, { backgroundColor: theme.colors.surface }]}>
                                <View style={styles.rewardInfo}>
                                    <View style={[styles.rewardIcon, { backgroundColor: theme.colors.background }]}>
                                        <Star size={16} color={theme.colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.rewardTitle, { color: theme.colors.text }]}>{reward.title}</Text>
                                        <Text style={[styles.rewardSource, { color: theme.colors.textSecondary }]}>From {reward.source}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[styles.claimButton, { backgroundColor: theme.colors.primary }]}
                                    onPress={() => handleClaim(reward._id)}
                                    disabled={claimingId === reward._id}
                                >
                                    <Text style={[styles.claimText, { color: theme.colors.background }]}>
                                        {claimingId === reward._id ? '...' : `+${reward.xp} XP`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* 3. Timeline */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 20 }]}>Progression</Text>

                    {Object.entries(featuresByRank).map(([rankName, features], index) => {
                        const rankColor = getRankColor(rankName);
                        // Check if ANY feature in this rank is unlocked to determine if rank started
                        const isRankStarted = features.some(f => xp.current >= f.xp);
                        // Check if ALL features in this rank are unlocked
                        const isRankCompleted = features.every(f => xp.current >= f.xp);

                        return (
                            <View key={rankName} style={styles.timelineGroup}>
                                {/* Rank Header */}
                                <View style={styles.rankHeader}>
                                    <View style={[styles.rankDot, { backgroundColor: isRankStarted ? rankColor : theme.colors.surfaceHighlight }]} />
                                    <Text style={[styles.rankGroupTitle, { color: isRankStarted ? rankColor : theme.colors.textSecondary }]}>
                                        {rankName} Phase
                                    </Text>
                                    {isRankCompleted && <CheckCircle size={16} color={rankColor} style={{ marginLeft: 8 }} />}
                                </View>

                                {/* Features */}
                                <View style={[styles.rankContent, { borderLeftColor: isRankStarted ? rankColor : theme.colors.surfaceHighlight }]}>
                                    {features.map((feature) => {
                                        const isUnlocked = xp.current >= feature.xp;
                                        const Icon = feature.icon;

                                        const handlePress = () => {
                                            // Features are informational - no navigation needed
                                        };

                                        return (
                                            <TouchableOpacity
                                                key={feature.id}
                                                style={[styles.timelineItem, { opacity: isUnlocked ? 1 : 0.6 }]}
                                                activeOpacity={0.7}
                                            >
                                                <View style={[styles.timelineIconBox, { backgroundColor: isUnlocked ? theme.colors.primary + '20' : theme.colors.surface }]}>
                                                    <Icon size={20} color={isUnlocked ? theme.colors.primary : theme.colors.textSecondary} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text style={[styles.timelineTitle, { color: theme.colors.text }]}>{feature.name}</Text>
                                                        {isUnlocked ? (
                                                            <CheckCircle size={14} color={theme.colors.success} />
                                                        ) : (
                                                            <Text style={styles.xpReq}>{feature.xp}</Text>
                                                        )}
                                                    </View>
                                                    <Text style={[styles.timelineDesc, { color: theme.colors.textSecondary }]}>
                                                        {feature.desc}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })}
                </View>

            </ScrollView>

            {/* XP Guide Modal */}
            <Modal visible={showGuide} transparent animationType="fade" onRequestClose={() => setShowGuide(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>How to earn XP</Text>
                            <TouchableOpacity onPress={() => setShowGuide(false)}>
                                <X size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        {XP_INFO.map((item, i) => (
                            <View key={i} style={[styles.xpRow, { borderBottomColor: theme.colors.background }]}>
                                <Text style={[styles.xpLabel, { color: theme.colors.text }]}>{item.label}</Text>
                                <View style={[styles.xpPill, { backgroundColor: theme.colors.background }]}>
                                    <Text style={[styles.xpVal, { color: theme.colors.primary }]}>+{item.val}</Text>
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
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

    // Rewards
    rewardCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
    rewardInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rewardIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    rewardTitle: { fontSize: 14, fontWeight: '600' },
    rewardSource: { fontSize: 12 },
    claimButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    claimText: { fontSize: 12, fontWeight: '700' },

    // Timeline
    timelineGroup: { marginBottom: 4 },
    rankHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    rankDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    rankGroupTitle: { fontSize: 14, fontWeight: '700' },
    rankContent: { borderLeftWidth: 2, marginLeft: 5, paddingLeft: 24, paddingBottom: 24 },
    timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    timelineIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    timelineTitle: { fontSize: 14, fontWeight: '600' },
    timelineDesc: { fontSize: 12, marginTop: 2 },
    xpReq: { fontSize: 10, fontWeight: '600', color: '#666' },

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