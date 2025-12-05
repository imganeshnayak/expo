import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Target,

  Award,
  Crown,
  Medal,
} from 'lucide-react-native';
import {
  useSocialStore,
  type Leaderboard as LeaderboardType,
  type LeaderboardEntry,
} from '../store/socialStore';
import { theme } from '../constants/theme';

export default function LeaderboardScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<LeaderboardType['type']>('friends');
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardType['period']>('weekly');
  const [refreshing, setRefreshing] = useState(false);

  const { leaderboards, fetchLeaderboard } = useSocialStore();

  useEffect(() => {
    fetchLeaderboard(selectedType, selectedPeriod);
  }, [selectedType, selectedPeriod]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard(selectedType, selectedPeriod);
    setRefreshing(false);
  };

  const currentLeaderboard = leaderboards.find(
    lb => lb.type === selectedType && lb.period === selectedPeriod
  );

  const types: { value: LeaderboardType['type']; label: string; icon: any }[] = [
    { value: 'friends', label: 'Friends', icon: Award },
    { value: 'city', label: 'City', icon: Crown },
    { value: 'college', label: 'College', icon: Medal },
    { value: 'company', label: 'Company', icon: Trophy },
  ];

  const periods: { value: LeaderboardType['period']; label: string }[] = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'all_time', label: 'All Time' },
  ];

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return { emoji: '👑', color: '#f59e0b', label: 'Champion' };
      case 2:
        return { emoji: '🥈', color: '#9ca3af', label: '2nd Place' };
      case 3:
        return { emoji: '🥉', color: '#f97316', label: '3rd Place' };
      default:
        return null;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} color="#10b981" />;
      case 'down':
        return <TrendingDown size={14} color="#ef4444" />;
      case 'same':
        return <Minus size={14} color="#6b7280" />;
      default:
        return null;
    }
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const rankBadge = getRankBadge(entry.rank);
    const isMe = entry.userId === 'me';

    return (
      <View
        key={entry.userId}
        style={{
          backgroundColor: isMe ? 'rgba(0, 217, 163, 0.1)' : '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: isMe ? 2 : 0,
          borderColor: isMe ? theme.colors.primary : 'transparent',
        }}
      >
        {/* Rank */}
        <View style={{ width: 48, alignItems: 'center', marginRight: 12 }}>
          {rankBadge ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28 }}>{rankBadge.emoji}</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: rankBadge.color, marginTop: 2 }}>
                #{entry.rank}
              </Text>
            </View>
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6b7280' }}>
                {entry.rank}
              </Text>
            </View>
          )}
        </View>

        {/* Avatar */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: isMe ? theme.colors.primary + '20' : 'rgba(0, 217, 163, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 24 }}>{entry.userAvatar || '👤'}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: isMe ? theme.colors.primary : '#111827',
              }}
            >
              {entry.userName}
            </Text>
            {isMe && (
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginLeft: 8,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#ffffff' }}>
                  YOU
                </Text>
              </View>
            )}
            {entry.trend && (
              <View style={{ marginLeft: 8 }}>{getTrendIcon(entry.trend)}</View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Trophy size={12} color={theme.colors.primary} />
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {entry.points} pts
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Target size={12} color="#3b82f6" />
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {entry.missionsCompleted} missions
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Zap size={12} color="#f59e0b" />
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {entry.streak}d
              </Text>
            </View>
          </View>
        </View>

        {/* Savings */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10b981' }}>
            ₹{entry.totalSavings}
          </Text>
          <Text style={{ fontSize: 11, color: '#9ca3af' }}>
            saved
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft color="#111827" size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
            Leaderboard
          </Text>
        </View>

        {/* Type Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {types.map(type => {
              const Icon = type.icon;
              const isActive = selectedType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor: isActive ? theme.colors.primary : '#f3f4f6',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Icon size={16} color={isActive ? '#ffffff' : '#6b7280'} />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: isActive ? '#ffffff' : '#6b7280',
                    }}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Period Selector */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {periods.map(period => {
            const isActive = selectedPeriod === period.value;
            return (
              <TouchableOpacity
                key={period.value}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: isActive ? theme.colors.primary : '#f3f4f6',
                  alignItems: 'center',
                }}
                onPress={() => setSelectedPeriod(period.value)}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isActive ? '#ffffff' : '#6b7280',
                  }}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Leaderboard */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top 3 Podium */}
        {currentLeaderboard && currentLeaderboard.entries.length >= 3 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              {/* 2nd Place */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: 'rgba(156, 163, 175, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    borderWidth: 3,
                    borderColor: '#9ca3af',
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{currentLeaderboard.entries[1].userAvatar || '👤'}</Text>
                </View>
                <Text style={{ fontSize: 28, marginBottom: 4 }}>🥈</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'center' }} numberOfLines={1}>
                  {currentLeaderboard.entries[1].userName}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginTop: 4 }}>
                  {currentLeaderboard.entries[1].points} pts
                </Text>
                <View
                  style={{
                    marginTop: 8,
                    backgroundColor: '#f3f4f6',
                    borderRadius: 12,
                    paddingVertical: 24,
                    paddingHorizontal: 12,
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#9ca3af' }}>
                    #2
                  </Text>
                </View>
              </View>

              {/* 1st Place (Taller) */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    borderWidth: 4,
                    borderColor: '#f59e0b',
                  }}
                >
                  <Text style={{ fontSize: 40 }}>{currentLeaderboard.entries[0].userAvatar || '👤'}</Text>
                </View>
                <Text style={{ fontSize: 32, marginBottom: 4 }}>👑</Text>
                <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#111827', textAlign: 'center' }} numberOfLines={1}>
                  {currentLeaderboard.entries[0].userName}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#f59e0b', marginTop: 4 }}>
                  {currentLeaderboard.entries[0].points} pts
                </Text>
                <View
                  style={{
                    marginTop: 8,
                    backgroundColor: '#fef3c7',
                    borderRadius: 12,
                    paddingVertical: 32,
                    paddingHorizontal: 12,
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#f59e0b' }}>
                    CHAMPION
                  </Text>
                </View>
              </View>

              {/* 3rd Place */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    borderWidth: 3,
                    borderColor: '#f97316',
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{currentLeaderboard.entries[2].userAvatar || '👤'}</Text>
                </View>
                <Text style={{ fontSize: 28, marginBottom: 4 }}>🥉</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'center' }} numberOfLines={1}>
                  {currentLeaderboard.entries[2].userName}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginTop: 4 }}>
                  {currentLeaderboard.entries[2].points} pts
                </Text>
                <View
                  style={{
                    marginTop: 8,
                    backgroundColor: '#f3f4f6',
                    borderRadius: 12,
                    paddingVertical: 24,
                    paddingHorizontal: 12,
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#9ca3af' }}>
                    #3
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Rest of Rankings */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
            All Rankings
          </Text>
          {currentLeaderboard && currentLeaderboard.entries.length > 0 ? (
            currentLeaderboard.entries.map((entry, index) => renderLeaderboardEntry(entry, index))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Trophy size={64} color="#d1d5db" />
              <Text style={{ fontSize: 16, color: '#9ca3af', marginTop: 16, textAlign: 'center' }}>
                No leaderboard data yet
              </Text>
              <Text style={{ fontSize: 14, color: '#d1d5db', marginTop: 8, textAlign: 'center' }}>
                Complete missions to climb the ranks!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
