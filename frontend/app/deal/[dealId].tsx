import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Share,
    Linking,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Share2, Navigation } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import { useAppTheme } from '@/store/themeStore';
import { dealsService, Deal, userService } from '@/services/api';

export default function DealDetailsScreen() {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const router = useRouter();
    const { dealId } = useLocalSearchParams<{ dealId: string }>();

    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [isClaimed, setIsClaimed] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [redemptionCode, setRedemptionCode] = useState<string | null>(null);
    const [togglingFavorite, setTogglingFavorite] = useState(false);

    useEffect(() => {
        loadDeal();
    }, [dealId]);

    const loadDeal = async () => {
        try {
            setLoading(true);

            // Load deal details
            const response = await dealsService.getDealById(dealId);
            if (response.data) {
                setDeal(response.data);
            }

            // Check if user has already claimed this deal
            const claimedResponse = await userService.getClaimedDeals({ skipGlobalAuthHandler: true });
            if (claimedResponse.data) {
                const claimedDeal = claimedResponse.data.find(
                    (claim: any) => claim.deal._id === dealId
                );
                if (claimedDeal) {
                    setIsClaimed(true);
                    setRedemptionCode(claimedDeal.redemptionCode);
                }
            }

            // Check if deal is favorited
            const favoritesResponse = await dealsService.getFavorites({ skipGlobalAuthHandler: true });
            if (favoritesResponse.data) {
                const isFav = favoritesResponse.data.some(deal => deal._id === dealId);
                setIsFavorited(isFav);
            }
        } catch (error) {
            console.error('Failed to load deal', error);
            Alert.alert('Error', 'Failed to load deal details');
        } finally {
            setLoading(false);
        }
    };

    const handleClaimDeal = async () => {
        try {
            setClaiming(true);
            const response = await dealsService.claimDeal(dealId);
            if (response.data) {
                setRedemptionCode(response.data.redemptionCode);
                setIsClaimed(true);
                Alert.alert(
                    'Success!',
                    `Deal claimed! You saved ₹${response.data.savings}`,
                    [{ text: 'OK' }]
                );
            } else if (response.error && response.error.includes('already claimed')) {
                // Deal was already claimed, reload to get the redemption code
                await loadDeal();
            } else if (response.error) {
                Alert.alert('Error', response.error);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to claim deal');
        } finally {
            setClaiming(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (togglingFavorite) return; // Prevent multiple clicks

        // Optimistic update
        const wasLiked = isFavorited;
        setIsFavorited(!isFavorited);

        setTogglingFavorite(true);
        try {
            const response = await dealsService.toggleFavorite(dealId);
            if (response.data) {
                setIsFavorited(response.data.isFavorited);
            } else if (response.error) {
                // Revert on error
                setIsFavorited(wasLiked);
                Alert.alert('Error', 'Failed to update favorite');
            }
        } catch (error) {
            // Revert on error
            setIsFavorited(wasLiked);
            Alert.alert('Error', 'Failed to update favorite');
        } finally {
            setTogglingFavorite(false);
        }
    };

    const handleShare = async () => {
        if (!deal) return;
        try {
            const result = await Share.share({
                message: `${deal.title} - ${deal.discountPercentage}% OFF! Save ₹${deal.originalPrice - deal.discountedPrice} at ${deal.merchantId?.name}. Check it out on Utopia!`,
                title: 'Check out this deal!',
                url: `https://utopia.app/deal/${deal._id}` // Example URL
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            console.log('Share error:', error);
            Alert.alert('Error', 'Failed to share deal');
        }
    };

    const handleGetDirections = () => {
        // Use merchant location if available, otherwise search by merchant name
        const merchantName = deal?.merchantId?.name || 'Merchant';
        const merchantLocation = (deal?.merchantId as any)?.location?.coordinates;

        let url: string;
        if (merchantLocation && merchantLocation.length === 2) {
            const [lng, lat] = merchantLocation;
            const destination = `${lat},${lng}`;
            url = Platform.select({
                ios: `maps://app?daddr=${destination}`,
                android: `google.navigation:q=${destination}`,
            }) || `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        } else {
            // Fallback: search by merchant name
            url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(merchantName)}`;
        }

        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open maps');
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!deal) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Deal not found</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleToggleFavorite} style={styles.iconButton}>
                        <Heart
                            size={24}
                            color={isFavorited ? theme.colors.primary : theme.colors.text}
                            fill={isFavorited ? theme.colors.primary : 'transparent'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                        <Share2 size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image */}
                <Image
                    source={{ uri: deal.images[0] || 'https://via.placeholder.com/400' }}
                    style={styles.image}
                />

                {/* Discount Badge */}
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{deal.discountPercentage}% OFF</Text>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.category}>{deal.category}</Text>
                    <Text style={styles.title}>{deal.title}</Text>
                    <Text style={styles.merchant}>{deal.merchantId?.name}</Text>

                    {/* Price */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>₹{deal.discountedPrice}</Text>
                        <Text style={styles.originalPrice}>₹{deal.originalPrice}</Text>
                        <Text style={styles.savings}>Save ₹{deal.originalPrice - deal.discountedPrice}</Text>
                    </View>

                    {/* Description */}
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{deal.description}</Text>

                    {/* Terms */}
                    {deal.termsAndConditions && deal.termsAndConditions.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                            {deal.termsAndConditions.map((term, index) => (
                                <Text key={index} style={styles.term}>
                                    • {term}
                                </Text>
                            ))}
                        </>
                    )}

                    {/* QR Code Section */}
                    {isClaimed && redemptionCode && (
                        <View style={styles.qrSection}>
                            <Text style={styles.sectionTitle}>Your QR Code</Text>
                            <Text style={styles.qrSubtitle}>Show this at the store to redeem</Text>
                            <View style={styles.qrContainer}>
                                <QRCode value={redemptionCode} size={200} />
                            </View>
                            <Text style={styles.redemptionCode}>{redemptionCode}</Text>
                            <Text style={styles.qrNote}>Status: Pending Redemption</Text>

                            {/* Directions Button */}
                            <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
                                <Navigation size={20} color="#8B5CF6" />
                                <Text style={styles.directionsText}>Get Directions</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Claim Button */}
            {!isClaimed && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.claimButton, claiming && styles.claimButtonDisabled]}
                        onPress={handleClaimDeal}
                        disabled={claiming}
                    >
                        {claiming ? (
                            <ActivityIndicator color={theme.colors.background} />
                        ) : (
                            <Text style={styles.claimButtonText}>Claim Deal</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const getStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        errorText: {
            fontSize: 18,
            color: theme.colors.text,
            marginBottom: 20,
        },
        backButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
        },
        backButtonText: {
            color: theme.colors.background,
            fontSize: 16,
            fontWeight: '600',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
        },
        iconButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerActions: {
            flexDirection: 'row',
            gap: 12,
        },
        image: {
            width: '100%',
            height: 300,
            backgroundColor: theme.colors.surfaceLight,
        },
        discountBadge: {
            position: 'absolute',
            top: 80,
            right: 20,
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
        },
        discountText: {
            color: theme.colors.background,
            fontSize: 16,
            fontWeight: '700',
        },
        content: {
            padding: 20,
        },
        category: {
            fontSize: 12,
            color: theme.colors.primary,
            fontWeight: '600',
            textTransform: 'uppercase',
            marginBottom: 8,
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: 8,
        },
        merchant: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginBottom: 20,
        },
        priceContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
            gap: 12,
        },
        price: {
            fontSize: 32,
            fontWeight: '700',
            color: theme.colors.primary,
        },
        originalPrice: {
            fontSize: 18,
            color: theme.colors.textTertiary,
            textDecorationLine: 'line-through',
        },
        savings: {
            fontSize: 14,
            color: theme.colors.success,
            fontWeight: '600',
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            marginTop: 20,
            marginBottom: 12,
        },
        description: {
            fontSize: 15,
            color: theme.colors.textSecondary,
            lineHeight: 22,
        },
        term: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 8,
            lineHeight: 20,
        },
        qrSection: {
            marginTop: 24,
            padding: 20,
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            alignItems: 'center',
        },
        qrSubtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 20,
        },
        qrContainer: {
            padding: 20,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            marginBottom: 16,
        },
        redemptionCode: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 8,
            letterSpacing: 2,
        },
        qrNote: {
            fontSize: 12,
            color: theme.colors.textTertiary,
        },
        footer: {
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: theme.colors.surfaceLight,
        },
        claimButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
        },
        claimButtonDisabled: {
            opacity: 0.6,
        },
        claimButtonText: {
            color: theme.colors.background,
            fontSize: 18,
            fontWeight: '700',
        },
        directionsButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 16,
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 12,
        },
        directionsText: {
            color: '#8B5CF6',
            fontSize: 14,
            fontWeight: '700',
        },
    });
