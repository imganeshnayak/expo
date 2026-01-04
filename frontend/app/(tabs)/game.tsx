import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    ActivityIndicator,
    Animated,
    Linking,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import QRCode from 'react-native-qrcode-svg';
import { useGameStore } from '@/store/gameStore';
import {
    MapPin,
    Gift,
    Target,
    Coins,
    Star,
    X,
    Check,
    Navigation,
    QrCode,
    Clock,
    Percent,
    Search,
    Store,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Demo deals/offers - These will be positioned RELATIVE to user's actual location
// In production, these come from merchant campaigns via API
const DEMO_OFFERS = [
    {
        id: 'd1', type: 'deal',
        name: 'Nearby Cafe',
        description: 'Coffee shop with student discounts',
        offer: '20% off on all beverages',
        discount: '20%',
        offsetLat: 0.002, offsetLng: 0.001, // Offset from user location
        emoji: '☕', color: '#00D9A3',
        coins: 50,
        needsQR: true,
        validTill: '31 Jan 2026',
        merchantId: 'cafe_001',
        category: 'cafe'
    },
    {
        id: 'd2', type: 'deal',
        name: 'Pizza Place',
        description: 'Best pizzas in town',
        offer: 'Buy 1 Get 1 Free',
        discount: 'BOGO',
        offsetLat: -0.001, offsetLng: 0.002,
        emoji: '🍕', color: '#00D9A3',
        coins: 60,
        needsQR: true,
        validTill: '15 Feb 2026',
        merchantId: 'pizza_002',
        category: 'restaurant'
    },
    {
        id: 'd3', type: 'deal',
        name: 'Ice Cream Shop',
        description: 'Premium ice cream parlor',
        offer: 'Free topping on any sundae',
        discount: 'FREE',
        offsetLat: 0.0015, offsetLng: -0.001,
        emoji: '🍨', color: '#00D9A3',
        coins: 30,
        needsQR: true,
        validTill: '20 Jan 2026',
        merchantId: 'icecream_003',
        category: 'dessert'
    },
    {
        id: 'd4', type: 'deal',
        name: 'Local Restaurant',
        description: 'Authentic local cuisine',
        offer: '₹100 off on ₹500+',
        discount: '₹100 OFF',
        offsetLat: -0.002, offsetLng: -0.0015,
        emoji: '🍛', color: '#00D9A3',
        coins: 80,
        needsQR: true,
        validTill: '28 Feb 2026',
        merchantId: 'resto_004',
        category: 'restaurant'
    },
    {
        id: 'd5', type: 'deal',
        name: 'Grocery Store',
        description: 'Daily essentials & more',
        offer: '10% off first purchase',
        discount: '10%',
        offsetLat: 0.001, offsetLng: 0.0025,
        emoji: '🛒', color: '#00D9A3',
        coins: 25,
        needsQR: true,
        validTill: '31 Jan 2026',
        merchantId: 'grocery_005',
        category: 'shopping'
    },
    {
        id: 'd6', type: 'deal',
        name: 'Gym & Fitness',
        description: 'Health and fitness center',
        offer: 'Free trial day pass',
        discount: 'FREE TRIAL',
        offsetLat: -0.0018, offsetLng: 0.001,
        emoji: '💪', color: '#00D9A3',
        coins: 40,
        needsQR: false, // No QR needed - just visit
        validTill: '10 Feb 2026',
        merchantId: 'gym_006',
        category: 'fitness'
    },

    // REWARDS - Collectibles around user
    {
        id: 'r1', type: 'reward',
        name: 'Mystery Box',
        description: 'Contains bonus rewards!',
        xp: 100,
        offsetLat: -0.0008, offsetLng: -0.0008,
        emoji: '🎁', color: '#FFD700',
        needsQR: false,
        category: 'reward'
    },
    {
        id: 'r2', type: 'reward',
        name: 'Coin Drop',
        description: '75 bonus coins!',
        xp: 25, coins: 75,
        offsetLat: 0.0012, offsetLng: -0.0018,
        emoji: '💰', color: '#FFD700',
        needsQR: false,
        category: 'reward'
    },
    {
        id: 'r3', type: 'reward',
        name: 'XP Boost',
        description: '2x XP for next 30 minutes',
        xp: 150,
        offsetLat: -0.0022, offsetLng: 0.002,
        emoji: '⚡', color: '#FFD700',
        needsQR: false,
        category: 'reward'
    },
];

// Search suggestions - common places to search
const SEARCH_SUGGESTIONS = ['Cafe', 'Restaurant', 'Pizza', 'Ice Cream', 'Shopping', 'Gym'];

// Dark map style
const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#6B7280' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#5B5B7B' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

type MarkerType = typeof DEMO_OFFERS[0] & { lat: number; lng: number };

export default function GameScreen() {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const { coins, xp, addCoins, addXP } = useGameStore();

    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [markers, setMarkers] = useState<MarkerType[]>([]);
    const [selectedItem, setSelectedItem] = useState<MarkerType | null>(null);
    const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
    const [showQR, setShowQR] = useState(false);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [lastReward, setLastReward] = useState<{ type: string; amount: number } | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMarkers, setFilteredMarkers] = useState<MarkerType[]>([]);

    const rewardScale = useRef(new Animated.Value(0)).current;

    // Get user's actual location and update markers relative to it
    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocationError('Location permission required. Please enable in settings.');
                    return;
                }

                // Get initial location
                let loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

                updateUserLocation(loc.coords.latitude, loc.coords.longitude);

                // Watch location for real-time updates
                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        distanceInterval: 10, // Update every 10 meters
                    },
                    (newLoc) => {
                        updateUserLocation(newLoc.coords.latitude, newLoc.coords.longitude);
                    }
                );
            } catch (error) {
                console.log('Location error:', error);
                setLocationError('Unable to get location. Please check GPS.');
            }
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    const updateUserLocation = (lat: number, lng: number) => {
        setUserLocation({ latitude: lat, longitude: lng });

        // Position demo markers RELATIVE to user's actual location
        const updatedMarkers: MarkerType[] = DEMO_OFFERS.map(offer => ({
            ...offer,
            lat: lat + (offer.offsetLat || 0),
            lng: lng + (offer.offsetLng || 0),
        }));

        setMarkers(updatedMarkers);
        setFilteredMarkers(updatedMarkers);
    };

    const centerOnUser = () => {
        if (userLocation && mapRef.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
            }, 500);
        }
    };

    const handleMarkerPress = (item: MarkerType) => {
        if (claimedIds.has(item.id)) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedItem(item);
        setShowQR(false);
        setShowSearch(false);
    };

    const handleClaim = () => {
        if (!selectedItem || claimedIds.has(selectedItem.id)) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Add rewards
        if (selectedItem.type === 'deal' && selectedItem.coins) {
            addCoins(selectedItem.coins);
            setLastReward({ type: 'coins', amount: selectedItem.coins });
        } else if (selectedItem.type === 'reward') {
            if (selectedItem.xp) addXP(selectedItem.xp);
            if (selectedItem.coins) addCoins(selectedItem.coins);
            setLastReward({ type: 'xp', amount: selectedItem.xp || 0 });
        }

        setClaimedIds(prev => new Set(prev).add(selectedItem.id));

        // Show reward animation
        setShowRewardModal(true);
        Animated.sequence([
            Animated.spring(rewardScale, { toValue: 1.2, useNativeDriver: true }),
            Animated.spring(rewardScale, { toValue: 1, useNativeDriver: true }),
        ]).start();

        setTimeout(() => {
            setShowRewardModal(false);
            setSelectedItem(null);
        }, 1500);
    };

    const handleShowQR = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowQR(true);
    };

    const handleGetDirections = () => {
        if (!selectedItem) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const destination = `${selectedItem.lat},${selectedItem.lng}`;
        const url = Platform.select({
            ios: `maps://app?daddr=${destination}`,
            android: `google.navigation:q=${destination}`,
        });

        if (url) {
            Linking.openURL(url).catch(() => {
                Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
            });
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredMarkers(markers);
        } else {
            const filtered = markers.filter(m =>
                m.name.toLowerCase().includes(query.toLowerCase()) ||
                m.description?.toLowerCase().includes(query.toLowerCase()) ||
                m.category?.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredMarkers(filtered);
        }
    };

    const handleSearchResultPress = (item: MarkerType) => {
        setShowSearch(false);
        setSearchQuery('');
        handleMarkerPress(item);

        // Animate to the selected marker
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: item.lat,
                longitude: item.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }, 500);
        }
    };

    // Loading state
    if (!userLocation) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <LinearGradient colors={['#0D0D0D', '#1A1A2E', '#16213E']} style={StyleSheet.absoluteFill} />
                {locationError ? (
                    <>
                        <MapPin size={48} color="#EF4444" />
                        <Text style={styles.errorText}>{locationError}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => Location.requestForegroundPermissionsAsync()}
                        >
                            <Text style={styles.retryText}>Enable Location</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                        <Text style={styles.loadingText}>Detecting your location...</Text>
                    </>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                }}
                showsUserLocation
                showsMyLocationButton={false}
                customMapStyle={darkMapStyle}
                showsCompass={false}
                followsUserLocation
            >
                {/* User range circle */}
                <Circle
                    center={userLocation}
                    radius={300}
                    fillColor="rgba(139, 92, 246, 0.1)"
                    strokeColor="rgba(139, 92, 246, 0.4)"
                    strokeWidth={2}
                />

                {/* Markers */}
                {filteredMarkers.map(item => (
                    !claimedIds.has(item.id) && (
                        <Marker
                            key={item.id}
                            coordinate={{ latitude: item.lat, longitude: item.lng }}
                            onPress={() => handleMarkerPress(item)}
                        >
                            <View style={[styles.marker, { backgroundColor: item.color }]}>
                                <Text style={styles.markerEmoji}>{item.emoji}</Text>
                            </View>
                        </Marker>
                    )
                ))}
            </MapView>

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View>
                    <Text style={styles.headerTitle}>🗺️ EXPLORE</Text>
                    <Text style={styles.headerSubtitle}>Deals around you</Text>
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statBadge}>
                        <Coins size={14} color="#FFD700" />
                        <Text style={styles.statText}>{coins}</Text>
                    </View>
                    <View style={styles.statBadge}>
                        <Star size={14} color="#8B5CF6" />
                        <Text style={styles.statText}>{xp} XP</Text>
                    </View>
                </View>
            </View>

            {/* Search Button */}
            <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearch(!showSearch)}
            >
                <Search size={22} color="#FFF" />
            </TouchableOpacity>

            {/* Center Button */}
            <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
                <Target size={22} color="#FFF" />
            </TouchableOpacity>

            {/* Stats Card */}
            <View style={styles.statsCard}>
                <View style={styles.statsCardRow}>
                    <View style={styles.statsCardItem}>
                        <View style={[styles.statsCardDot, { backgroundColor: '#00D9A3' }]} />
                        <Text style={styles.statsCardText}>
                            {markers.filter(m => m.type === 'deal' && !claimedIds.has(m.id)).length} Deals
                        </Text>
                    </View>
                    <View style={styles.statsCardItem}>
                        <View style={[styles.statsCardDot, { backgroundColor: '#FFD700' }]} />
                        <Text style={styles.statsCardText}>
                            {markers.filter(m => m.type === 'reward' && !claimedIds.has(m.id)).length} Rewards
                        </Text>
                    </View>
                </View>
            </View>

            {/* Search Panel */}
            {showSearch && (
                <View style={styles.searchPanel}>
                    <View style={styles.searchInputContainer}>
                        <Search size={18} color="rgba(255,255,255,0.5)" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for deals, shops..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <X size={18} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Quick filters */}
                    <View style={styles.quickFilters}>
                        {SEARCH_SUGGESTIONS.map(suggestion => (
                            <TouchableOpacity
                                key={suggestion}
                                style={styles.filterChip}
                                onPress={() => handleSearch(suggestion)}
                            >
                                <Text style={styles.filterText}>{suggestion}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Search Results */}
                    {searchQuery.length > 0 && (
                        <FlatList
                            data={filteredMarkers.filter(m => !claimedIds.has(m.id))}
                            keyExtractor={item => item.id}
                            style={styles.searchResults}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.searchResultItem}
                                    onPress={() => handleSearchResultPress(item)}
                                >
                                    <View style={[styles.resultIcon, { backgroundColor: item.color }]}>
                                        <Text>{item.emoji}</Text>
                                    </View>
                                    <View style={styles.resultInfo}>
                                        <Text style={styles.resultName}>{item.name}</Text>
                                        <Text style={styles.resultDesc}>{item.offer || item.description}</Text>
                                    </View>
                                    <Navigation size={16} color="#8B5CF6" />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.noResults}>No deals found for "{searchQuery}"</Text>
                            }
                        />
                    )}
                </View>
            )}

            {/* Selected Item Card */}
            {selectedItem && !showQR && !showSearch && (
                <View style={styles.itemCard}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
                        <X size={18} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.itemHeader}>
                        <View style={[styles.itemIcon, { backgroundColor: selectedItem.color }]}>
                            <Text style={styles.itemEmoji}>{selectedItem.emoji}</Text>
                        </View>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{selectedItem.name}</Text>
                            <Text style={styles.itemDesc}>{selectedItem.description}</Text>
                            {selectedItem.offer && (
                                <View style={styles.offerBadge}>
                                    <Percent size={12} color="#00D9A3" />
                                    <Text style={styles.offerText}>{selectedItem.offer}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {selectedItem.validTill && (
                        <View style={styles.validRow}>
                            <Clock size={14} color="rgba(255,255,255,0.5)" />
                            <Text style={styles.validText}>Valid till {selectedItem.validTill}</Text>
                        </View>
                    )}

                    <View style={styles.buttonRow}>
                        {selectedItem.type === 'deal' && (
                            <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
                                <Navigation size={18} color="#8B5CF6" />
                                <Text style={styles.directionsText}>Directions</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.claimButton, selectedItem.type !== 'deal' && { flex: 1 }]}
                            onPress={selectedItem.needsQR ? handleShowQR : handleClaim}
                        >
                            <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.claimGradient}>
                                {selectedItem.needsQR ? (
                                    <>
                                        <QrCode size={18} color="#FFF" />
                                        <Text style={styles.claimText}>Get QR Code</Text>
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} color="#FFF" />
                                        <Text style={styles.claimText}>
                                            {selectedItem.type === 'deal' ? `Claim (+${selectedItem.coins}💰)` :
                                                `Collect (+${selectedItem.xp}XP)`}
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* QR Code Modal */}
            {selectedItem && showQR && (
                <View style={styles.qrCard}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowQR(false)}>
                        <X size={18} color="#FFF" />
                    </TouchableOpacity>

                    <Text style={styles.qrTitle}>Show this QR at</Text>
                    <Text style={styles.qrMerchant}>{selectedItem.name}</Text>

                    <View style={styles.qrContainer}>
                        <QRCode
                            value={`UTOPIA:${selectedItem.merchantId || selectedItem.id}:${Date.now()}`}
                            size={180}
                            backgroundColor="#FFF"
                            color="#1a1a2e"
                        />
                    </View>

                    <Text style={styles.qrOffer}>{selectedItem.offer}</Text>
                    <Text style={styles.qrValid}>Valid till {selectedItem.validTill}</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
                            <Navigation size={18} color="#8B5CF6" />
                            <Text style={styles.directionsText}>Get Directions</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.claimButton} onPress={handleClaim}>
                            <LinearGradient colors={['#00D9A3', '#00B894']} style={styles.claimGradient}>
                                <Check size={18} color="#FFF" />
                                <Text style={styles.claimText}>Mark Claimed</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Reward Animation Modal */}
            {showRewardModal && lastReward && (
                <View style={styles.rewardOverlay}>
                    <Animated.View style={[styles.rewardModal, { transform: [{ scale: rewardScale }] }]}>
                        <Text style={styles.rewardEmoji}>{lastReward.type === 'coins' ? '💰' : '⭐'}</Text>
                        <Text style={styles.rewardText}>+{lastReward.amount} {lastReward.type === 'coins' ? 'Coins' : 'XP'}</Text>
                    </Animated.View>
                </View>
            )}

            {/* Bottom Legend */}
            <View style={[styles.legend, { paddingBottom: insets.bottom + 100 }]}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#00D9A3' }]} />
                    <Text style={styles.legendText}>Deals</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
                    <Text style={styles.legendText}>Rewards</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0D0D' },
    loadingContainer: { justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
    errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
    retryButton: { marginTop: 16, backgroundColor: '#8B5CF6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    retryText: { color: '#FFF', fontWeight: '700' },
    map: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 12, backgroundColor: 'rgba(13,13,13,0.95)',
    },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
    headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: 10 },
    statBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
    },
    statText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
    searchButton: {
        position: 'absolute', top: 130, right: 80,
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#6366F1',
        justifyContent: 'center', alignItems: 'center', elevation: 6,
    },
    centerButton: {
        position: 'absolute', top: 130, right: 20,
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#8B5CF6',
        justifyContent: 'center', alignItems: 'center', elevation: 6,
    },
    statsCard: {
        position: 'absolute', top: 130, left: 20,
        backgroundColor: 'rgba(26,26,46,0.95)', borderRadius: 14, padding: 12,
    },
    statsCardRow: { gap: 6 },
    statsCardItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statsCardDot: { width: 10, height: 10, borderRadius: 5 },
    statsCardText: { fontSize: 12, color: '#FFF', fontWeight: '600' },
    searchPanel: {
        position: 'absolute', top: 100, left: 16, right: 16,
        backgroundColor: 'rgba(26,26,46,0.98)', borderRadius: 20, padding: 16,
        maxHeight: SCREEN_HEIGHT * 0.5,
    },
    searchInputContainer: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    },
    searchInput: { flex: 1, color: '#FFF', fontSize: 15 },
    quickFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    filterChip: {
        backgroundColor: 'rgba(139,92,246,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    },
    filterText: { color: '#8B5CF6', fontSize: 12, fontWeight: '600' },
    searchResults: { marginTop: 12, maxHeight: 200 },
    searchResultItem: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 8,
    },
    resultIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    resultInfo: { flex: 1, marginLeft: 12 },
    resultName: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    resultDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
    noResults: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', paddingVertical: 20 },
    marker: {
        width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
        borderWidth: 3, borderColor: '#FFF', elevation: 6,
    },
    markerEmoji: { fontSize: 22 },
    itemCard: {
        position: 'absolute', bottom: 180, left: 16, right: 16,
        backgroundColor: 'rgba(26,26,46,0.98)', borderRadius: 24, padding: 20,
        borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)',
    },
    qrCard: {
        position: 'absolute', bottom: 120, left: 16, right: 16,
        backgroundColor: 'rgba(26,26,46,0.98)', borderRadius: 24, padding: 24,
        alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)',
    },
    closeButton: {
        position: 'absolute', top: 12, right: 12, width: 32, height: 32,
        borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center', zIndex: 10,
    },
    itemHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    itemIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    itemEmoji: { fontSize: 28 },
    itemInfo: { flex: 1, marginLeft: 14 },
    itemName: { fontSize: 18, fontWeight: '800', color: '#FFF' },
    itemDesc: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    offerBadge: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 8, gap: 4,
        backgroundColor: 'rgba(0,217,163,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    offerText: { fontSize: 12, fontWeight: '700', color: '#00D9A3' },
    validRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    validText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
    buttonRow: { flexDirection: 'row', gap: 10 },
    directionsButton: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14,
    },
    directionsText: { fontSize: 13, fontWeight: '700', color: '#8B5CF6' },
    claimButton: { flex: 1, borderRadius: 14, overflow: 'hidden' },
    claimGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    claimText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
    qrTitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 16 },
    qrMerchant: { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 4 },
    qrContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginVertical: 20 },
    qrOffer: { fontSize: 16, fontWeight: '700', color: '#00D9A3' },
    qrValid: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 16 },
    rewardOverlay: {
        ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    rewardModal: { backgroundColor: 'rgba(139,92,246,0.95)', borderRadius: 24, padding: 40, alignItems: 'center' },
    rewardEmoji: { fontSize: 64 },
    rewardText: { fontSize: 32, fontWeight: '900', color: '#FFF', marginTop: 12 },
    legend: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'center', gap: 24, paddingTop: 12,
        backgroundColor: 'rgba(13,13,13,0.95)',
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
});
