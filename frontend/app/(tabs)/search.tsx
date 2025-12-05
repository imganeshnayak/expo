import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ListFilter as Filter, MapPin, Star, Clock, X } from 'lucide-react-native';
import { theme } from '@/constants/theme';

const searchResults = [
  {
    id: '1',
    title: '40% Off Premium Burgers',
    business: 'Gourmet Burger Co.',
    category: 'Food & Dining',
    discount: 40,
    originalPrice: 25,
    discountedPrice: 15,
    image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
    rating: 4.7,
    reviews: 189,
    distance: '0.4 km',
    expiresIn: '3 days',
  },
  {
    id: '2',
    title: 'Free Home Delivery',
    business: 'QuickMart Grocery',
    category: 'Shopping',
    discount: 0,
    image: 'https://images.pexels.com/photos/3985062/pexels-photo-3985062.jpeg',
    rating: 4.4,
    reviews: 276,
    distance: '1.2 km',
    expiresIn: '1 week',
  },
  {
    id: '3',
    title: '20% Off Car Wash Services',
    business: 'Shine Auto Care',
    category: 'Automotive',
    discount: 20,
    originalPrice: 30,
    discountedPrice: 24,
    image: 'https://images.pexels.com/photos/97075/pexels-photo-97075.jpeg',
    rating: 4.6,
    reviews: 94,
    distance: '2.1 km',
    expiresIn: '5 days',
  },
];

const popularSearches = [
  'Pizza deals',
  'Coffee shops',
  'Spa services',
  'Electronics',
  'Fitness classes',
  'Hair salon',
  'Restaurant',
  'Shopping mall',
];

const categories = [
  { name: 'All', active: true },
  { name: 'Food', active: false },
  { name: 'Shopping', active: false },
  { name: 'Services', active: false },
  { name: 'Entertainment', active: false },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const ResultCard = ({ result }: { result: typeof searchResults[0] }) => (
    <TouchableOpacity style={styles.resultCard}>
      <Image source={{ uri: result.image }} style={styles.resultImage} />
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>{result.title}</Text>
          {result.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{result.discount}%</Text>
            </View>
          )}
        </View>
        <Text style={styles.resultBusiness}>{result.business}</Text>
        <Text style={styles.resultCategory}>{result.category}</Text>

        <View style={styles.resultMeta}>
          <View style={styles.metaItem}>
            <Star size={14} color={theme.colors.primary} fill={theme.colors.primary} />
            <Text style={styles.metaText}>{result.rating}</Text>
            <Text style={styles.metaText}>({result.reviews})</Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{result.distance}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{result.expiresIn}</Text>
          </View>
        </View>

        {result.originalPrice && (
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>₹{result.originalPrice}</Text>
            <Text style={styles.discountedPrice}>₹{result.discountedPrice}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const PopularSearchItem = ({ search }: { search: string }) => (
    <TouchableOpacity
      style={styles.popularSearchItem}
      onPress={() => setSearchQuery(search)}>
      <Text style={styles.popularSearchText}>{search}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.subtitle}>Find the best deals near you</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search deals, businesses, categories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}>
            <Filter size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilters}>
          <View style={styles.categoryList}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryFilter,
                  activeCategory === category.name && styles.activeCategoryFilter,
                ]}
                onPress={() => setActiveCategory(category.name)}>
                <Text
                  style={[
                    styles.categoryFilterText,
                    activeCategory === category.name && styles.activeCategoryFilterText,
                  ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Search Results or Popular Searches */}
        {searchQuery.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Results for "{searchQuery}" ({searchResults.length})
              </Text>
            </View>
            <View style={styles.resultsContainer}>
              {searchResults.map(result => (
                <ResultCard key={result.id} result={result} />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
            </View>
            <View style={styles.popularSearches}>
              {popularSearches.map((search, index) => (
                <PopularSearchItem key={index} search={search} />
              ))}
            </View>
          </View>
        )}

        {/* Search Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Search Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Use specific keywords like "pizza", "coffee", "spa"</Text>
            <Text style={styles.tipItem}>• Try business names for direct results</Text>
            <Text style={styles.tipItem}>• Filter by category to narrow down results</Text>
            <Text style={styles.tipItem}>• Check distance to find nearby deals</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: 12,
    fontWeight: '400',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryFilters: {
    marginBottom: 24,
  },
  categoryList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  activeCategoryFilter: {
    backgroundColor: 'rgba(0, 217, 163, 0.15)',
    borderColor: theme.colors.primary,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  activeCategoryFilterText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  resultTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  discountBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.background,
  },
  resultBusiness: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  resultCategory: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    letterSpacing: -0.3,
  },
  popularSearches: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularSearchItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  popularSearchText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  tipsContainer: {
    margin: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});