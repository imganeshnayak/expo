import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Users,
  Plus,
  MessageCircle,
  Target,
  TrendingUp,
  Gift,
  ChevronRight,
  Send,
  X,
  Check,
  Search,
} from 'lucide-react-native';
import {
  useSocialStore,
  getPurposeLabel,
  getPurposeIcon,
  formatTimeAgo,
  type SocialGroup,
} from '../store/socialStore';
import { theme } from '../constants/theme';

export default function GroupsScreen() {
  const router = useRouter();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  
  const { groups, friends, createGroup, getUnreadMessagesCount } = useSocialStore();

  const renderGroupCard = (group: SocialGroup) => {
    const unreadCount = getUnreadMessagesCount(group.id);
    const latestMessage = group.chatMessages[group.chatMessages.length - 1];
    const progressPercent = group.activeMission
      ? (group.activeMission.progress / group.activeMission.target) * 100
      : 0;

    return (
      <TouchableOpacity
        key={group.id}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
        onPress={() => router.push(`/groups` as any)}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(0, 217, 163, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 32 }}>
              {group.emoji || getPurposeIcon(group.purpose)}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                {group.name}
              </Text>
              {unreadCount > 0 && (
                <View
                  style={{
                    backgroundColor: '#ef4444',
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    marginLeft: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#ffffff' }}>
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Users size={14} color="#6b7280" />
              <Text style={{ fontSize: 13, color: '#6b7280' }}>
                {group.members.length} members
              </Text>
              <Text style={{ fontSize: 13, color: '#d1d5db' }}>•</Text>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>
                {getPurposeLabel(group.purpose)}
              </Text>
            </View>

            {latestMessage && (
              <Text style={{ fontSize: 13, color: '#9ca3af' }} numberOfLines={1}>
                {latestMessage.userName}: {latestMessage.message}
              </Text>
            )}
          </View>

          <ChevronRight size={20} color="#9ca3af" />
        </View>

        {/* Active Mission Progress */}
        {group.activeMission && (
          <View
            style={{
              backgroundColor: 'rgba(0, 217, 163, 0.05)',
              borderRadius: 8,
              padding: 12,
              marginTop: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Target size={16} color={theme.colors.primary} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginLeft: 6, flex: 1 }}>
                {group.activeMission.missionName}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.primary }}>
                {group.activeMission.progress}/{group.activeMission.target}
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={14} color="#10b981" />
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              ₹{group.stats.totalSavings} saved
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Target size={14} color="#3b82f6" />
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              {group.stats.missionsCompleted} missions
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Gift size={14} color="#f59e0b" />
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              {group.stats.dealsShared} deals
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <ArrowLeft color="#111827" size={24} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
              My Groups
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
            onPress={() => setShowCreateGroup(true)}
          >
            <Plus size={18} color="#ffffff" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
              Create
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Groups List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {groups.length > 0 ? (
          groups.map(group => renderGroupCard(group))
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Users size={64} color="#d1d5db" />
            <Text style={{ fontSize: 18, color: '#9ca3af', marginTop: 16, textAlign: 'center' }}>
              No groups yet
            </Text>
            <Text style={{ fontSize: 14, color: '#d1d5db', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
              Create a group to plan outings, share deals, and complete missions together
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 24,
                backgroundColor: theme.colors.primary,
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 32,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
              onPress={() => setShowCreateGroup(true)}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>
                Create Your First Group
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        friends={friends}
        onCreate={createGroup}
      />
    </SafeAreaView>
  );
}

// ==================== CREATE GROUP MODAL ====================

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  friends: any[];
  onCreate: (name: string, purpose: any, memberIds: string[], emoji?: string, description?: string) => Promise<string>;
}

function CreateGroupModal({ visible, onClose, friends, onCreate }: CreateGroupModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState<SocialGroup['purpose']>('hanging_out');
  const [selectedEmoji, setSelectedEmoji] = useState('🎉');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const purposes: { value: SocialGroup['purpose']; label: string; icon: string; description: string }[] = [
    { value: 'hanging_out', label: 'Hanging Out', icon: '🎉', description: 'Casual meetups and fun times' },
    { value: 'food_exploration', label: 'Food Exploration', icon: '🍕', description: 'Discover new restaurants together' },
    { value: 'weekend_plans', label: 'Weekend Plans', icon: '📅', description: 'Plan weekend activities' },
    { value: 'custom', label: 'Custom', icon: '✨', description: 'Create your own purpose' },
  ];

  const emojis = ['🎉', '🍕', '📅', '☕', '🎯', '🏃', '🎬', '🛍️', '🌟', '🚀', '💪', '🎨'];

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    
    const groupId = await onCreate(groupName, purpose, selectedFriends, selectedEmoji, description);
    
    // Reset form
    setStep(1);
    setGroupName('');
    setDescription('');
    setPurpose('hanging_out');
    setSelectedEmoji('🎉');
    setSelectedFriends([]);
    setSearchQuery('');
    
    onClose();
    
    // Navigate to group detail
    router.push(`/groups` as any);
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <View style={{ backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={onClose}>
              <X color="#111827" size={24} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
              Create Group ({step}/3)
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {step === 1 && (
            <>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 24 }}>
                Group Details
              </Text>

              {/* Emoji Selection */}
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Choose Icon
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {emojis.map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: selectedEmoji === emoji ? theme.colors.primary : '#f3f4f6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: selectedEmoji === emoji ? theme.colors.primary : 'transparent',
                    }}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={{ fontSize: 28 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Group Name */}
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Group Name *
              </Text>
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="e.g., Weekend Squad, Foodie Friends"
                placeholderTextColor="#9ca3af"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 8,
                  padding: 14,
                  fontSize: 15,
                  color: '#111827',
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  marginBottom: 20,
                }}
              />

              {/* Description */}
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Description (Optional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What's this group about?"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 8,
                  padding: 14,
                  fontSize: 15,
                  color: '#111827',
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  minHeight: 80,
                }}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 24 }}>
                Group Purpose
              </Text>

              {purposes.map(p => (
                <TouchableOpacity
                  key={p.value}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: purpose === p.value ? theme.colors.primary : '#e5e7eb',
                  }}
                  onPress={() => setPurpose(p.value)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 32, marginRight: 12 }}>{p.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                        {p.label}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                        {p.description}
                      </Text>
                    </View>
                    {purpose === p.value && (
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: theme.colors.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={16} color="#ffffff" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {step === 3 && (
            <>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
                Add Members
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
                {selectedFriends.length} friends selected
              </Text>

              {/* Search */}
              <View
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
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

              {/* Friends List */}
              {filteredFriends.map(friend => (
                <TouchableOpacity
                  key={friend.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: selectedFriends.includes(friend.id) ? theme.colors.primary : '#e5e7eb',
                  }}
                  onPress={() => toggleFriend(friend.id)}
                >
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
                    <Text style={{ fontSize: 20 }}>{friend.avatar || '👤'}</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: '#111827', flex: 1 }}>
                    {friend.name}
                  </Text>
                  {selectedFriends.includes(friend.id) ? (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: theme.colors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={16} color="#ffffff" />
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: '#d1d5db',
                      }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>

        {/* Footer Buttons */}
        <View
          style={{
            backgroundColor: '#ffffff',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            flexDirection: 'row',
            gap: 12,
          }}
        >
          {step > 1 && (
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
              }}
              onPress={() => setStep(step - 1)}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280' }}>
                Back
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{
              flex: step === 1 ? 1 : 1,
              backgroundColor: step === 3 && !groupName.trim() ? '#d1d5db' : theme.colors.primary,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
            onPress={() => {
              if (step < 3) {
                if (step === 1 && !groupName.trim()) return;
                setStep(step + 1);
              } else {
                handleCreate();
              }
            }}
            disabled={step === 3 && !groupName.trim()}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>
              {step === 3 ? 'Create Group' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
