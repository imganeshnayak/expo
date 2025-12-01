import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    X,
    Bell,
    Rocket,
    Users,
    Settings,
    AlertCircle,
    Trash2,
    CheckCheck,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
    useNotificationStore,
    type Notification,
    type NotificationType,
    formatNotificationTime,
    getNotificationColor,
} from '../../store/notificationStore';

interface NotificationCenterProps {
    visible: boolean;
    onClose: () => void;
}

export default function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
    const theme = useAppTheme();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotificationStore();

    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const styles = getStyles(theme);

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'campaign': return Rocket;
            case 'customer': return Users;
            case 'system': return Settings;
            case 'alert': return AlertCircle;
            default: return Bell;
        }
    };

    const handleNotificationPress = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        // In a real app, navigate to the relevant screen based on notification type
    };

    const renderNotification = (notification: Notification) => {
        const Icon = getNotificationIcon(notification.type);
        const priorityColor = getNotificationColor(notification.priority);

        return (
            <TouchableOpacity
                key={notification.id}
                style={[
                    styles.notificationCard,
                    !notification.read && styles.notificationCardUnread,
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
            >
                <View style={styles.notificationContent}>
                    <View style={[styles.iconContainer, { backgroundColor: `${priorityColor}20` }]}>
                        <Icon size={20} color={priorityColor} />
                    </View>

                    <View style={styles.notificationText}>
                        <View style={styles.notificationHeader}>
                            <Text style={styles.notificationTitle} numberOfLines={1}>
                                {notification.title}
                            </Text>
                            {!notification.read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                            {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                            {formatNotificationTime(notification.timestamp)}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteNotification(notification.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Trash2 size={16} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Notifications</Text>
                        {unreadCount > 0 && (
                            <Text style={styles.headerSubtitle}>
                                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                            All ({notifications.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
                        onPress={() => setFilter('unread')}
                    >
                        <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
                            Unread ({unreadCount})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Mark All as Read Button */}
                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                        <CheckCheck size={16} color={theme.colors.primary} />
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                )}

                {/* Notifications List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(renderNotification)
                    ) : (
                        <View style={styles.emptyState}>
                            <Bell size={64} color={theme.colors.textTertiary} />
                            <Text style={styles.emptyTitle}>No notifications</Text>
                            <Text style={styles.emptyText}>
                                {filter === 'unread'
                                    ? "You're all caught up!"
                                    : 'Notifications will appear here'}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surfaceLight,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '600',
        color: theme.colors.text,
    },
    headerSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
    },
    filterTabActive: {
        backgroundColor: `${theme.colors.primary}20`,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    filterTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginBottom: 8,
    },
    markAllText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 8,
    },
    notificationCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    notificationCardUnread: {
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}05`,
    },
    notificationContent: {
        flexDirection: 'row',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationText: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    notificationTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
    },
    notificationMessage: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
        marginBottom: 6,
    },
    notificationTime: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    deleteButton: {
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
