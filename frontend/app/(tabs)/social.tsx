import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { DEMO_FRIENDS, DEMO_FEED, DEMO_LEADERBOARD, DEMO_SQUADS } from '@/constants/demoData';
import {
    Users,
    Trophy,
    MessageCircle,
    UserPlus,
    Star,
    Flame,
    Crown,
    Medal,
    TrendingUp,
    Heart,
    Share2,
    ChevronRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SocialHubScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const { user, gamification } = useUserStore();

    // Demo data - always show for exhibition
    const friends = DEMO_FRIENDS;
    const feed = DEMO_FEED;
    const leaderboard = DEMO_LEADERBOARD.slice(0, 5);
    const squads = DEMO_SQUADS;

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'deal_claimed': return <Ionicons name="pricetag" size={16} color="#10B981" />;
            case 'level_up': return <TrendingUp size={16} color="#F59E0B" />;
            case 'mission_completed': return <Trophy size={16} color="#8B5CF6" />;
            default: return <Star size={16} color="#6B7280" />;
        }
    };

    const getActivityText = (item: any) => {
        switch (item.type) {
            case 'deal_claimed': return `claimed a deal at ${item.data.merchantName}`;
            case 'level_up': return `leveled up to Level ${item.data.level}! 🎉`;
            case 'mission_completed': return `completed "${item.data.missionTitle}"`;
            default: return 'did something awesome';
        }
    };

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diff = Math.floor((now.getTime() - then.getTime()) / 1000 / 60);
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Social Hub</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/scanner')}>
                            <Ionicons name="qr-code-outline" size={22} color={theme.colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/archetype')}>
                            <Ionicons name="sparkles" size={22} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Your Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{friends.length}</Text>
                            <Text style={styles.statLabel}>Friends</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{gamification?.xp?.current || 1250}</Text>
                            <Text style={styles.statLabel}>XP</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>#7</Text>
                            <Text style={styles.statLabel}>Rank</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.viewProfileBtn} onPress={() => router.push('/profile')}>
                        <Text style={styles.viewProfileText}>View Full Profile</Text>
                        <ChevronRight size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/scanner')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#10B98120' }]}>
                            <UserPlus size={24} color="#10B981" />
                        </View>
                        <Text style={styles.actionLabel}>Add Friend</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/groups')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#8B5CF620' }]}>
                            <Users size={24} color="#8B5CF6" />
                        </View>
                        <Text style={styles.actionLabel}>My Squads</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/leaderboard')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
                            <Trophy size={24} color="#F59E0B" />
                        </View>
                        <Text style={styles.actionLabel}>Leaderboard</Text>
                    </TouchableOpacity>
                </View>

                {/* Leaderboard Preview */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🏆 Top Savers This Week</Text>
                        <TouchableOpacity onPress={() => router.push('/leaderboard')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.leaderboardCard}>
                        {leaderboard.map((entry, index) => (
                            <View key={entry._id} style={styles.leaderboardItem}>
                                <View style={styles.leaderboardRank}>
                                    {index === 0 && <Text style={styles.medal}>🥇</Text>}
                                    {index === 1 && <Text style={styles.medal}>🥈</Text>}
                                    {index === 2 && <Text style={styles.medal}>🥉</Text>}
                                    {index > 2 && <Text style={styles.rankNum}>{index + 1}</Text>}
                                </View>
                                <View style={styles.leaderboardAvatar}>
                                    <Text style={styles.avatarEmoji}>{entry.avatar}</Text>
                                </View>
                                <View style={styles.leaderboardInfo}>
                                    <Text style={styles.leaderboardName}>{entry.name}</Text>
                                    <Text style={styles.leaderboardXp}>{entry.rank}</Text>
                                </View>
                                <View style={styles.leaderboardXpBadge}>
                                    <Flame size={12} color="#F59E0B" />
                                    <Text style={styles.xpText}>{(entry.xp / 1000).toFixed(0)}K</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Friends List */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>👥 Your Friends</Text>
                        <TouchableOpacity onPress={() => router.push('/scanner')}>
                            <Text style={styles.seeAll}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsScroll}>
                        {friends.map((friend) => (
                            <View key={friend._id} style={styles.friendCard}>
                                <View style={styles.friendAvatar}>
                                    <Text style={styles.friendInitial}>{friend.profile.name[0]}</Text>
                                </View>
                                <Text style={styles.friendName} numberOfLines={1}>
                                    {friend.profile.name.split(' ')[0]}
                                </Text>
                                <Text style={styles.friendXp}>{friend.rank}</Text>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addFriendCard} onPress={() => router.push('/scanner')}>
                            <UserPlus size={24} color={theme.colors.primary} />
                            <Text style={styles.addFriendText}>Add</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Squads */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🎯 Your Squads</Text>
                        <TouchableOpacity onPress={() => router.push('/groups')}>
                            <Text style={styles.seeAll}>Manage</Text>
                        </TouchableOpacity>
                    </View>
                    {squads.map((squad) => (
                        <TouchableOpacity key={squad._id} style={styles.squadCard} onPress={() => router.push('/groups')}>
                            <View style={styles.squadIcon}>
                                <Users size={20} color="#8B5CF6" />
                            </View>
                            <View style={styles.squadInfo}>
                                <Text style={styles.squadName}>{squad.name}</Text>
                                <Text style={styles.squadMembers}>{squad.members} members</Text>
                            </View>
                            <View style={styles.squadStats}>
                                <Text style={styles.squadSavings}>₹{squad.totalSavings}</Text>
                                <Text style={styles.squadLabel}>saved</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Activity Feed */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🔥 Activity Feed</Text>
                    </View>
                    {feed.map((item) => (
                        <View key={item._id} style={styles.feedItem}>
                            <View style={styles.feedAvatar}>
                                <Text style={styles.feedInitial}>{item.user.profile.name[0]}</Text>
                            </View>
                            <View style={styles.feedContent}>
                                <Text style={styles.feedText}>
                                    <Text style={styles.feedName}>{item.user.profile.name}</Text>
                                    {' '}{getActivityText(item)}
                                </Text>
                                <View style={styles.feedMeta}>
                                    {getActivityIcon(item.type)}
                                    <Text style={styles.feedTime}>{getTimeAgo(item.createdAt)}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.feedAction}>
                                <Heart size={18} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsCard: {
        marginHorizontal: 20,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: theme.colors.border,
    },
    viewProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    viewProfileText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    actionCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    seeAll: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    leaderboardCard: {
        marginHorizontal: 20,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    leaderboardRank: {
        width: 32,
        alignItems: 'center',
    },
    medal: {
        fontSize: 20,
    },
    rankNum: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    leaderboardAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarEmoji: {
        fontSize: 18,
    },
    leaderboardInfo: {
        flex: 1,
    },
    leaderboardName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    leaderboardXp: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    leaderboardXpBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F59E0B20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    xpText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F59E0B',
    },
    friendsScroll: {
        paddingLeft: 20,
    },
    friendCard: {
        width: 80,
        alignItems: 'center',
        marginRight: 12,
    },
    friendAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    friendInitial: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    friendName: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'center',
    },
    friendXp: {
        fontSize: 10,
        color: theme.colors.textSecondary,
    },
    addFriendCard: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    addFriendText: {
        fontSize: 12,
        color: theme.colors.primary,
        marginTop: 8,
        fontWeight: '600',
    },
    squadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    squadIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#8B5CF620',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    squadInfo: {
        flex: 1,
    },
    squadName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    squadMembers: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    squadStats: {
        alignItems: 'flex-end',
    },
    squadSavings: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10B981',
    },
    squadLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
    },
    feedItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: 20,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    feedAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    feedInitial: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    feedContent: {
        flex: 1,
    },
    feedText: {
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
        marginBottom: 4,
    },
    feedName: {
        fontWeight: '700',
    },
    feedMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    feedTime: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    feedAction: {
        padding: 4,
    },
});
