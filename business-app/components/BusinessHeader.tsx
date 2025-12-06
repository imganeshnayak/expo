import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Bell, ChevronRight } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNotificationStore } from '../store/notificationStore';

interface BusinessHeaderProps {
    title: string;
    showNotification?: boolean;
}

export const BusinessHeader = ({ title, showNotification = true }: BusinessHeaderProps) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const { unreadCount, setModalOpen } = useNotificationStore();

    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerTopRow}>
                <TouchableOpacity style={styles.locationPill}>
                    <MapPin size={14} color={theme.colors.primary} />
                    <Text style={styles.locationText}>Coffee House • Koramangala</Text>
                    <ChevronRight size={12} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                {showNotification && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setModalOpen(true)}
                    >
                        <Bell size={20} color={theme.colors.text} />
                        {unreadCount > 0 && (
                            <View style={styles.notificationDot} />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.greetingContainer}>
                <Text style={styles.greetingMain}>{title}</Text>
            </View>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20, // Added padding bottom to separate from content
        backgroundColor: theme.colors.background,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    locationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    locationText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 11,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.secondary, // Using secondary (Wait, frontend used primary. Let's check theme. Probably should use Primary or Red/Orange for alerts) - Frontend uses primary. Business has secondary as Orange. Let's stick to theme context.
        borderWidth: 1.5,
        borderColor: theme.colors.surface,
    },
    greetingContainer: {
        // removed marginBottom here as paddingBottom on container handles it better for SafeArea logic
    },
    greetingMain: {
        color: theme.colors.text,
        fontSize: 28, // Matches frontend "Discover Deals" size roughly (24 in frontend, visual inspection: make it big)
        fontWeight: '600',
        letterSpacing: -0.5,
    },
});
