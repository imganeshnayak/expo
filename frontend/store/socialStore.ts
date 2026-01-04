import { create } from 'zustand';

// ==================== TYPES ====================

export interface Friend {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  mutualFriends: number;
  lastActive: Date;
  isOnline: boolean;
  joinedAt: Date;
  stats: {
    points: number;
    missionsCompleted: number;
    totalSavings: number;
    streak: number;
    rank?: number;
  };
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  mutualFriends: number;
}

export interface SocialGroup {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  purpose: 'hanging_out' | 'food_exploration' | 'weekend_plans' | 'custom';
  activeMission?: {
    missionId: string;
    missionName: string;
    progress: number;
    target: number;
    contributedBy: { userId: string; contribution: number }[];
  };
  chatMessages: GroupMessage[];
  stats: {
    totalSavings: number;
    missionsCompleted: number;
    dealsShared: number;
  };
}

export interface GroupMember {
  userId: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  contribution: number; // missions/savings contributed
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  type: 'text' | 'deal_share' | 'mission_invite' | 'system';
  metadata?: any;
  createdAt: Date;
  readBy: string[];
}

export interface SharedDeal {
  id: string;
  dealId: string;
  dealTitle: string;
  dealDiscount: string;
  merchantName: string;
  sharedBy: string;
  sharedByName: string;
  sharedWith: string[]; // user IDs
  groupId?: string;
  message?: string;
  createdAt: Date;
  claimedBy: string[];
  expiresAt?: Date;
}

export interface SocialActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'mission_completed' | 'deal_shared' | 'stamp_earned' | 'badge_unlocked' | 'group_created' | 'friend_joined' | 'achievement' | 'savings_milestone';
  title: string;
  description: string;
  data: any;
  createdAt: Date;
  likes: string[]; // user IDs who liked
  comments: SocialComment[];
}

export interface SocialComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: Date;
}

export interface Leaderboard {
  id: string;
  type: 'friends' | 'city' | 'college' | 'company';
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  missionsCompleted: number;
  totalSavings: number;
  streak: number;
  badge?: string;
  trend?: 'up' | 'down' | 'same'; // compared to last period
}

export interface Referral {
  id: string;
  code: string;
  referrerId: string;
  refereeId?: string;
  refereeName?: string;
  refereePhone?: string;
  status: 'pending' | 'joined' | 'completed' | 'expired';
  createdAt: Date;
  joinedAt?: Date;
  completedAt?: Date; // when referee completes first deal
  rewards: {
    referrerReward: number;
    refereeReward: number;
    bonusReward?: number;
  };
  earnings: {
    referrer: number;
    referee: number;
  };
}

export interface SocialBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'achievement' | 'special';
  unlockedAt?: Date;
  progress?: number;
  target?: number;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  showActivity: boolean;
  showStats: boolean;
  showFriendList: boolean;
  allowFriendRequests: boolean;
  allowGroupInvites: boolean;
  shareAchievements: boolean;
  shareDeals: boolean;
}

// ==================== SAMPLE DATA ====================

const SAMPLE_FRIENDS: Friend[] = [
  {
    id: 'friend-1',
    name: 'Rohan Sharma',
    phone: '+91 98765 43210',
    avatar: '👨',
    mutualFriends: 5,
    lastActive: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    isOnline: true,
    joinedAt: new Date('2024-01-15'),
    stats: {
      points: 2450,
      missionsCompleted: 23,
      totalSavings: 4200,
      streak: 12,
      rank: 2,
    },
  },
  {
    id: 'friend-2',
    name: 'Priya Patel',
    phone: '+91 98765 43211',
    avatar: '👩',
    mutualFriends: 8,
    lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    isOnline: false,
    joinedAt: new Date('2024-02-01'),
    stats: {
      points: 3100,
      missionsCompleted: 31,
      totalSavings: 5600,
      streak: 18,
      rank: 1,
    },
  },
  {
    id: 'friend-3',
    name: 'Akshay Kumar',
    phone: '+91 98765 43212',
    avatar: '🧑',
    mutualFriends: 3,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isOnline: false,
    joinedAt: new Date('2024-01-20'),
    stats: {
      points: 1800,
      missionsCompleted: 18,
      totalSavings: 3200,
      streak: 7,
      rank: 5,
    },
  },
  {
    id: 'friend-4',
    name: 'Sneha Reddy',
    phone: '+91 98765 43213',
    avatar: '👧',
    mutualFriends: 12,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isOnline: false,
    joinedAt: new Date('2023-12-10'),
    stats: {
      points: 2200,
      missionsCompleted: 25,
      totalSavings: 3800,
      streak: 5,
      rank: 3,
    },
  },
];

