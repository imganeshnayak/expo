import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '@/store/themeStore';
import { dealsService, Deal } from '@/services/api';

const { width } = Dimensions.get('window');

export default function CategoryDealsScreen() {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const router = useRouter();
    const { category } = useLocalSearchParams<{ category: string }>();
    const [deals, setDeals] = React.useState<Deal[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadCategoryDeals();
    }, [category]);

    const loadCategoryDeals = async () => {
        try {
            setLoading(true);
            const response = await dealsService.getDeals();
            if (response.data) {
                let filtered = response.data;
                if (category && category !== 'all' && category !== 'coupon-discovery') {
                    filtered = response.data.filter(deal => deal.category === category);
                }
                setDeals(filtered);
            }
        } catch (error) {
            console.error('Failed to load category deals', error);
        } finally {
            setLoading(false);
        }
    };

    const DealCard = ({ deal }: { deal: Deal }) => (
        <TouchableOpacity
            style={styles.dealCard}
            onPress={() => router.push(`/deal/${deal._id}` as any)}
        >
            <Image
                source={{ uri: deal.images?.[0] || 'https://via.placeholder.com/200' }}
                style={styles.dealImage}
            />
            <View style={styles.dealContent}>
                <Text style={styles.dealTitle} numberOfLines={2}>
                    {deal.title}
                </Text>
                <Text style={styles.dealBusiness}>
                    {deal.merchantId?.name || 'Merchant'}
                </Text>
                <View style={styles.dealFooter}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.dealPrice}>₹{deal.discountedPrice}</Text>
                        {deal.originalPrice > deal.discountedPrice && (
                            <Text style={styles.dealOldPrice}>₹{deal.originalPrice}</Text>
                        )}
                    </View>

                    {deal.discountPercentage > 0 && (
                        <View style={styles.dealBadge}>
                            <Text style={styles.dealBadgeText}>
                                {deal.discountPercentage}% OFF
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>{category}</Text>
                    <Text style={styles.subtitle}>{deals.length} deals available</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.dealsContainer}>
                    {loading ? (
                        <Text style={styles.loadingText}>Loading deals...</Text>
                    ) : deals.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No deals found in this category
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.backToCategories}
                            >
                                <Text style={styles.backToCategoriesText}>
                                    Back to Categories
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.dealsGrid}>
                            {deals.map(deal => (
                                <DealCard key={deal._id} deal={deal} />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        marginRight: 16,
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    dealsContainer: {
        padding: 20,
    },
    dealsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    dealCard: {
        width: (width - 52) / 2,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    dealImage: {
        width: '100%',
        height: 140,
        backgroundColor: theme.colors.border,
    },
    dealContent: {
        padding: 12,
    },
    dealTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
        marginBottom: 6,
        minHeight: 36,
    },
    dealBusiness: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    dealFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dealPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    dealOldPrice: {
        fontSize: 12,
        color: theme.colors.textTertiary,
        textDecorationLine: 'line-through',
    },
    dealBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    dealBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.background,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        paddingVertical: 40,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    backToCategories: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backToCategoriesText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.background,
    },
});
