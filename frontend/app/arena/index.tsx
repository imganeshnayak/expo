import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
    Swords,
    Users,
    Trophy,
    Flame,
    Skull,
    Heart,
    ChevronRight,
    Crown,
    Shield,
    Target,
    ArrowLeft,
    Zap,
    Star,
} from 'lucide-react-native';
import { useAppTheme } from '@/store/themeStore';
import { useArenaStore, NearbyPlayer } from '@/store/arenaStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock nearby players
const MOCK_PLAYERS: NearbyPlayer[] = [
    {
        id: '1',
        username: 'DragonSlayer99',
        avatar: '🐉',
        level: 24,
        rank: 5,
        winRate: 78,
        currentStreak: 5,
        isOnline: true,
        distance: 25,
        lastSeen: new Date(),
        isFriend: false,
        isRival: true,
        headToHead: { wins: 2, losses: 4 },
    },
    {
        id: '2',
        username: 'NightHunter',
        avatar: '🌙',
        level: 18,
        rank: 15,
        winRate: 65,
        currentStreak: 2,
        isOnline: true,
        distance: 45,
        lastSeen: new Date(),
        isFriend: true,
        isRival: false,
        headToHead: { wins: 3, losses: 1 },
    },
    {
        id: '3',
        username: 'PhoenixRising',
        avatar: '🔥',
        level: 31,
        rank: 3,
        winRate: 82,
        currentStreak: 8,
        isOnline: true,
        distance: 80,
        lastSeen: new Date(),
        isFriend: false,
        isRival: false,
        headToHead: { wins: 0, losses: 0 },
    },
    {
        id: '4',
        username: 'ShadowMaster',
        avatar: '🦇',
        level: 22,
        rank: 8,
        winRate: 71,
        currentStreak: 0,
        isOnline: true,
        distance: 120,
        lastSeen: new Date(),
        isFriend: false,
        isRival: false,
        headToHead: { wins: 1, losses: 1 },
    },
    {
        id: '5',
        username: 'StormBringer',
        avatar: '⚡',
        level: 27,
        rank: 6,
        winRate: 75,
        currentStreak: 3,
        isOnline: false,
        distance: 200,
        lastSeen: new Date(Date.now() - 300000),
        isFriend: false,
        isRival: false,
        headToHead: { wins: 0, losses: 0 },
    },
];

