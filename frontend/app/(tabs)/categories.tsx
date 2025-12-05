import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Utensils, ShoppingBag, Wrench, TowerControl as GameController2, Heart, Car, GraduationCap, Hop as Home } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppTheme } from '@/store/themeStore';
import { dealsService } from '@/services/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const CATEGORY_STYLES: Record<string, any> = {
  'Food & Dining': { icon: Utensils, color: '#FF6B6B', gradient: ['#FF6B6B', '#FF8E8E'] },
  'Food': { icon: Utensils, color: '#FF6B6B', gradient: ['#FF6B6B', '#FF8E8E'] },
  'Shopping': { icon: ShoppingBag, color: '#4ECDC4', gradient: ['#4ECDC4', '#6EE7DD'] },
  'Services': { icon: Wrench, color: '#45B7D1', gradient: ['#45B7D1', '#66C7E1'] },
  'Entertainment': { icon: GameController2, color: '#F7B731', gradient: ['#F7B731', '#F9C851'] },
  'Health & Wellness': { icon: Heart, color: '#A8E6CF', gradient: ['#A8E6CF', '#B8EBDF'] },
  'Wellness': { icon: Heart, color: '#A8E6CF', gradient: ['#A8E6CF', '#B8EBDF'] },
  'Automotive': { icon: Car, color: '#6C5CE7', gradient: ['#6C5CE7', '#8B7AED'] },
  'Education': { icon: GraduationCap, color: '#FD79A8', gradient: ['#FD79A8', '#FE97C0'] },
  'Home & Garden': { icon: Home, color: '#00B894', gradient: ['#00B894', '#26D0A4'] },
  'Cafe': { icon: Utensils, color: '#F39C12', gradient: ['#F39C12', '#F1C40F'] },
  'Fitness': { icon: Heart, color: '#E74C3C', gradient: ['#E74C3C', '#C0392B'] },
};

const DEFAULT_STYLE = { icon: ShoppingBag, color: '#95A5A6', gradient: ['#95A5A6', '#7F8C8D'] };

export default function CategoriesScreen() {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ categories: 0, deals: 0, businesses: 0 });

  React.useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      const response = await dealsService.getDeals();
      if (response.data) {
        const deals = response.data;

        // Process categories
        const categoryMap = new Map<string, number>();
        const businesses = new Set<string>();

        deals.forEach(deal => {
          const cat = deal.category || 'Other';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
          if (deal.merchantId?._id) businesses.add(deal.merchantId._id);
        });

        const processedCategories = Array.from(categoryMap.entries()).map(([name, count], index) => {
          const style = CATEGORY_STYLES[name] || DEFAULT_STYLE;
          return {
            id: String(index),
            name,
            deals: count,
            ...style,
          };
        });

        setCategories(processedCategories);
        setStats({
          categories: processedCategories.length,
          deals: deals.length,
          businesses: businesses.size
        });
      }
    } catch (error) {
      console.error('Failed to load deals', error);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    // Navigate to category details page
    router.push(`/category/${encodeURIComponent(categoryName)}` as any);
  };

  const CategoryCard = ({ category }: { category: any }) => {
    const IconComponent = category.icon;

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        activeOpacity={0.9}
        onPress={() => handleCategoryPress(category.name)}
      >
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

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.categories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.deals}</Text>
              <Text style={styles.statLabel}>Total Deals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.businesses}</Text>
              <Text style={styles.statLabel}>Businesses</Text>
            </View>
          </View>
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