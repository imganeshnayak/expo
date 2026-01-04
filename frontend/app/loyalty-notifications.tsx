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
import { useUserStore } from '../store/userStore';
import { useAppTheme } from '../store/themeStore';

export default function LoyaltyNotificationsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = getStyles(theme);

  // Gating Logic
  const { gamification } = useUserStore();

  const {
    reminders,
    programs,
    generateReminders,
    fetchNotifications,
    markReminderRead,
    markAllRemindersRead,
  } = useExternalLoyaltyStore();

  const [showHistory, setShowHistory] = React.useState(false);

  useEffect(() => {
    generateReminders();
    fetchNotifications();
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
        pathname: '/loyalty-detail' as any,
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
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
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
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
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
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
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

        {/* Read Section - Collapsible */}
        {readReminders.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.historyToggle}
              onPress={() => setShowHistory(!showHistory)}
            >
              <Text style={styles.historyToggleText}>
                {showHistory ? 'Hide Earlier Notifications' : `Show earlier notifications (${readReminders.length})`}
              </Text>
              <Ionicons name={showHistory ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {showHistory && (
              <View style={{ marginTop: 12 }}>
                {readReminders
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map(reminder => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
              </View>
            )}
          </View>
        )}

        {/* Empty State - Only if no UNREAD and history hidden (or empty) */}
        {unreadReminders.length === 0 && (!showHistory || readReminders.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={80} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>
              {readReminders.length > 0 ? "You have read all your notifications." : "You'll see reminders about your loyalty programs here"}
            </Text>
            {readReminders.length > 0 && !showHistory && (
              <TouchableOpacity onPress={() => setShowHistory(true)} style={{ marginTop: 16 }}>
                <Text style={styles.markAllRead}>View History</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
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
    color: theme.colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reminderUnread: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.primary + '08',
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
    color: theme.colors.text,
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  reminderMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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
    color: theme.colors.textSecondary,
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
    color: theme.colors.textSecondary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyToggleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  // Locked State
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: -40, // Offset for header
  },
  lockedIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  lockedText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.colors.surfaceHighlight || '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  lockedButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  lockedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
