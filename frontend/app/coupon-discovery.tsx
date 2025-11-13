import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Search, Sparkles, TrendingUp, Clock, Copy, Share2,
  Check, Star, Zap, Gift, Tag, Heart, ChevronRight, Filter, Plus
} from 'lucide-react-native';
import {
  useCouponEngineStore,
  getDiscountTypeLabel,
  getSourceLabel,
  getTagIcon,
  formatExpiryDate,
  type AggregatedCoupon,
  type HiddenDeal
} from '../store/couponEngineStore';

export default function CouponDiscoveryScreen() {
  const router = useRouter();
  const {
    coupons,
    savedCoupons,
    getPersonalizedRecommendations,
    getTrendingDeals,
    getExpiringCoupons,
    saveCoupon,
    unsaveCoupon,
    getDaysUntilExpiry,
    formatSavings,
  } = useCouponEngineStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'recommended' | 'trending' | 'expiring'>('recommended');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const recommendations = getPersonalizedRecommendations();
  const trendingDeals = getTrendingDeals();
  const expiringCoupons = getExpiringCoupons(7);

  const filteredCoupons = coupons.filter(c => {
    if (!c.isActive) return false;
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      c.merchantName.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.categories.some(cat => cat.toLowerCase().includes(query))
    );
  });

  const displayCoupons = selectedTab === 'recommended'
    ? recommendations.map(r => r.coupon)
    : selectedTab === 'trending'
    ? trendingDeals.map(d => d.coupon)
    : selectedTab === 'expiring'
    ? expiringCoupons
    : filteredCoupons;

  const handleCopyCode = (code: string) => {
    // In real app, use Clipboard API
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareCoupon = async (coupon: AggregatedCoupon) => {
    try {
      await Share.share({
        message: `🎁 ${coupon.description}\nCode: ${coupon.code}\nUse on ${coupon.merchantName}\nFound on UMA!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleSave = (couponId: string) => {
    if (savedCoupons.includes(couponId)) {
      unsaveCoupon(couponId);
    } else {
      saveCoupon(couponId);
    }
  };

  const renderCouponCard = (coupon: AggregatedCoupon, showReason?: string) => {
    const isSaved = savedCoupons.includes(coupon.id);
    const daysLeft = getDaysUntilExpiry(coupon);
    const isExpiringSoon = daysLeft <= 3;

    return (
      <TouchableOpacity
        key={coupon.id}
        style={[styles.couponCard, isExpiringSoon && styles.couponCardExpiring]}
        activeOpacity={0.9}>
        
        {/* Header */}
        <View style={styles.couponHeader}>
          <View style={styles.couponHeaderLeft}>
            <Text style={styles.merchantName}>{coupon.merchantName}</Text>
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceBadgeText}>{getSourceLabel(coupon.source)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleToggleSave(coupon.id)}>
            <Heart
              size={20}
              color={isSaved ? '#ef4444' : '#6b7280'}
              fill={isSaved ? '#ef4444' : 'none'}
            />
          </TouchableOpacity>
        </View>

        {/* Tags */}
        {coupon.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {coupon.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagIcon}>{getTagIcon(tag)}</Text>
                <Text style={styles.tagText}>{tag.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        <Text style={styles.couponDescription}>{coupon.description}</Text>

        {/* Discount Info */}
        <View style={styles.discountRow}>
          <View style={styles.discountBadge}>
            <Gift size={16} color="#10b981" />
            <Text style={styles.discountText}>
              {coupon.discountType === 'percentage' && `${coupon.discountValue}% OFF`}
              {coupon.discountType === 'fixed' && `₹${coupon.discountValue} OFF`}
              {coupon.discountType === 'bogo' && 'BOGO'}
              {coupon.discountType === 'free_item' && 'FREE ITEM'}
            </Text>
          </View>
          {coupon.minimumOrderValue && (
            <Text style={styles.minOrder}>Min. ₹{coupon.minimumOrderValue}</Text>
          )}
        </View>

        {/* Reason (for recommended) */}
        {showReason && (
          <View style={styles.reasonBadge}>
            <Sparkles size={14} color="#8b5cf6" />
            <Text style={styles.reasonText}>{showReason}</Text>
          </View>
        )}

        {/* Code Section */}
        <View style={styles.codeSection}>
          <View style={styles.codeBox}>
            <Tag size={16} color="#3b82f6" />
            <Text style={styles.codeText}>{coupon.code}</Text>
          </View>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopyCode(coupon.code)}>
            {copiedCode === coupon.code ? (
              <Check size={18} color="#10b981" />
            ) : (
              <Copy size={18} color="#3b82f6" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShareCoupon(coupon)}>
            <Share2 size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.couponFooter}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.statText}>{coupon.successRate}%</Text>
            </View>
            <View style={styles.stat}>
              <Zap size={14} color="#3b82f6" />
              <Text style={styles.statText}>{coupon.usageCount} uses</Text>
            </View>
          </View>
          <Text style={[styles.expiryText, isExpiringSoon && styles.expiryTextUrgent]}>
            {formatExpiryDate(coupon.validUntil)}
          </Text>
        </View>

        {/* Terms */}
        {coupon.terms && (
          <Text style={styles.terms} numberOfLines={2}>{coupon.terms}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderTrendingDeal = (deal: HiddenDeal) => {
    return (
      <View key={deal.coupon.id} style={styles.trendingCard}>
        <View style={styles.trendingHeader}>
          <View style={styles.trendingBadge}>
            <TrendingUp size={16} color="#ef4444" />
            <Text style={styles.trendingBadgeText}>VIRAL</Text>
          </View>
          <View style={styles.viralScore}>
            <Text style={styles.viralScoreText}>{deal.viralityRating}%</Text>
          </View>
        </View>

        <View style={styles.trendingContent}>
          <View style={styles.trendingLeft}>
            <Text style={styles.trendingTitle}>{deal.coupon.description}</Text>
            <Text style={styles.trendingMerchant}>{deal.coupon.merchantName}</Text>
            <View style={styles.trendingMeta}>
              <Text style={styles.trendingFoundBy}>Found by {deal.foundBy}</Text>
              <Text style={styles.trendingDot}>•</Text>
              <Text style={styles.trendingShares}>{deal.shareCount} shares</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewDealButton}
            onPress={() => {/* View deal details */}}>
            <ChevronRight size={20} color="#8b5cf6" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Sparkles size={24} color="#8b5cf6" />
          <Text style={styles.headerTitle}>Coupon Discovery</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/' as any)}>
          <Plus size={24} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search coupons, merchants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'recommended' && styles.tabActive]}
          onPress={() => setSelectedTab('recommended')}>
          <Sparkles size={16} color={selectedTab === 'recommended' ? '#8b5cf6' : '#6b7280'} />
          <Text style={[styles.tabText, selectedTab === 'recommended' && styles.tabTextActive]}>
            For You
          </Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{recommendations.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'trending' && styles.tabActive]}
          onPress={() => setSelectedTab('trending')}>
          <TrendingUp size={16} color={selectedTab === 'trending' ? '#ef4444' : '#6b7280'} />
          <Text style={[styles.tabText, selectedTab === 'trending' && styles.tabTextActive]}>
            Trending
          </Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{trendingDeals.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'expiring' && styles.tabActive]}
          onPress={() => setSelectedTab('expiring')}>
          <Clock size={16} color={selectedTab === 'expiring' ? '#f59e0b' : '#6b7280'} />
          <Text style={[styles.tabText, selectedTab === 'expiring' && styles.tabTextActive]}>
            Expiring Soon
          </Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{expiringCoupons.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}>
          <Filter size={16} color={selectedTab === 'all' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            All Coupons
          </Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{filteredCoupons.length}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trending Deals Section (only for trending tab) */}
        {selectedTab === 'trending' && trendingDeals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color="#ef4444" />
              <Text style={styles.sectionTitle}>Viral Deals 🔥</Text>
            </View>
            {trendingDeals.map(renderTrendingDeal)}
          </View>
        )}

        {/* Coupons List */}
        <View style={styles.section}>
          {selectedTab === 'recommended' && (
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>Personalized for You</Text>
            </View>
          )}
          
          {displayCoupons.length > 0 ? (
            displayCoupons.map((coupon, index) => {
              const recommendation = selectedTab === 'recommended'
                ? recommendations.find(r => r.coupon.id === coupon.id)
                : undefined;
              
              return renderCouponCard(
                coupon,
                recommendation?.reasons[0]
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Search size={48} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No coupons found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try a different search' : 'Check back later for new deals'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tip: Save your favorite coupons for quick access
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  clearButton: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#f3f4f6',
    borderColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#111827',
  },
  tabBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  couponCardExpiring: {
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  couponHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sourceBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4338ca',
  },
  saveButton: {
    padding: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagIcon: {
    fontSize: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
    textTransform: 'capitalize',
  },
  couponDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
  },
  minOrder: {
    fontSize: 13,
    color: '#6b7280',
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 12,
    color: '#6b21a8',
  },
  codeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  codeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e40af',
    letterSpacing: 1,
  },
  copyButton: {
    width: 44,
    height: 44,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#6b7280',
  },
  expiryText: {
    fontSize: 13,
    color: '#6b7280',
  },
  expiryTextUrgent: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  trendingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  viralScore: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viralScoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  trendingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendingLeft: {
    flex: 1,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  trendingMerchant: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  trendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendingFoundBy: {
    fontSize: 12,
    color: '#9ca3af',
  },
  trendingDot: {
    fontSize: 12,
    color: '#d1d5db',
  },
  trendingShares: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  viewDealButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3e8ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
