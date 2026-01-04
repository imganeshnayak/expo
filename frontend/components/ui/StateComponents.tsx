import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, WifiOff, ServerOff, RefreshCw } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

// ========================================
// LOADING STATES
// ========================================

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    message?: string;
}

export function LoadingSpinner({
    size = 'large',
    color = '#00D9A3',
    message
}: LoadingSpinnerProps) {
    return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size={size} color={color} />
            {message && <Text style={styles.loadingMessage}>{message}</Text>}
        </View>
    );
}

interface FullScreenLoadingProps {
    message?: string;
}

export function FullScreenLoading({ message = 'Loading...' }: FullScreenLoadingProps) {
    return (
        <View style={styles.fullScreen}>
            <LinearGradient
                colors={['#0A0A0F', '#0D1117', '#161B22']}
                style={StyleSheet.absoluteFill}
            />
            <ActivityIndicator size="large" color="#00D9A3" />
            <Text style={styles.fullScreenMessage}>{message}</Text>
        </View>
    );
}

// ========================================
// ERROR STATES
// ========================================

type ErrorType = 'network' | 'server' | 'generic' | 'empty';

interface ErrorStateProps {
    type?: ErrorType;
    title?: string;
    message?: string;
    onRetry?: () => void;
}

const ERROR_CONFIG = {
    network: {
        icon: WifiOff,
        title: 'No Connection',
        message: 'Please check your internet connection and try again.',
        color: '#FF6B35',
    },
    server: {
        icon: ServerOff,
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        color: '#EF4444',
    },
    generic: {
        icon: AlertCircle,
        title: 'Oops!',
        message: 'Something went wrong. Please try again.',
        color: '#F59E0B',
    },
    empty: {
        icon: AlertCircle,
        title: 'Nothing Here',
        message: 'No data to display.',
        color: '#8B949E',
    },
};

export function ErrorState({
    type = 'generic',
    title,
    message,
    onRetry
}: ErrorStateProps) {
    const config = ERROR_CONFIG[type];
    const Icon = config.icon;

    return (
        <View style={styles.errorContainer}>
            <View style={[styles.errorIconContainer, { backgroundColor: `${config.color}20` }]}>
                <Icon size={32} color={config.color} />
            </View>
            <Text style={styles.errorTitle}>{title || config.title}</Text>
            <Text style={styles.errorMessage}>{message || config.message}</Text>
            {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <RefreshCw size={16} color="#FFF" />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ========================================
// EMPTY STATES
// ========================================

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon,
    title,
    message,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <View style={styles.emptyContainer}>
            {icon && <View style={styles.emptyIconContainer}>{icon}</View>}
            <Text style={styles.emptyTitle}>{title}</Text>
            <Text style={styles.emptyMessage}>{message}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity style={styles.actionButton} onPress={onAction}>
                    <LinearGradient
                        colors={['#00D9A3', '#00B389']}
                        style={styles.actionButtonGradient}
                    >
                        <Text style={styles.actionButtonText}>{actionLabel}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingMessage: {
        marginTop: 12,
        fontSize: 14,
        color: '#8B949E',
    },
    fullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenMessage: {
        marginTop: 16,
        fontSize: 16,
        color: '#8B949E',
        fontWeight: '500',
    },
    // Error
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#8B949E',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#21262D',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#30363D',
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    // Empty
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyIconContainer: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#8B949E',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },
    actionButton: {
        marginTop: 24,
        borderRadius: 8,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
});
