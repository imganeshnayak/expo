import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useExternalLoyaltyStore,
  LoyaltyReminder,
} from '../store/externalLoyaltyStore';
import { theme } from '../constants/theme';

const primaryColor = theme.colors.primary;

export default function LoyaltyNotificationsScreen() {
  const router = useRouter();
  const {
    reminders,
    programs,
    generateReminders,
    markReminderRead,
    markAllRemindersRead,
  } = useExternalLoyaltyStore();

  useEffect(() => {
    generateReminders();
  }, []);

  const unreadReminders = reminders.filter(r => !r.isRead);
  const readReminders = reminders.filter(r => r.isRead);

  const handleReminderPress = (reminder: LoyaltyReminder) => {
    if (!reminder.isRead) {
      markReminderRead(reminder.id);
    }
    
    // Navigate to the program detail
    const program = programs.find(p => p.id === reminder.programId);
    if (program) {
      router.push({
        pathname: '/manual-update' as any,
        params: { programId: program.id },
      });
    }
  };

  const getIcon = (type: LoyaltyReminder['type']) => {
    switch (type) {
      case 'expiring_soon':
        return 'time-outline';
      case 'milestone_reached':
        return 'trophy-outline';
      case 'unused_points':
        return 'warning-outline';
      case 'new_reward':
        return 'gift-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getColor = (type: LoyaltyReminder['type']) => {
    switch (type) {
      case 'expiring_soon':
        return '#FF9800';
      case 'milestone_reached':
        return '#4CAF50';
      case 'unused_points':
        return '#FF5722';
      case 'new_reward':
        return primaryColor;
      default:
        return '#888';
    }
  };

  const getBackgroundColor = (type: LoyaltyReminder['type']) => {
    return getColor(type) + '20';
  };

  const ReminderCard = ({ reminder }: { reminder: LoyaltyReminder }) => (
    <TouchableOpacity
      style={[
        styles.reminderCard,
        !reminder.isRead && styles.reminderUnread,
      ]}
      onPress={() => handleReminderPress(reminder)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getBackgroundColor(reminder.type) },
        ]}
      >
        <Ionicons
          name={getIcon(reminder.type) as any}
          size={28}
          color={getColor(reminder.type)}
        />
      </View>
      <View style={styles.reminderContent}>
        <View style={styles.reminderHeader}>
          <Text style={styles.merchantName}>{reminder.merchantName}</Text>
          {!reminder.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.reminderMessage}>{reminder.message}</Text>
        <View style={styles.reminderFooter}>
          <Text style={styles.reminderTime}>
            {formatTime(reminder.timestamp)}
          </Text>
          {reminder.actionRequired && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionText}>Action Required</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadReminders.length > 0 && (
          <TouchableOpacity onPress={markAllRemindersRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
        {unreadReminders.length === 0 && <View style={{ width: 24 }} />}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{unreadReminders.length}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reminders.filter(r => r.actionRequired).length}
          </Text>
          <Text style={styles.statLabel}>Action Required</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reminders.filter(r => r.type === 'expiring_soon').length}
          </Text>
          <Text style={styles.statLabel}>Expiring Soon</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Unread Section */}
        {unreadReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              New ({unreadReminders.length})
            </Text>
            {unreadReminders
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(reminder => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
          </View>
        )}

        {/* Read Section */}
        {readReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {readReminders
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(reminder => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
          </View>
        )}

        {/* Empty State */}
        {reminders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You'll see reminders about your loyalty programs here
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
    color: primaryColor,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reminderUnread: {
    borderColor: primaryColor,
    borderWidth: 2,
    backgroundColor: primaryColor + '08',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: primaryColor,
    marginLeft: 8,
  },
  reminderMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  reminderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderTime: {
    fontSize: 12,
    color: '#888',
  },
  actionBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