export default function ArenaScreen() {
    const router = useRouter();
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const { winStreak, stats, updateNearbyPlayers, nearbyPlayers, sendChallenge } = useArenaStore();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<NearbyPlayer | null>(null);

    useEffect(() => {
        updateNearbyPlayers(MOCK_PLAYERS);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await new Promise(r => setTimeout(r, 1500));
        updateNearbyPlayers(MOCK_PLAYERS);
        setIsRefreshing(false);
    };

    const handleQuickBattle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const onlinePlayers = displayPlayers.filter(p => p.isOnline);
        if (onlinePlayers.length > 0) {
            const randomPlayer = onlinePlayers[Math.floor(Math.random() * onlinePlayers.length)];
            setSelectedPlayer(randomPlayer);
        }
    };

    const handlePlayerPress = (player: NearbyPlayer) => {
        Haptics.selectionAsync();
        setSelectedPlayer(player);
    };

    const handleChallenge = () => {
        if (!selectedPlayer) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        sendChallenge(
            selectedPlayer.id,
            selectedPlayer.username,
            selectedPlayer.avatar,
            '1v1',
            { type: 'pride', amount: 0 }
        );

        setSelectedPlayer(null);
        router.push({
            pathname: '/arena/waiting' as any,
            params: { opponentId: selectedPlayer.id },
        });
    };

    const getPlayerBadge = (player: NearbyPlayer) => {
        if (player.isRival) return { icon: Skull, color: '#FF4757', label: 'RIVAL' };
        if (player.isFriend) return { icon: Heart, color: '#FF6B91', label: 'FRIEND' };
        if (player.rank <= 10) return { icon: Crown, color: '#FFD700', label: 'TOP 10' };
        if (player.currentStreak >= 5) return { icon: Flame, color: '#FF6B35', label: 'HOT' };
        return null;
    };

    const displayPlayers = nearbyPlayers.length > 0 ? nearbyPlayers : MOCK_PLAYERS;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={['#0D0D0D', '#1A1A2E', '#16213E', '#0D0D0D']}
                locations={[0, 0.3, 0.7, 1]}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#FF4757"
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={22} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>⚔️ ARENA</Text>
                        <Text style={styles.headerSubtitle}>
                            {displayPlayers.filter(p => p.isOnline).length} warriors nearby
                        </Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Your Battle Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <LinearGradient
                            colors={['#FF6B35', '#FF4444']}
                            style={styles.statIconBg}
                        >
                            <Flame size={18} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.statValue}>{winStreak.current}</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </View>
                    <View style={styles.statBox}>
                        <LinearGradient
                            colors={['#FFD700', '#FFA500']}
                            style={styles.statIconBg}
                        >
                            <Trophy size={18} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.statValue}>{stats.winRate.toFixed(0)}%</Text>
                        <Text style={styles.statLabel}>Win Rate</Text>
                    </View>
                    <View style={styles.statBox}>
                        <LinearGradient
                            colors={['#9B59B6', '#8E44AD']}
                            style={styles.statIconBg}
                        >
                            <Star size={18} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.statValue}>{winStreak.multiplier}x</Text>
                        <Text style={styles.statLabel}>XP Mult</Text>
                    </View>
                    <View style={styles.statBox}>
                        <LinearGradient
                            colors={['#00D9A3', '#00B389']}
                            style={styles.statIconBg}
                        >
                            <Swords size={18} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.statValue}>{stats.totalBattles}</Text>
                        <Text style={styles.statLabel}>Battles</Text>
                    </View>
                </View>

                {/* Quick Battle Button */}
                <TouchableOpacity
                    style={styles.quickBattleBtn}
                    onPress={handleQuickBattle}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#FF4757', '#C0392B', '#8B0000']}
                        style={styles.quickBattleGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Swords size={32} color="#FFF" />
                        <View style={styles.quickBattleText}>
                            <Text style={styles.quickBattleTitle}>⚡ QUICK BATTLE</Text>
                            <Text style={styles.quickBattleSubtitle}>Random opponent nearby</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Nearby Players Section */}
                <Text style={styles.sectionTitle}>NEARBY WARRIORS</Text>

                {displayPlayers.map((player) => {
                    const badge = getPlayerBadge(player);

                    return (
                        <TouchableOpacity
                            key={player.id}
                            style={[
                                styles.playerCard,
                                player.isRival && styles.playerCardRival,
                                !player.isOnline && styles.playerCardOffline,
                            ]}
                            onPress={() => handlePlayerPress(player)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={player.isRival
                                    ? ['#FF475720', '#2D2D44']
                                    : ['#2D2D44', '#1A1A2E']
                                }
                                style={styles.playerCardGradient}
                            >
                                <View style={styles.playerLeft}>
                                    <View style={styles.avatarContainer}>
                                        <Text style={styles.avatarEmoji}>{player.avatar}</Text>
                                        {player.isOnline && <View style={styles.onlineIndicator} />}
                                    </View>

                                    <View style={styles.playerInfo}>
                                        <View style={styles.playerNameRow}>
                                            <Text style={styles.playerName}>{player.username}</Text>
                                            {badge && (
                                                <View style={[styles.badge, { backgroundColor: badge.color + '25' }]}>
                                                    <badge.icon size={10} color={badge.color} />
                                                    <Text style={[styles.badgeText, { color: badge.color }]}>
                                                        {badge.label}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.playerStats}>
                                            <Text style={styles.playerStat}>Lvl {player.level}</Text>
                                            <Text style={styles.playerStatDot}>•</Text>
                                            <Text style={styles.playerStat}>{player.winRate}% WR</Text>
                                            {player.currentStreak > 0 && (
                                                <>
                                                    <Text style={styles.playerStatDot}>•</Text>
                                                    <Text style={styles.streakStat}>{player.currentStreak}🔥</Text>
                                                </>
                                            )}
                                        </View>
                                        {(player.headToHead.wins > 0 || player.headToHead.losses > 0) && (
                                            <Text style={styles.h2hText}>
                                                H2H: {player.headToHead.wins}W - {player.headToHead.losses}L
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.playerRight}>
                                    <Text style={styles.distanceText}>{player.distance}m</Text>
                                    <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}

                {/* Spacer for tab bar */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Challenge Modal */}
            <Modal
                visible={selectedPlayer !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedPlayer(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['#2D2D44', '#1A1A2E']}
                            style={styles.modalGradient}
                        >
                            {/* Player Preview */}
                            <View style={styles.modalHeader}>
                                <View style={styles.modalAvatar}>
                                    <Text style={styles.modalAvatarEmoji}>{selectedPlayer?.avatar}</Text>
                                </View>
                                <Text style={styles.modalPlayerName}>{selectedPlayer?.username}</Text>
                                <Text style={styles.modalPlayerStats}>
                                    Level {selectedPlayer?.level} • {selectedPlayer?.winRate}% Win Rate
                                </Text>
                            </View>

                            {/* Battle Stakes */}
                            <View style={styles.modalStakes}>
                                <Text style={styles.modalStakesTitle}>Battle for Pride</Text>
                                <View style={styles.modalStakesRow}>
                                    <View style={styles.modalStakeBox}>
                                        <Zap size={16} color="#00D9A3" />
                                        <Text style={styles.modalStakeValue}>+{100 * winStreak.multiplier} XP</Text>
                                    </View>
                                    <Text style={styles.modalVsText}>VS</Text>
                                    <View style={styles.modalStakeBox}>
                                        <Skull size={16} color="#FF4757" />
                                        <Text style={styles.modalStakeLoss}>-50 XP</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Buttons */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setSelectedPlayer(null)}
                                >
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.challengeBtn}
                                    onPress={handleChallenge}
                                >
                                    <LinearGradient
                                        colors={['#FF4757', '#C0392B']}
                                        style={styles.challengeBtnGradient}
                                    >
                                        <Swords size={18} color="#FFF" />
                                        <Text style={styles.challengeBtnText}>CHALLENGE!</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    scrollContent: {
        paddingHorizontal: 16,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    // Stats
    statsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statIconBg: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    statLabel: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    // Quick Battle
    quickBattleBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 6,
        shadowColor: '#FF4757',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    quickBattleGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 22,
    },
    quickBattleText: {
        alignItems: 'flex-start',
    },
    quickBattleTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 1,
    },
    quickBattleSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    // Section Title
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 2,
        marginBottom: 12,
    },
    // Player Cards
    playerCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 10,
    },
    playerCardRival: {
        borderWidth: 1,
        borderColor: '#FF4757',
    },
    playerCardOffline: {
        opacity: 0.5,
    },
    playerCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
    },
    playerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEmoji: {
        fontSize: 26,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#00D9A3',
        borderWidth: 2,
        borderColor: '#1A1A2E',
    },
    playerInfo: {
        flex: 1,
    },
    playerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    playerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    playerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    playerStat: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
    },
    playerStatDot: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
    },
    streakStat: {
        fontSize: 11,
        color: '#FF6B35',
    },
    h2hText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.35)',
        marginTop: 3,
    },
    playerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    distanceText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        overflow: 'hidden',
    },
    modalGradient: {
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 24,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalAvatar: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    modalAvatarEmoji: {
        fontSize: 40,
    },
    modalPlayerName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
    },
    modalPlayerStats: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    modalStakes: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
    },
    modalStakesTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 12,
    },
    modalStakesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    modalStakeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    modalStakeValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#00D9A3',
    },
    modalStakeLoss: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF4757',
    },
    modalVsText: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.3)',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 15,
    },
    challengeBtn: {
        flex: 1.5,
        borderRadius: 14,
        overflow: 'hidden',
    },
    challengeBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    challengeBtnText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 15,
    },
});
