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
import { Utensils, ShoppingBag, Wrench, TowerControl as GameController2, Heart, Car, GraduationCap, Hop as Home } from 'lucide-react-native';
import { theme } from '@/constants/theme';

const { width } = Dimensions.get('window');

const categories = [
  {
    id: '1',
    name: 'Food & Dining',
    icon: Utensils,
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E8E'],
    deals: 45,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  },
  {
    id: '2',
    name: 'Shopping',
    icon: ShoppingBag,
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#6EE7DD'],
    deals: 32,
    image: 'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg',
  },
  {
    id: '3',
    name: 'Services',
    icon: Wrench,
    color: '#45B7D1',
    gradient: ['#45B7D1', '#66C7E1'],
    deals: 28,
    image: 'https://images.pexels.com/photos/1367276/pexels-photo-1367276.jpeg',
  },
  {
    id: '4',
    name: 'Entertainment',
    icon: GameController2,
    color: '#F7B731',
    gradient: ['#F7B731', '#F9C851'],
    deals: 19,
    image: 'https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg',
  },
  {
    id: '5',
    name: 'Health & Wellness',
    icon: Heart,
    color: '#A8E6CF',
    gradient: ['#A8E6CF', '#B8EBDF'],
    deals: 15,
    image: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg',
  },
  {
    id: '6',
    name: 'Automotive',
    icon: Car,
    color: '#6C5CE7',
    gradient: ['#6C5CE7', '#8B7AED'],
    deals: 12,
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
  },
  {
    id: '7',
    name: 'Education',
    icon: GraduationCap,
    color: '#FD79A8',
    gradient: ['#FD79A8', '#FE97C0'],
    deals: 8,
    image: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg',
  },
  {
    id: '8',
    name: 'Home & Garden',
    icon: Home,
    color: '#00B894',
    gradient: ['#00B894', '#26D0A4'],
    deals: 22,
    image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg',
  },
];

const popularDeals = [
  {
    id: '1',
    title: '25% Off All Items',
    business: 'Fashion Hub',
    category: 'Shopping',
    discount: 25,
    image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg',
    rating: 4.5,
  },
  {
    id: '2',
    title: 'Free Appetizer with Main Course',
    business: 'Bella Vista Restaurant',
    category: 'Food & Dining',
    discount: 0,
    image: 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg',
    rating: 4.8,
  },
  {
    id: '3',
    title: '2-for-1 Movie Tickets',
    business: 'Cinema Plus',
    category: 'Entertainment',
    discount: 50,
    image: 'https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg',
    rating: 4.3,
  },
];

export default function CategoriesScreen() {
  const CategoryCard = ({ category }: { category: typeof categories[0] }) => {
    const IconComponent = category.icon;
    
    return (
      <TouchableOpacity style={styles.categoryCard} activeOpacity={0.9}>
        <View style={[styles.categoryContent, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.categoryIcon, { backgroundColor: 'rgba(0, 217, 163, 0.15)' }]}>
            <IconComponent size={22} color={theme.colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDeals}>{category.deals} deals</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const PopularDealCard = ({ deal }: { deal: typeof popularDeals[0] }) => (
    <TouchableOpacity style={styles.popularCard}>
      <Image source={{ uri: deal.image }} style={styles.popularImage} />
      <View style={styles.popularContent}>
        <Text style={styles.popularTitle}>{deal.title}</Text>
        <Text style={styles.popularBusiness}>{deal.business}</Text>
        <Text style={styles.popularCategory}>{deal.category}</Text>
      </View>
      {deal.discount > 0 && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>{deal.discount}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>Discover deals by category</Text>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </View>
        </View>

        {/* Popular Deals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular This Week</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.popularList}>
              {popularDeals.map(deal => (
                <PopularDealCard key={deal.id} deal={deal} />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>Total Deals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Businesses</Text>
            </View>
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
    paddingBottom: 24,
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
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  categoryCard: {
    width: (width - 56) / 2,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  categoryContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: 12,
    letterSpacing: -0.2,
  },
  categoryDeals: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.primary,
  },
  popularList: {
    flexDirection: 'row',
    paddingLeft: 20,
  },
  popularCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  popularImage: {
    width: '100%',
    height: 120,
  },
  popularContent: {
    padding: 12,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  popularBusiness: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  popularCategory: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.background,
  },
  statsSection: {
    margin: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});