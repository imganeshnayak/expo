import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Users,
  UserPlus,
  Search,
  Heart,
  MessageCircle,
  TrendingUp,
  Award,
  Gift,
  Trophy,
  Zap,
  Clock,
  ChevronRight,
  ThumbsUp,
  Share2,
  Check,
  X,
} from 'lucide-react-native';
import {
  useSocialStore,
  formatTimeAgo,
  getActivityIcon,
  type Friend,
  type SocialActivity,
  type FriendRequest,
} from '../store/socialStore';
import { theme } from '../constants/theme';

export default function SocialScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'requests'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    friends,
    friendRequests,
    socialFeed,
    suggestedFriends,
    fetchFriends,
    likeActivity,
    unlikeActivity,
    commentOnActivity,
    addFriend,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useSocialStore();

  useEffect(() => {
    fetchFriends();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
  };

  const handleLike = (activityId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikeActivity(activityId);
    } else {
      likeActivity(activityId);
    }
  };

  const pendingRequests = friendRequests.filter(req => req.status === 'pending');

  // Filter friends based on search
  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==================== COMPONENTS ====================

  const renderActivityCard = (activity: SocialActivity) => {
    const isLiked = activity.likes.includes('me');
    
    return (
      <View
        key={activity.id}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0, 217, 163, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 20 }}>{activity.userAvatar || '👤'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
              {activity.userName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {formatTimeAgo(activity.createdAt)}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 24 }}>{getActivityIcon(activity.type)}</Text>
        </View>

        {/* Content */}
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
          {activity.title}
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
          {activity.description}
        </Text>

        {/* Actions */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#f3f4f6',
            gap: 16,
          }}
        >
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            onPress={() => handleLike(activity.id, isLiked)}
          >
            <Heart
              size={18}
              color={isLiked ? '#ef4444' : '#6b7280'}
              fill={isLiked ? '#ef4444' : 'none'}
            />
            <Text style={{ fontSize: 14, color: isLiked ? '#ef4444' : '#6b7280' }}>
              {activity.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MessageCircle size={18} color="#6b7280" />
            <Text style={{ fontSize: 14, color: '#6b7280' }}>
              {activity.comments.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Share2 size={18} color="#6b7280" />
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments */}
        {activity.comments.length > 0 && (
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
            {activity.comments.map(comment => (
              <View key={comment.id} style={{ flexDirection: 'row', marginBottom: 8 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: 'rgba(0, 217, 163, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 12 }}>{comment.userAvatar || '👤'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: '#111827' }}>
                    <Text style={{ fontWeight: '600' }}>{comment.userName}</Text> {comment.text}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    {formatTimeAgo(comment.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderFriendCard = (friend: Friend) => {
    return (
      <TouchableOpacity
        key={friend.id}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => router.push(`/social` as any)}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(0, 217, 163, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            position: 'relative',
          }}
        >
          <Text style={{ fontSize: 24 }}>{friend.avatar || '👤'}</Text>
          {friend.isOnline && (
            <View
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#10b981',
                borderWidth: 2,
                borderColor: '#ffffff',
              }}
            />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
              {friend.name}
            </Text>
            {friend.stats.rank && friend.stats.rank <= 3 && (
              <Text style={{ fontSize: 16, marginLeft: 6 }}>
                {friend.stats.rank === 1 ? '👑' : friend.stats.rank === 2 ? '🥈' : '🥉'}
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} color={theme.colors.primary} />
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {friend.stats.points} pts
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Zap size={12} color="#f59e0b" />
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {friend.stats.streak} day streak
              </Text>
            </View>
          </View>

          {friend.mutualFriends > 0 && (
            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              {friend.mutualFriends} mutual friends
            </Text>
          )}
        </View>

        <ChevronRight size={20} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  const renderFriendRequestCard = (request: FriendRequest) => {
    return (
      <View
        key={request.id}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(0, 217, 163, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 24 }}>{request.fromUserAvatar || '👤'}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
              {request.fromUserName}
            </Text>
            {request.mutualFriends > 0 && (
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {request.mutualFriends} mutual friends
              </Text>
            )}
            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              {formatTimeAgo(request.createdAt)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme.colors.primary,
              borderRadius: 8,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
            onPress={() => acceptFriendRequest(request.id)}
          >
            <Check size={16} color="#ffffff" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
              Accept
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
            onPress={() => rejectFriendRequest(request.id)}
          >
            <X size={16} color="#6b7280" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
              Decline
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSuggestedFriend = (friend: Friend) => {
    return (
      <View
        key={friend.id}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(0, 217, 163, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 24 }}>{friend.avatar || '👤'}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
              {friend.name}
            </Text>
            {friend.mutualFriends > 0 && (
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {friend.mutualFriends} mutual friends
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
            onPress={() => addFriend(friend.id)}
          >
            <UserPlus size={16} color="#ffffff" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ==================== RENDER ====================

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
            Social
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0, 217, 163, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => router.push('/social' as any)}
            >
              <UserPlus size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0, 217, 163, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => router.push('/groups' as any)}
            >
              <Users size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0, 217, 163, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => router.push('/leaderboard' as any)}
            >
              <Trophy size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: activeTab === 'feed' ? theme.colors.primary : '#f3f4f6',
              alignItems: 'center',
            }}
            onPress={() => setActiveTab('feed')}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'feed' ? '#ffffff' : '#6b7280',
              }}
            >
              Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: activeTab === 'friends' ? theme.colors.primary : '#f3f4f6',
              alignItems: 'center',
              position: 'relative',
            }}
            onPress={() => setActiveTab('friends')}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'friends' ? '#ffffff' : '#6b7280',
              }}
            >
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: activeTab === 'requests' ? theme.colors.primary : '#f3f4f6',
              alignItems: 'center',
              position: 'relative',
            }}
            onPress={() => setActiveTab('requests')}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'requests' ? '#ffffff' : '#6b7280',
              }}
            >
              Requests
            </Text>
            {pendingRequests.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  backgroundColor: '#ef4444',
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#ffffff' }}>
                  {pendingRequests.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'feed' && (
          <>
            {socialFeed.length > 0 ? (
              socialFeed.map(activity => renderActivityCard(activity))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <Zap size={48} color="#d1d5db" />
                <Text style={{ fontSize: 16, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
                  No activities yet
                </Text>
                <Text style={{ fontSize: 14, color: '#d1d5db', marginTop: 4, textAlign: 'center' }}>
                  Add friends to see their activities
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'friends' && (
          <>
            {/* Search */}
            <View
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                marginBottom: 16,
              }}
            >
              <Search size={20} color="#9ca3af" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search friends..."
                placeholderTextColor="#9ca3af"
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  fontSize: 15,
                  color: '#111827',
                }}
              />
            </View>

            {/* Suggested Friends */}
            {suggestedFriends.length > 0 && searchQuery === '' && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
                  People You May Know
                </Text>
                {suggestedFriends.map(friend => renderSuggestedFriend(friend))}
              </View>
            )}

            {/* Friends List */}
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
              Your Friends
            </Text>
            {filteredFriends.length > 0 ? (
              filteredFriends.map(friend => renderFriendCard(friend))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <Users size={48} color="#d1d5db" />
                <Text style={{ fontSize: 16, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
                  {searchQuery ? 'No friends found' : 'No friends yet'}
                </Text>
                <TouchableOpacity
                  style={{
                    marginTop: 16,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                  }}
                  onPress={() => router.push('/social' as any)}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
                    Add Friends
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => renderFriendRequestCard(request))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <UserPlus size={48} color="#d1d5db" />
                <Text style={{ fontSize: 16, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
                  No pending requests
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Quick Actions FAB */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => router.push('/referral' as any)}
      >
        <Gift size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
