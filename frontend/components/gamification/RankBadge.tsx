import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield } from 'lucide-react-native';

interface RankBadgeProps {
    rank: string; // e.g. "Silver"
    tier: number;
    size?: 'sm' | 'md' | 'lg';
}

export const RankBadge = ({ rank, tier, size = 'md' }: RankBadgeProps) => {
    const getColors = () => {
        switch (rank.toLowerCase()) {
            case 'bronze': return ['#CD7F32', '#8B4513'];
            case 'silver': return ['#E0E0E0', '#A9A9A9'];
            case 'gold': return ['#FFD700', '#FFA500'];
            case 'platinum': return ['#E5E4E2', '#708090'];
            case 'diamond': return ['#B9F2FF', '#00BFFF'];
            case 'legendary': return ['#FF00CC', '#333399'];
            default: return ['#CD7F32', '#8B4513'];
        }
    };

    const dimensions = {
        sm: 32,
        md: 48,
        lg: 80,
    };

    const iconSize = {
        sm: 16,
        md: 24,
        lg: 40,
    };

    const dim = dimensions[size];

    return (
        <View style={{ width: dim, height: dim, position: 'relative' }}>
            <LinearGradient
                colors={getColors() as any}
                style={[styles.badge, { width: dim, height: dim, borderRadius: dim / 3 }]}
            >
                <Shield color="#FFF" size={iconSize[size]} fill="#FFF" />
            </LinearGradient>
            <View style={[styles.tier, {
                width: dim / 2.5,
                height: dim / 2.5,
                borderRadius: dim / 5,
                bottom: -dim / 10,
                right: -dim / 10
            }]}>
                <Text style={{ fontSize: dim / 4, fontWeight: 'bold' }}>{tier}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    tier: {
        position: 'absolute',
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F0F0F0',
    }
});
