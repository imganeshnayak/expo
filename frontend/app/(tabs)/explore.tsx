import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import {
    MapPin,
    Gamepad2,
    Users,
    Compass,
    Zap,
    Globe,
    Swords,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Nearby battle zones
const BATTLE_ZONES = [
    { id: '1', name: 'Central Arena', distance: '50m', players: 5, active: true },
    { id: '2', name: 'East Battle Pit', distance: '120m', players: 3, active: true },
    { id: '3', name: 'West Warzone', distance: '200m', players: 8, active: false },
];

export default function ExploreScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Location permission needed');
                return;
            }
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
        })();
    }, []);

    const handlePlayOops = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        router.push('/arena/battle');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={['#0D0D0D', '#1A1A2E', '#16213E']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Globe size={32} color="#8B5CF6" />
                    <Text style={styles.headerTitle}>EXPLORE</Text>
                    <Text style={styles.headerSubtitle}>Find battles near you</Text>
                </View>

                {/* Location Status */}
                <View style={styles.locationCard}>
                    <View style={styles.locationIcon}>
                        <MapPin size={20} color="#00D9A3" />
                    </View>
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationTitle}>Your Location</Text>
                        <Text style={styles.locationText}>
                            {location
                                ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
                                : errorMsg || 'Detecting...'}
                        </Text>
                    </View>
                    <View style={styles.onlineBadge}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>LIVE</Text>
                    </View>
                </View>

                {/* Play Oops - Main CTA */}
                <TouchableOpacity style={styles.playButton} onPress={handlePlayOops}>
                    <LinearGradient
                        colors={['#8B5CF6', '#6366F1', '#4F46E5']}
                        style={styles.playButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Gamepad2 size={36} color="#FFF" />
                        <View style={styles.playButtonText}>
                            <Text style={styles.playTitle}>PLAY OOPS</Text>
                            <Text style={styles.playSubtitle}>Jump into the arena!</Text>
                        </View>
                        <Zap size={24} color="#FFD700" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Users size={20} color="#8B5CF6" />
                        <Text style={styles.statValue}>16</Text>
                        <Text style={styles.statLabel}>Online</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Swords size={20} color="#00D9A3" />
                        <Text style={styles.statValue}>3</Text>
                        <Text style={styles.statLabel}>Zones</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Zap size={20} color="#FFD700" />
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>Battles</Text>
                    </View>
                </View>

                {/* Battle Zones */}
                <Text style={styles.sectionTitle}>🏟️ NEARBY BATTLE ZONES</Text>

                {BATTLE_ZONES.map(zone => (
                    <TouchableOpacity
                        key={zone.id}
                        style={styles.zoneCard}
                        onPress={handlePlayOops}
                    >
                        <View style={[styles.zoneStatus, { backgroundColor: zone.active ? '#00D9A3' : '#888' }]} />
                        <View style={styles.zoneInfo}>
                            <Text style={styles.zoneName}>{zone.name}</Text>
                            <Text style={styles.zoneDistance}>{zone.distance} away</Text>
                        </View>
                        <View style={styles.zonePlayers}>
                            <Users size={14} color="#8B949E" />
                            <Text style={styles.zonePlayersText}>{zone.players}</Text>
                        </View>
                        <Gamepad2 size={20} color="#8B5CF6" />
                    </TouchableOpacity>
                ))}

                {/* Spacer for tab bar */}
                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        marginTop: 12,
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    locationIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0,217,163,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationInfo: {
        flex: 1,
        marginLeft: 12,
    },
    locationTitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    locationText: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '600',
        marginTop: 2,
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,217,163,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00D9A3',
        marginRight: 6,
    },
    onlineText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#00D9A3',
    },
    playButton: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 8,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    playButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 24,
        paddingHorizontal: 24,
    },
    playButtonText: {
        flex: 1,
    },
    playTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 2,
    },
    playSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingVertical: 16,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1,
        marginBottom: 16,
    },
    zoneCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    zoneStatus: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    zoneInfo: {
        flex: 1,
    },
    zoneName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
    },
    zoneDistance: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    zonePlayers: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginRight: 16,
    },
    zonePlayersText: {
        fontSize: 12,
        color: '#8B949E',
    },
});
