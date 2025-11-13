import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMarketplaceStore, SupplierType, BusinessSupplier } from '../store/marketplaceStore';
import { theme } from '../constants/theme';

export default function SupplierMarketplaceScreen() {
  const router = useRouter();
  const {
    suppliers,
    selectedSupplier,
    searchMarketplace,
    getNearbySuppliers,
    getSuppliersByType,
    calculateMarketplaceInsights,
    createTransaction,
  } = useMarketplaceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SupplierType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSupplierModal, setSelectedSupplierModal] = useState<BusinessSupplier | null>(null);
  const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers);

  useEffect(() => {
    calculateMarketplaceInsights();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = searchMarketplace(searchQuery);
      setFilteredSuppliers(results.suppliers);
    } else if (selectedCategory !== 'all') {
      setFilteredSuppliers(getSuppliersByType(selectedCategory));
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [searchQuery, selectedCategory, suppliers]);

  const categories: { type: SupplierType | 'all'; label: string; icon: string }[] = [
    { type: 'all', label: 'All', icon: 'grid-outline' },
    { type: 'food_supplies', label: 'Food', icon: 'fast-food-outline' },
    { type: 'equipment', label: 'Equipment', icon: 'hardware-chip-outline' },
    { type: 'furniture', label: 'Furniture', icon: 'bed-outline' },
    { type: 'packaging', label: 'Packaging', icon: 'cube-outline' },
    { type: 'cleaning', label: 'Cleaning', icon: 'water-outline' },
    { type: 'technology', label: 'Tech', icon: 'desktop-outline' },
  ];

  const handleContactSupplier = (supplier: BusinessSupplier) => {
    setSelectedSupplierModal(supplier);
  };

  const handlePlaceOrder = (supplier: BusinessSupplier) => {
    // Create a sample transaction
    const transactionId = createTransaction({
      type: 'product_purchase',
      buyerId: 'my_business_id',
      buyerName: 'My Business',
      sellerId: supplier.id,
      sellerName: supplier.businessName,
      items: supplier.products.slice(0, 2).map((product) => ({
        id: product.id,
        name: product.name,
        quantity: product.minimumQuantity,
        unitPrice: product.unitPrice,
        total: product.unitPrice * product.minimumQuantity,
      })),
      totalAmount: supplier.products
        .slice(0, 2)
        .reduce((sum, p) => sum + p.unitPrice * p.minimumQuantity, 0),
      commission: 0,
      status: 'pending',
      paymentMethod: 'UMA Wallet',
    });

    Alert.alert('Success', `Order placed! Transaction ID: ${transactionId}`);
    setSelectedSupplierModal(null);
  };

  const SupplierCard = ({ supplier }: { supplier: BusinessSupplier }) => (
    <TouchableOpacity
      style={styles.supplierCard}
      onPress={() => handleContactSupplier(supplier)}
    >
      <View style={styles.supplierHeader}>
        <View style={styles.supplierInfo}>
          <Text style={styles.supplierName}>{supplier.businessName}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{supplier.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({supplier.reviewCount})</Text>
          </View>
        </View>
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>{supplier.membershipTier.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.supplierDescription} numberOfLines={2}>
        {supplier.description}
      </Text>

      <View style={styles.badgesRow}>
        {supplier.badges.slice(0, 3).map((badge, index) => (
          <View key={index} style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.statText}>{supplier.totalClients} clients</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.statText}>{supplier.deliveryRadius}km radius</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.statText}>{supplier.responseTime}</Text>
        </View>
      </View>

      <View style={styles.productsPreview}>
        <Text style={styles.productsTitle}>
          {supplier.products.length} Products Available
        </Text>
        <View style={styles.productsList}>
          {supplier.products.slice(0, 2).map((product) => (
            <View key={product.id} style={styles.productItem}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>₹{product.unitPrice}/{product.unit}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Full Catalog</Text>
        <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supplier Marketplace</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="filter" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search suppliers, products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.type}
            style={[
              styles.categoryChip,
              selectedCategory === cat.type && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.type)}
          >
            <Ionicons
              name={cat.icon as any}
              size={20}
              color={selectedCategory === cat.type ? '#fff' : theme.colors.primary}
            />
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === cat.type && styles.categoryLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredSuppliers.length} Suppliers Found
        </Text>
        <TouchableOpacity>
          <Text style={styles.sortText}>Sort by: Rating ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Suppliers List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No suppliers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Supplier Detail Modal */}
      <Modal
        visible={selectedSupplierModal !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedSupplierModal(null)}
      >
        {selectedSupplierModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedSupplierModal.businessName}</Text>
                <TouchableOpacity onPress={() => setSelectedSupplierModal(null)}>
                  <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>About</Text>
                  <Text style={styles.sectionText}>{selectedSupplierModal.description}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <Text style={styles.sectionText}>
                    {selectedSupplierModal.location.address}, {selectedSupplierModal.location.city}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.contactText}>
                      {selectedSupplierModal.contactInfo.phone}
                    </Text>
                  </View>
                  <View style={styles.contactRow}>
                    <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.contactText}>
                      {selectedSupplierModal.contactInfo.email}
                    </Text>
                  </View>
                  {selectedSupplierModal.contactInfo.website && (
                    <View style={styles.contactRow}>
                      <Ionicons name="globe-outline" size={20} color={theme.colors.primary} />
                      <Text style={styles.contactText}>
                        {selectedSupplierModal.contactInfo.website}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Products</Text>
                  {selectedSupplierModal.products.map((product) => (
                    <View key={product.id} style={styles.productDetail}>
                      <View style={styles.productDetailHeader}>
                        <Text style={styles.productDetailName}>{product.name}</Text>
                        <Text style={styles.productDetailPrice}>
                          ₹{product.unitPrice}/{product.unit}
                        </Text>
                      </View>
                      <Text style={styles.productDetailDescription}>
                        {product.description}
                      </Text>
                      <View style={styles.productDetailFooter}>
                        <Text style={styles.productDetailMin}>
                          Min: {product.minimumQuantity} {product.unit}
                        </Text>
                        <View
                          style={[
                            styles.availabilityBadge,
                            product.availability === 'in_stock' && styles.inStock,
                            product.availability === 'low_stock' && styles.lowStock,
                            product.availability === 'out_of_stock' && styles.outOfStock,
                          ]}
                        >
                          <Text style={styles.availabilityText}>
                            {product.availability.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Terms</Text>
                  <Text style={styles.sectionText}>
                    • Minimum order: ₹{selectedSupplierModal.minimumOrder}
                  </Text>
                  <Text style={styles.sectionText}>
                    • Delivery radius: {selectedSupplierModal.deliveryRadius}km
                  </Text>
                  <Text style={styles.sectionText}>
                    • Response time: {selectedSupplierModal.responseTime}
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => Alert.alert('Contact', 'Opening contact form...')}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                  <Text style={styles.contactButtonText}>Contact</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.orderButton}
                  onPress={() => handlePlaceOrder(selectedSupplierModal)}
                >
                  <Ionicons name="cart-outline" size={20} color="#fff" />
                  <Text style={styles.orderButtonText}>Place Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryLabel: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  categoryLabelActive: {
    color: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  sortText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  supplierCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reviews: {
    marginLeft: 4,
    fontSize: 14,
    color: '#888',
  },
  tierBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
  },
  supplierDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  productsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  productsList: {
    marginBottom: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  productName: {
    fontSize: 13,
    color: '#666',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  bottomPadding: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  productDetail: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  productDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productDetailName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  productDetailPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  productDetailDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  productDetailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDetailMin: {
    fontSize: 12,
    color: '#888',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  inStock: {
    backgroundColor: '#4CAF50',
  },
  lowStock: {
    backgroundColor: '#FF9800',
  },
  outOfStock: {
    backgroundColor: '#F44336',
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
  },
  contactButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
  },
  orderButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
