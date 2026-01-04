import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Users, Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useSocialStore, LeaderboardEntry } from '../store/socialStore';
import { theme } from '../constants/theme';
import { DEMO_LEADERBOARD } from '@/constants/demoData';

import { useAppTheme } from '../store/themeStore';

export default function LeaderboardScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { fetchLeaderboard, leaderboards } = useSocialStore();
  const [activeTab, setActiveTab] = useState<'city' | 'friends'>('city');
  const [period, setPeriod] = useState<'weekly' | 'all_time'>('all_time');

  useEffect(() => {
    fetchLeaderboard(activeTab, period);
  }, [activeTab, period]);

  const currentLeaderboard = leaderboards.find(l => l.type === activeTab && l.period === period);
  const apiEntries = currentLeaderboard?.entries || [];
  // Use demo data as fallback when no entries
  const entries = apiEntries.length > 0 ? apiEntries : DEMO_LEADERBOARD.map(d => ({
    rank: d.position,
    userId: d._id,
    userName: d.name,
    userAvatar: d.avatar,
    points: d.xp,
    missionsCompleted: Math.floor(d.xp / 500),
    totalSavings: Math.floor(d.xp / 10),
    trend: 'same' as const,
    streak: Math.floor(d.xp / 1000),
  }));

  const renderRankItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isTop3 = index < 3;
    const isMe = item.userId === 'me' || item.userId === 'current-user-id';

    return (
      <View style={[styles.rankItem, isMe && styles.rankItemMe]}>
        <View style={styles.rankNumberContainer}>
          {index === 0 && <Text style={styles.medal}>🥇</Text>}
          {index === 1 && <Text style={styles.medal}>🥈</Text>}
          {index === 2 && <Text style={styles.medal}>🥉</Text>}
          {index > 2 && <Text style={styles.rankNumber}>{index + 1}</Text>}
        </View>

        <View style={styles.avatarContainer}>
          <Text style={{ fontSize: 24 }}>{item.userAvatar || '👤'}</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.userName, isMe && styles.userNameMe]}>{item.userName} {isMe && '(You)'}</Text>
          <Text style={styles.userStats}>{item.missionsCompleted} missions • ₹{item.totalSavings} saved</Text>
        </View>

        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{item.points}</Text>
          <Text style={styles.pointsLabel}>XP</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/social?tab=add')} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'city' && styles.activeTab]}
          onPress={() => setActiveTab('city')}
        >
          <Globe size={18} color={activeTab === 'city' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'city' && styles.activeTabText]}>Global</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Users size={18} color={activeTab === 'friends' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>Friends</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.periodContainer}>
        <TouchableOpacity onPress={() => setPeriod('weekly')}>
          <Text style={[styles.periodText, period === 'weekly' && styles.activePeriodText]}>Weekly</Text>
        </TouchableOpacity>
        <View style={styles.periodDivider} />
        <TouchableOpacity onPress={() => setPeriod('all_time')}>
          <Text style={[styles.periodText, period === 'all_time' && styles.activePeriodText]}>All Time</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        renderItem={renderRankItem}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Trophy size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No rankings yet</Text>
            <Text style={styles.emptySubtext}>Be the first to climb the leaderboard!</Text>
          </View>
        }
      />
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
    padding: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.background,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  periodText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  activePeriodText: {
    color: theme.colors.text,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  periodDivider: {
    width: 1,
    height: 12,
    backgroundColor: theme.colors.border,
  },
  listContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: '100%',
    flexGrow: 1,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rankItemMe: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  rankNumberContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  medal: {
    fontSize: 20,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  userNameMe: {
    color: theme.colors.primary,
  },
  userStats: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  pointsLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
});
