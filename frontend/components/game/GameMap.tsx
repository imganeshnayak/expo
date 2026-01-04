import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { spawnSyncService } from '../../services/SpawnSyncService';
import { MAP_CONFIG } from '../../constants/mapConfig';
import { Spawn } from '../../types/game';
import { MapPin, AlertTriangle } from 'lucide-react-native';

// Check if we're in Expo Go (native MapLibre won't work)
const isExpoGo = (): boolean => {
    try {
        // In Expo Go, Constants.executionEnvironment is 'storeClient'
        const Constants = require('expo-constants').default;
        return Constants.executionEnvironment === 'storeClient';
    } catch {
        return false;
    }
};

// Try to import MapLibre only if not in Expo Go
let MapLibreGL: any = null;
if (!isExpoGo()) {
    try {
        MapLibreGL = require('@maplibre/maplibre-react-native').default;
        MapLibreGL.setAccessToken(null);
    } catch (e) {
        console.log('[GameMap] MapLibre not available:', e);
    }
}

interface GameMapProps {
    onSpawnPress: (spawn: Spawn) => void;
}

// Fallback component for Expo Go
function ExpoGoFallbackMap({ onSpawnPress }: GameMapProps) {
    return (
        <View style={styles.fallbackContainer}>
            <LinearGradient
                colors={['#1A1A2E', '#16213E', '#0F3460']}
                style={styles.fallbackGradient}
            >
                <View style={styles.fallbackContent}>
                    <AlertTriangle size={48} color="#FFB800" />
                    <Text style={styles.fallbackTitle}>Map Unavailable</Text>
                    <Text style={styles.fallbackText}>
                        MapLibre requires a development build.{'\n\n'}
                        In Expo Go, use the Game Hub to{'\n'}
                        access Collection and Arena features.
                    </Text>
                    <View style={styles.infoBox}>
                        <MapPin size={20} color="#00D9A3" />
                        <Text style={styles.infoText}>
                            Build with EAS to enable full map access
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

// Full map component (only used in dev builds)
function FullGameMap({ onSpawnPress }: GameMapProps) {
    const [spawns, setSpawns] = useState<any[]>([]);
    const [userLocation, setUserLocation] = useState<number[] | null>(null);
    const cameraRef = useRef<any>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const syncLoop = async () => {
            if (!userLocation) return;
            const visible = await spawnSyncService.getVisibleSpawns(userLocation[1], userLocation[0]);
            setSpawns(visible);
        };

        const interval = setInterval(syncLoop, 5000);
        if (userLocation) syncLoop();

        return () => clearInterval(interval);
    }, [userLocation]);

    const fogSource = useMemo(() => {
        if (!userLocation) return null;

        const world = [[-180, 90], [180, 90], [180, -90], [-180, -90], [-180, 90]];
        const radius = 0.0045;
        const steps = 32;
        const hole = [];
        for (let i = 0; i < steps; i++) {
            const theta = (i / steps) * (2 * Math.PI);
            const lngOffset = (radius * Math.cos(theta)) / Math.cos(userLocation[1] * Math.PI / 180);
            const latOffset = radius * Math.sin(theta);
            hole.push([userLocation[0] + lngOffset, userLocation[1] + latOffset]);
        }
        hole.push(hole[0]);

        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [world, hole]
            }
        };
    }, [userLocation]);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const spawnSource = useMemo(() => {
        const now = Date.now();
        return {
            type: 'FeatureCollection',
            features: spawns.map(spawn => {
                const despawnAt = spawn.despawnAt || (now + 90000);
                const remainingMs = Math.max(0, despawnAt - now);
                const remainingSec = remainingMs / 1000;

                const maxRadius = 25;
                const radius = (remainingSec / 90) * maxRadius;
                const isUrgent = remainingSec < 15;

                return {
                    type: 'Feature',
                    id: spawn.id,
                    geometry: {
                        type: 'Point',
                        coordinates: [spawn.location.longitude, spawn.location.latitude]
                    },
                    properties: {
                        id: spawn.id,
                        rarity: spawn.archetype.rarity,
                        radius: radius,
                        color: isUrgent ? '#FF0000' : '#FFFFFF',
                        opacity: isUrgent ? 0.9 : 0.6
                    }
                };
            })
        };
    }, [spawns, tick]);

    const handlePress = (e: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const spawnId = feature.properties.id;
            const match = spawns.find(s => s.id === spawnId);
            if (match) onSpawnPress(match);
        }
    };

    if (!MapLibreGL) {
        return <ExpoGoFallbackMap onSpawnPress={onSpawnPress} />;
    }

    return (
        <View style={styles.container}>
            <MapLibreGL.MapView
                style={styles.map}
                {...({ styleJSON: JSON.stringify(MAP_CONFIG.OSM_RASTER_STYLE) } as any)}
                logoEnabled={false}
                attributionEnabled={true}
                attributionPosition={{ bottom: 8, right: 8 }}
                rotateEnabled={MAP_CONFIG.ROTATE_ENABLED}
                pitchEnabled={MAP_CONFIG.PITCH_ENABLED}
            >
                <MapLibreGL.Camera
                    ref={cameraRef}
                    defaultSettings={{
                        centerCoordinate: [77.5946, 12.9716],
                        zoomLevel: MAP_CONFIG.DEFAULT_ZOOM
                    }}
                    followUserLocation={true}
                    followUserMode={MapLibreGL.UserTrackingMode.Follow}
                />

                <MapLibreGL.UserLocation
                    visible={true}
                    showsUserHeadingIndicator={true}
                    onUpdate={(loc: any) => {
                        if (loc?.coords) setUserLocation([loc.coords.longitude, loc.coords.latitude]);
                    }}
                />

                <MapLibreGL.ShapeSource id="spawns" shape={spawnSource as any} onPress={handlePress}>
                    <MapLibreGL.CircleLayer
                        id="spawnRing"
                        style={{
                            circleRadius: ['get', 'radius'],
                            circleColor: 'transparent',
                            circleStrokeWidth: 2,
                            circleStrokeColor: ['get', 'color'],
                            circleOpacity: ['get', 'opacity']
                        }}
                    />
                    <MapLibreGL.CircleLayer
                        id="spawnGlow"
                        style={{
                            circleRadius: 18,
                            circleColor: [
                                'match',
                                ['get', 'rarity'],
                                'Common', 'rgba(255,255,255,0.05)',
                                'Rare', 'rgba(33, 150, 243, 0.3)',
                                'Epic', 'rgba(156, 39, 176, 0.4)',
                                'Mythic', 'rgba(244, 67, 54, 0.5)',
                                'Legendary', 'rgba(255, 215, 0, 0.6)',
                                'transparent'
                            ],
                            circleBlur: 0.8
                        }}
                    />
                    <MapLibreGL.CircleLayer
                        id="spawnCore"
                        style={{
                            circleRadius: 6,
                            circleColor: '#FFFFFF',
                            circleStrokeWidth: 1,
                            circleStrokeColor: '#000000'
                        }}
                    />
                </MapLibreGL.ShapeSource>

                {fogSource && (
                    <MapLibreGL.ShapeSource id="fog" shape={fogSource as any}>
                        <MapLibreGL.FillLayer
                            id="fogFill"
                            style={{
                                fillColor: '#000000',
                                fillOpacity: 0.6
                            }}
                        />
                    </MapLibreGL.ShapeSource>
                )}
            </MapLibreGL.MapView>
        </View>
    );
}

export default function GameMap(props: GameMapProps) {
    // Always use fallback in Expo Go
    if (isExpoGo() || !MapLibreGL) {
        return <ExpoGoFallbackMap {...props} />;
    }
    return <FullGameMap {...props} />;
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    fallbackContainer: {
        flex: 1,
    },
    fallbackGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackContent: {
        alignItems: 'center',
        padding: 40,
    },
    fallbackTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        marginTop: 20,
        marginBottom: 12,
    },
    fallbackText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(0,217,163,0.15)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,217,163,0.3)',
    },
    infoText: {
        color: '#00D9A3',
        fontSize: 13,
        fontWeight: '600',
    },
});