const SAMPLE_GROUPS: SocialGroup[] = [
  {
    id: 'group-1',
    name: 'Weekend Squad',
    emoji: '🎉',
    description: 'Friday night hangout crew',
    members: [
      { userId: 'me', name: 'You', role: 'admin', joinedAt: new Date('2024-01-10'), contribution: 15 },
      { userId: 'friend-1', name: 'Rohan Sharma', avatar: '👨', role: 'member', joinedAt: new Date('2024-01-10'), contribution: 12 },
      { userId: 'friend-2', name: 'Priya Patel', avatar: '👩', role: 'member', joinedAt: new Date('2024-01-11'), contribution: 18 },
      { userId: 'friend-4', name: 'Sneha Reddy', avatar: '👧', role: 'member', joinedAt: new Date('2024-01-12'), contribution: 10 },
    ],
    createdBy: 'me',
    createdAt: new Date('2024-01-10'),
    purpose: 'weekend_plans',
    activeMission: {
      missionId: 'mission-1',
      missionName: 'Friday Night Thrills',
      progress: 7,
      target: 10,
      contributedBy: [
        { userId: 'me', contribution: 3 },
        { userId: 'friend-1', contribution: 2 },
        { userId: 'friend-2', contribution: 2 },
      ],
    },
    chatMessages: [
      {
        id: 'msg-1',
        groupId: 'group-1',
        userId: 'friend-2',
        userName: 'Priya Patel',
        userAvatar: '👩',
        message: 'Found an amazing new cafe! Check out the deal I shared',
        type: 'text',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        readBy: ['me', 'friend-1'],
      },
      {
        id: 'msg-2',
        groupId: 'group-1',
        userId: 'friend-1',
        userName: 'Rohan Sharma',
        userAvatar: '👨',
        message: 'Want to complete the Friday mission together this week?',
        type: 'text',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        readBy: ['me'],
      },
    ],
    stats: {
      totalSavings: 8500,
      missionsCompleted: 12,
      dealsShared: 28,
    },
  },
  {
    id: 'group-2',
    name: 'Foodie Friends',
    emoji: '🍕',
    description: 'Exploring the best food in the city',
    members: [
      { userId: 'me', name: 'You', role: 'admin', joinedAt: new Date('2024-02-01'), contribution: 20 },
      { userId: 'friend-3', name: 'Akshay Kumar', avatar: '🧑', role: 'member', joinedAt: new Date('2024-02-01'), contribution: 15 },
    ],
    createdBy: 'me',
    createdAt: new Date('2024-02-01'),
    purpose: 'food_exploration',
    chatMessages: [],
    stats: {
      totalSavings: 3200,
      missionsCompleted: 5,
      dealsShared: 12,
    },
  },
];

