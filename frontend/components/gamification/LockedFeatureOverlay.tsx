import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Lock } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import { FeatureId } from '../../constants/gamification';

interface LockedFeatureOverlayProps {
    featureId: FeatureId;
    minRank: string;
    children: React.ReactNode;
}

export const LockedFeatureOverlay = ({ featureId, minRank, children }: LockedFeatureOverlayProps) => {
    const { gamification } = useUserStore();
    const router = useRouter();
    const isUnlocked = gamification.unlockedFeatures.includes(featureId);

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <View style={styles.container}>
            <View style={[styles.content, { opacity: 0.3 }]}>
                {children}
            </View>
            <View style={styles.overlay}>
                <View style={styles.lockIconContainer}>
                    <Lock color="#FFF" size={24} />
                </View>
                <Text style={styles.title}>Locked</Text>
                <Text style={styles.subtitle}>Unlock at {minRank}</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/(tabs)/missions')}
                >
                    <Text style={styles.buttonText}>Earn XP to Unlock</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    content: {
        pointerEvents: 'none', // Disable interaction with underlying content
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)', // Subtle overlay
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    lockIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.textSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 16,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