const SAMPLE_ACTIVITIES: SocialActivity[] = [
  {
    id: 'activity-1',
    userId: 'friend-2',
    userName: 'Priya Patel',
    userAvatar: '👩',
    type: 'mission_completed',
    title: 'Mission Completed',
    description: 'Completed "Coffee Explorer" mission and earned 500 points!',
    data: { missionName: 'Coffee Explorer', points: 500 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    likes: ['me', 'friend-1'],
    comments: [
      {
        id: 'comment-1',
        userId: 'friend-1',
        userName: 'Rohan Sharma',
        userAvatar: '👨',
        text: 'Awesome! Which cafe did you try?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
  },
  {
    id: 'activity-2',
    userId: 'friend-1',
    userName: 'Rohan Sharma',
    userAvatar: '👨',
    type: 'badge_unlocked',
    title: 'Badge Unlocked',
    description: 'Unlocked "Social Butterfly" badge by adding 10 friends!',
    data: { badgeName: 'Social Butterfly', category: 'social' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    likes: ['me', 'friend-2', 'friend-3'],
    comments: [],
  },
  {
    id: 'activity-3',
    userId: 'friend-4',
    userName: 'Sneha Reddy',
    userAvatar: '👧',
    type: 'savings_milestone',
    title: 'Savings Milestone',
    description: 'Saved ₹5,000 this month! 🎉',
    data: { amount: 5000 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    likes: ['me', 'friend-1', 'friend-2'],
    comments: [],
  },
  {
    id: 'activity-4',
    userId: 'friend-3',
    userName: 'Akshay Kumar',
    userAvatar: '🧑',
    type: 'group_created',
    title: 'Group Created',
    description: 'Created a new group "Office Gang" for weekend plans',
    data: { groupName: 'Office Gang' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    likes: ['me'],
    comments: [],
  },
];

const SAMPLE_REFERRALS: Referral[] = [
  {
    id: 'ref-1',
    code: 'UMA-SARAH-2024',
    referrerId: 'me',
    refereeId: 'ref-user-1',
    refereeName: 'Amit Singh',
    refereePhone: '+91 98765 11111',
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    joinedAt: new Date('2024-01-16'),
    completedAt: new Date('2024-01-18'),
    rewards: {
      referrerReward: 100,
      refereeReward: 150,
    },
    earnings: {
      referrer: 100,
      referee: 150,
    },
  },
  {
    id: 'ref-2',
    code: 'UMA-SARAH-2024',
    referrerId: 'me',
    refereeId: 'ref-user-2',
    refereeName: 'Neha Gupta',
    refereePhone: '+91 98765 22222',
    status: 'joined',
    createdAt: new Date('2024-02-01'),
    joinedAt: new Date('2024-02-02'),
    rewards: {
      referrerReward: 100,
      refereeReward: 150,
    },
    earnings: {
      referrer: 0,
      referee: 150,
    },
  },
  {
    id: 'ref-3',
    code: 'UMA-SARAH-2024',
    referrerId: 'me',
    refereePhone: '+91 98765 33333',
    status: 'pending',
    createdAt: new Date('2024-02-10'),
    rewards: {
      referrerReward: 100,
      refereeReward: 150,
    },
    earnings: {
      referrer: 0,
      referee: 0,
    },
  },
];

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'friend-2',
    userName: 'Priya Patel',
    userAvatar: '👩',
    points: 3100,
    missionsCompleted: 31,
    totalSavings: 5600,
    streak: 18,
    badge: '👑',
    trend: 'up',
  },
  {
    rank: 2,
    userId: 'friend-1',
    userName: 'Rohan Sharma',
    userAvatar: '👨',
    points: 2450,
    missionsCompleted: 23,
    totalSavings: 4200,
    streak: 12,
    badge: '🥈',
    trend: 'same',
  },
  {
    rank: 3,
    userId: 'friend-4',
    userName: 'Sneha Reddy',
    userAvatar: '👧',
    points: 2200,
    missionsCompleted: 25,
    totalSavings: 3800,
    streak: 5,
    badge: '🥉',
    trend: 'down',
  },
  {
    rank: 4,
    userId: 'me',
    userName: 'You',
    points: 1950,
    missionsCompleted: 20,
    totalSavings: 3500,
    streak: 8,
    trend: 'up',
  },
  {
    rank: 5,
    userId: 'friend-3',
    userName: 'Akshay Kumar',
    userAvatar: '🧑',
    points: 1800,
    missionsCompleted: 18,
    totalSavings: 3200,
    streak: 7,
    trend: 'same',
  },
];

const SOCIAL_BADGES: SocialBadge[] = [
  {
    id: 'badge-1',
    name: 'Social Butterfly',
    description: 'Add 10 friends to your network',
    icon: '🦋',
    category: 'social',
    unlockedAt: new Date('2024-01-20'),
  },
  {
    id: 'badge-2',
    name: 'Influencer',
    description: 'Get 5 friends to join via your referral',
    icon: '📢',
    category: 'social',
    progress: 2,
    target: 5,
  },
  {
    id: 'badge-3',
    name: 'Group Explorer',
    description: 'Complete 3 group missions',
    icon: '🎯',
    category: 'social',
    progress: 1,
    target: 3,
  },
  {
    id: 'badge-4',
    name: 'Deal Sharer',
    description: 'Share 20 deals with friends',
    icon: '🎁',
    category: 'social',
    progress: 12,
    target: 20,
  },
  {
    id: 'badge-5',
    name: 'Streak Master',
    description: 'Maintain a 30-day login streak',
    icon: '🔥',
    category: 'achievement',
    progress: 8,
    target: 30,
  },
];

// ==================== STORE ====================

interface SocialState {
  // Data
  friends: Friend[];
  friendRequests: FriendRequest[];
  groups: SocialGroup[];
  sharedDeals: SharedDeal[];
  socialFeed: SocialActivity[];
  leaderboards: Leaderboard[];
  referrals: Referral[];
  badges: SocialBadge[];
  privacySettings: PrivacySettings;
  suggestedFriends: Friend[];

  // User Stats
  myReferralCode: string;
  totalReferralEarnings: number;
  myArchetype?: string;

  // Actions
  fetchFriends: () => Promise<void>;
  fetchReferralData: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  addFriend: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;

  createGroup: (name: string, purpose: SocialGroup['purpose'], memberIds: string[], emoji?: string, description?: string) => Promise<string>;
  addGroupMember: (groupId: string, userId: string) => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  sendGroupMessage: (groupId: string, message: string, type?: GroupMessage['type']) => Promise<void>;

  shareDeal: (dealId: string, dealTitle: string, dealDiscount: string, merchantName: string, recipientIds: string[], message?: string, groupId?: string) => Promise<void>;
  claimSharedDeal: (sharedDealId: string) => Promise<void>;

  postActivity: (type: SocialActivity['type'], title: string, description: string, data: any) => Promise<void>;
  likeActivity: (activityId: string) => Promise<void>;
  unlikeActivity: (activityId: string) => Promise<void>;
  commentOnActivity: (activityId: string, text: string) => Promise<void>;

  generateReferralLink: () => string;
  trackReferral: (refereePhone: string) => Promise<void>;

  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;

  fetchLeaderboard: (type: Leaderboard['type'], period: Leaderboard['period']) => Promise<void>;
  setArchetype: (archetype: string) => Promise<void>;
  fetchArchetype: () => Promise<void>;

  // Helper functions
  getFriendById: (friendId: string) => Friend | undefined;
  getGroupById: (groupId: string) => SocialGroup | undefined;
  getUnreadMessagesCount: (groupId: string) => number;
  getTotalEarnings: () => number;
  getCompletedReferrals: () => number;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  // Initial State
  friends: SAMPLE_FRIENDS,
  friendRequests: [],
  groups: SAMPLE_GROUPS,
  sharedDeals: [],
  socialFeed: SAMPLE_ACTIVITIES,
  leaderboards: [
    {
      id: 'lb-1',
      type: 'friends',
      period: 'weekly',
      entries: LEADERBOARD_DATA,
      lastUpdated: new Date(),
    },
  ],
  referrals: SAMPLE_REFERRALS,
  badges: SOCIAL_BADGES,
  privacySettings: {
    showOnlineStatus: true,
    showActivity: true,
    showStats: true,
    showFriendList: true,
    allowFriendRequests: true,
    allowGroupInvites: true,
    shareAchievements: true,
    shareDeals: true,
  },
  suggestedFriends: [
    {
      id: 'suggested-1',
      name: 'Ravi Malhotra',
      phone: '+91 98765 99999',
      avatar: '👨‍💼',
      mutualFriends: 3,
      lastActive: new Date(),
      isOnline: false,
      joinedAt: new Date('2024-01-01'),
      stats: { points: 1500, missionsCompleted: 15, totalSavings: 2500, streak: 5 },
    },
  ],
  myReferralCode: 'UMA-SARAH-2024',
  totalReferralEarnings: 0,

  // Actions
  fetchFriends: async () => {
    try {
      const { socialService } = require('@/services/api/socialService');
      const res = await socialService.getFriends();
      if (res.data) {
        set({ friends: res.data.friends });
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  },

  fetchReferralData: async () => {
    try {
      const { api } = require('@/services/api/client'); // Direct API usage or create a service
      const res = await api.get('/api/referrals/me');
      if (res.data) {
        set({
          myReferralCode: res.data.code,
          totalReferralEarnings: res.data.totalEarnings,
          referrals: res.data.referrals
        });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  },

  addFriend: async (friendId: string) => {
    const { suggestedFriends, friends } = get();
    const friend = suggestedFriends.find(f => f.id === friendId);
    if (friend) {
      set({
        friends: [...friends, friend],
        suggestedFriends: suggestedFriends.filter(f => f.id !== friendId),
      });

      // Post activity
      get().postActivity(
        'friend_joined',
        'New Friend',
        `${friend.name} is now your friend!`,
        { friendId, friendName: friend.name }
      );
    }
  },

  removeFriend: async (friendId: string) => {
    const { friends } = get();
    set({ friends: friends.filter(f => f.id !== friendId) });
  },

  sendFriendRequest: async (userId: string) => {
    const { friendRequests } = get();
    const newRequest: FriendRequest = {
      id: `req-${Date.now()}`,
      fromUserId: 'me',
      fromUserName: 'You',
      toUserId: userId,
      status: 'pending',
      createdAt: new Date(),
      mutualFriends: 0,
    };
    set({ friendRequests: [...friendRequests, newRequest] });
  },

  acceptFriendRequest: async (requestId: string) => {
    const { friendRequests, friends } = get();
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      // Add to friends list
      const newFriend: Friend = {
        id: request.fromUserId,
        name: request.fromUserName,
        phone: '+91 98765 00000',
        avatar: request.fromUserAvatar,
        mutualFriends: request.mutualFriends,
        lastActive: new Date(),
        isOnline: false,
        joinedAt: new Date(),
        stats: { points: 0, missionsCompleted: 0, totalSavings: 0, streak: 0 },
      };

      set({
        friends: [...friends, newFriend],
        friendRequests: friendRequests.map(r =>
          r.id === requestId ? { ...r, status: 'accepted' as const } : r
        ),
      });
    }
  },

  rejectFriendRequest: async (requestId: string) => {
    const { friendRequests } = get();
    set({
      friendRequests: friendRequests.map(r =>
        r.id === requestId ? { ...r, status: 'rejected' as const } : r
      ),
    });
  },

  createGroup: async (name: string, purpose: SocialGroup['purpose'], memberIds: string[], emoji?: string, description?: string) => {
    try {
      const { socialService } = require('@/services/api/socialService');
      const res = await socialService.createGroup({ name, purpose, memberIds, emoji, description });
      if (res.data) {
        await get().fetchGroups();
        return res.data.data._id;
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
    return '';
  },

  fetchGroups: async () => {
    try {
      const { socialService } = require('@/services/api/socialService');
      const res = await socialService.getMyGroups();
      if (res.data) {
        const mappedGroups = res.data.data.map((g: any) => ({
          ...g,
          id: g._id,
          members: g.members.map((m: any) => ({
            ...m,
            userId: m.userId._id,
            name: m.userId.profile.name,
            avatar: m.userId.profile.avatar
          }))
        }));
        set({ groups: mappedGroups });
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  },

  fetchLeaderboard: async (type: Leaderboard['type'], period: Leaderboard['period']) => {
    try {
      const { socialService } = require('@/services/api/socialService');
      const res = await socialService.getLeaderboard(type, period);
      if (res.data) {
        const { leaderboards } = get();
        const existingIndex = leaderboards.findIndex(l => l.type === type && l.period === period);

        const newLeaderboard: Leaderboard = {
          id: `lb-${type}-${period}`,
          type,
          period,
          entries: res.data.data,
          lastUpdated: new Date(),
        };

        if (existingIndex >= 0) {
          const newLeaderboards = [...leaderboards];
          newLeaderboards[existingIndex] = newLeaderboard;
          set({ leaderboards: newLeaderboards });
        } else {
          set({ leaderboards: [...leaderboards, newLeaderboard] });
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  },

  addGroupMember: async (groupId: string, userId: string) => {
    const { groups, friends } = get();
    const friend = friends.find(f => f.id === userId);
    if (!friend) return;

    set({
      groups: groups.map(g =>
        g.id === groupId
          ? {
            ...g,
            members: [
              ...g.members,
              {
                userId,
                name: friend.name,
                avatar: friend.avatar,
                role: 'member' as const,
                joinedAt: new Date(),
                contribution: 0,
              },
            ],
          }
          : g
      ),
    });
  },

  removeGroupMember: async (groupId: string, userId: string) => {
    const { groups } = get();
    set({
      groups: groups.map(g =>
        g.id === groupId
          ? { ...g, members: g.members.filter(m => m.userId !== userId) }
          : g
      ),
    });
  },

  sendGroupMessage: async (groupId: string, message: string, type: GroupMessage['type'] = 'text') => {
    const { groups } = get();
    const newMessage: GroupMessage = {
      id: `msg-${Date.now()}`,
      groupId,
      userId: 'me',
      userName: 'You',
      message,
      type,
      createdAt: new Date(),
      readBy: ['me'],
    };

    set({
      groups: groups.map(g =>
        g.id === groupId
          ? { ...g, chatMessages: [...g.chatMessages, newMessage] }
          : g
      ),
    });
  },

  shareDeal: async (dealId: string, dealTitle: string, dealDiscount: string, merchantName: string, recipientIds: string[], message?: string, groupId?: string) => {
    const { sharedDeals, groups } = get();
    const newSharedDeal: SharedDeal = {
      id: `shared-${Date.now()}`,
      dealId,
      dealTitle,
      dealDiscount,
      merchantName,
      sharedBy: 'me',
      sharedByName: 'You',
      sharedWith: recipientIds,
      groupId,
      message,
      createdAt: new Date(),
      claimedBy: [],
    };

    set({ sharedDeals: [...sharedDeals, newSharedDeal] });

    // If shared with group, send message
    if (groupId) {
      get().sendGroupMessage(
        groupId,
        message || `Check out this deal: ${dealTitle} - ${dealDiscount} at ${merchantName}!`,
        'deal_share'
      );

      // Update group stats
      set({
        groups: groups.map(g =>
          g.id === groupId
            ? { ...g, stats: { ...g.stats, dealsShared: g.stats.dealsShared + 1 } }
            : g
        ),
      });
    }

    // Post activity
    get().postActivity(
      'deal_shared',
      'Deal Shared',
      `Shared ${dealTitle} with friends`,
      { dealId, dealTitle, merchantName }
    );
  },

  claimSharedDeal: async (sharedDealId: string) => {
    const { sharedDeals } = get();
    set({
      sharedDeals: sharedDeals.map(d =>
        d.id === sharedDealId
          ? { ...d, claimedBy: [...d.claimedBy, 'me'] }
          : d
      ),
    });
  },

  postActivity: async (type: SocialActivity['type'], title: string, description: string, data: any) => {
    const { socialFeed, privacySettings } = get();

    if (!privacySettings.showActivity) return;

    const newActivity: SocialActivity = {
      id: `activity-${Date.now()}`,
      userId: 'me',
      userName: 'You',
      type,
      title,
      description,
      data,
      createdAt: new Date(),
      likes: [],
      comments: [],
    };

    set({ socialFeed: [newActivity, ...socialFeed] });
  },

  likeActivity: async (activityId: string) => {
    const { socialFeed } = get();
    set({
      socialFeed: socialFeed.map(a =>
        a.id === activityId
          ? { ...a, likes: [...a.likes, 'me'] }
          : a
      ),
    });
  },

  unlikeActivity: async (activityId: string) => {
    const { socialFeed } = get();
    set({
      socialFeed: socialFeed.map(a =>
        a.id === activityId
          ? { ...a, likes: a.likes.filter(id => id !== 'me') }
          : a
      ),
    });
  },

  commentOnActivity: async (activityId: string, text: string) => {
    const { socialFeed } = get();
    const newComment: SocialComment = {
      id: `comment-${Date.now()}`,
      userId: 'me',
      userName: 'You',
      text,
      createdAt: new Date(),
    };

    set({
      socialFeed: socialFeed.map(a =>
        a.id === activityId
          ? { ...a, comments: [...a.comments, newComment] }
          : a
      ),
    });
  },

  generateReferralLink: () => {
    const { myReferralCode } = get();
    return `https://uma.app/join/${myReferralCode}`;
  },

  trackReferral: async (refereePhone: string) => {
    const { referrals, myReferralCode } = get();
    const newReferral: Referral = {
      id: `ref-${Date.now()}`,
      code: myReferralCode,
      referrerId: 'me',
      refereePhone,
      status: 'pending',
      createdAt: new Date(),
      rewards: {
        referrerReward: 100,
        refereeReward: 150,
      },
      earnings: {
        referrer: 0,
        referee: 0,
      },
    };

    set({ referrals: [...referrals, newReferral] });
  },

  updatePrivacySettings: (settings: Partial<PrivacySettings>) => {
    const { privacySettings } = get();
    set({ privacySettings: { ...privacySettings, ...settings } });
  },



  setArchetype: async (archetype: string) => {
    try {
      const { socialService } = require('@/services/api/socialService');
      await socialService.setArchetype(archetype);
      set({ myArchetype: archetype });
    } catch (error) {
      console.error('Error setting archetype:', error);
    }
  },

  fetchArchetype: async () => {
    try {
      const { socialService } = require('@/services/api/socialService');
      const res = await socialService.getArchetype();
      if (res.data && res.data.data.archetype) {
        set({ myArchetype: res.data.data.archetype });
      }
    } catch (error) {
      console.error('Error fetching archetype:', error);
    }
  },

  // Helper functions
  getFriendById: (friendId: string) => {
    return get().friends.find(f => f.id === friendId);
  },

  getGroupById: (groupId: string) => {
    return get().groups.find(g => g.id === groupId);
  },

  getUnreadMessagesCount: (groupId: string) => {
    const group = get().groups.find(g => g.id === groupId);
    if (!group) return 0;
    return group.chatMessages.filter(m => !m.readBy.includes('me')).length;
  },

  getTotalEarnings: () => {
    const { referrals } = get();
    return referrals.reduce((sum, ref) => sum + ref.earnings.referrer, 0);
  },

  getCompletedReferrals: () => {
    const { referrals } = get();
    return referrals.filter(ref => ref.status === 'completed').length;
  },
}));

// Export helper functions for formatting
export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

export const getActivityIcon = (type: SocialActivity['type']): string => {
  switch (type) {
    case 'mission_completed': return '🎯';
    case 'deal_shared': return '🎁';
    case 'stamp_earned': return '⭐';
    case 'badge_unlocked': return '🏆';
    case 'group_created': return '👥';
    case 'friend_joined': return '👋';
    case 'achievement': return '🎊';
    case 'savings_milestone': return '💰';
    default: return '📌';
  }
};

export const getPurposeLabel = (purpose: SocialGroup['purpose']): string => {
  switch (purpose) {
    case 'hanging_out': return 'Hanging Out';
    case 'food_exploration': return 'Food Exploration';
    case 'weekend_plans': return 'Weekend Plans';
    case 'custom': return 'Custom';
    default: return purpose;
  }
};

export const getPurposeIcon = (purpose: SocialGroup['purpose']): string => {
  switch (purpose) {
    case 'hanging_out': return '🎉';
    case 'food_exploration': return '🍕';
    case 'weekend_plans': return '📅';
    case 'custom': return '✨';
    default: return '👥';
  }
};
