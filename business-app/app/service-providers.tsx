import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useMarketplaceStore,
  ServiceType,
  ServiceProvider,
  ServiceBooking,
} from '../store/marketplaceStore';
import { theme } from '../constants/theme';

export default function ServiceProviderNetworkScreen() {
  const router = useRouter();
  const {
    serviceProviders,
    getProvidersByType,
    bookService,
    searchMarketplace,
    calculateMarketplaceInsights,
  } = useMarketplaceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | 'all'>('all');
  const [filteredProviders, setFilteredProviders] = useState(serviceProviders);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  useEffect(() => {
    calculateMarketplaceInsights();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = searchMarketplace(searchQuery);
      setFilteredProviders(results.providers);
    } else if (selectedServiceType !== 'all') {
      setFilteredProviders(getProvidersByType(selectedServiceType));
    } else {
      setFilteredProviders(serviceProviders);
    }
  }, [searchQuery, selectedServiceType, serviceProviders]);

  const serviceTypes: { type: ServiceType | 'all'; label: string; icon: string }[] = [
    { type: 'all', label: 'All Services', icon: 'apps-outline' },
    { type: 'accounting', label: 'Accounting', icon: 'calculator-outline' },
    { type: 'digital_marketing', label: 'Marketing', icon: 'megaphone-outline' },
    { type: 'legal', label: 'Legal', icon: 'document-text-outline' },
    { type: 'hr', label: 'HR Services', icon: 'people-outline' },
    { type: 'maintenance', label: 'Maintenance', icon: 'construct-outline' },
    { type: 'consulting', label: 'Consulting', icon: 'bulb-outline' },
  ];

  const handleBookService = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (!selectedProvider || !bookingDate) {
      Alert.alert('Info', 'Please fill in all required fields');
      return;
    }

    const booking: ServiceBooking = {
      id: `booking${Date.now()}`,
      providerId: selectedProvider.id,
      providerName: selectedProvider.serviceName,
      serviceType: selectedProvider.serviceType,
      businessId: 'my_business_id',
      businessName: 'My Business',
      scheduledDate: new Date(bookingDate),
      duration: 2,
      totalCost: selectedProvider.pricing.rate * 2,
      status: 'scheduled',
      paymentStatus: 'pending',
      notes: bookingNotes,
      createdAt: new Date(),
    };

    bookService(booking);
    Alert.alert('Info', 'Service booked successfully!');
    setShowBookingModal(false);
    setBookingDate('');
    setBookingNotes('');
    setSelectedProvider(null);
  };

  const ProviderCard = ({ provider }: { provider: ServiceProvider }) => (
    <TouchableOpacity
      style={styles.providerCard}
      onPress={() => handleBookService(provider)}
    >
      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.serviceName}</Text>
          <Text style={styles.serviceType}>
            {provider.serviceType.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        {provider.isUMAVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.verifiedText}>UMA Verified</Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {provider.description}
      </Text>

      <View style={styles.ratingRow}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={18} color="#FFD700" />
          <Text style={styles.rating}>{provider.rating.toFixed(1)}</Text>
          <Text style={styles.reviews}>({provider.reviewCount} reviews)</Text>
        </View>
        <Text style={styles.projects}>{provider.completedProjects} projects</Text>
      </View>

      <View style={styles.expertiseContainer}>
        <Text style={styles.expertiseTitle}>Expertise:</Text>
        <View style={styles.expertiseTags}>
          {provider.expertise.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.expertiseTag}>
              <Text style={styles.expertiseText}>{skill}</Text>
            </View>
          ))}
          {provider.expertise.length > 3 && (
            <Text style={styles.moreText}>+{provider.expertise.length - 3} more</Text>
          )}
        </View>
      </View>

      <View style={styles.pricingRow}>
        <View style={styles.pricingInfo}>
          <Text style={styles.pricingLabel}>
            {provider.pricing.model === 'hourly'
              ? 'Hourly Rate'
              : provider.pricing.model === 'project'
              ? 'Starting From'
              : 'Monthly'}
          </Text>
          <Text style={styles.pricingValue}>₹{provider.pricing.rate.toLocaleString()}</Text>
        </View>
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.locationText}>{provider.location}</Text>
        </View>
      </View>

      <View style={styles.availabilityRow}>
        <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
        <Text style={styles.availabilityText}>Responds {provider.responseTime}</Text>
      </View>

      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>View Details & Book</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
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
        <Text style={styles.headerTitle}>Service Provider Network</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services, providers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Service Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {serviceTypes.map((service) => (
          <TouchableOpacity
            key={service.type}
            style={[
              styles.filterChip,
              selectedServiceType === service.type && styles.filterChipActive,
            ]}
            onPress={() => setSelectedServiceType(service.type)}
          >
            <Ionicons
              name={service.icon as any}
              size={20}
              color={selectedServiceType === service.type ? '#fff' : theme.colors.primary}
            />
            <Text
              style={[
                styles.filterLabel,
                selectedServiceType === service.type && styles.filterLabelActive,
              ]}
            >
              {service.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredProviders.length}</Text>
          <Text style={styles.statLabel}>Providers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {filteredProviders.filter((p) => p.isUMAVerified).length}
          </Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {(
              filteredProviders.reduce((sum, p) => sum + p.rating, 0) /
              Math.max(filteredProviders.length, 1)
            ).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Providers List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No service providers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        {selectedProvider && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Service</Text>
                <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                  <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <View style={styles.providerSummary}>
                  <Text style={styles.providerSummaryName}>
                    {selectedProvider.serviceName}
                  </Text>
                  <Text style={styles.providerSummaryType}>
                    {selectedProvider.serviceType.replace('_', ' ')}
                  </Text>
                  <View style={styles.providerSummaryRating}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.providerSummaryRatingText}>
                      {selectedProvider.rating.toFixed(1)} ({selectedProvider.reviewCount})
                    </Text>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Service Date *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="YYYY-MM-DD"
                    value={bookingDate}
                    onChangeText={setBookingDate}
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Additional Notes</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    placeholder="Describe your requirements..."
                    value={bookingNotes}
                    onChangeText={setBookingNotes}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.pricingBreakdown}>
                  <Text style={styles.breakdownTitle}>Pricing Breakdown</Text>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>
                      {selectedProvider.pricing.model === 'hourly'
                        ? 'Rate (per hour)'
                        : selectedProvider.pricing.model === 'project'
                        ? 'Project Fee'
                        : 'Monthly Subscription'}
                    </Text>
                    <Text style={styles.breakdownValue}>
                      ₹{selectedProvider.pricing.rate.toLocaleString()}
                    </Text>
                  </View>
                  {selectedProvider.pricing.model === 'hourly' && (
                    <>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Estimated Duration</Text>
                        <Text style={styles.breakdownValue}>2 hours</Text>
                      </View>
                      <View style={styles.breakdownDivider} />
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownTotalLabel}>Estimated Total</Text>
                        <Text style={styles.breakdownTotalValue}>
                          ₹{(selectedProvider.pricing.rate * 2).toLocaleString()}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.portfolioSection}>
                  <Text style={styles.portfolioTitle}>Recent Work</Text>
                  {selectedProvider.portfolio.length > 0 ? (
                    selectedProvider.portfolio.map((item) => (
                      <View key={item.id} style={styles.portfolioItem}>
                        <Text style={styles.portfolioItemTitle}>{item.title}</Text>
                        <Text style={styles.portfolioItemDescription}>
                          {item.description}
                        </Text>
                        {item.clientTestimonial && (
                          <View style={styles.testimonial}>
                            <Ionicons
                              name="chatbox-ellipses-outline"
                              size={16}
                              color={theme.colors.primary}
                            />
                            <Text style={styles.testimonialText}>
                              "{item.clientTestimonial}"
                            </Text>
                          </View>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noPortfolio}>No portfolio items yet</Text>
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowBookingModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={confirmBooking}>
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
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
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterLabel: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  filterLabelActive: {
    color: '#fff',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  scrollView: {
    flex: 1,
  },
  providerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  reviews: {
    marginLeft: 4,
    fontSize: 13,
    color: '#888',
  },
  projects: {
    fontSize: 13,
    color: '#666',
  },
  expertiseContainer: {
    marginBottom: 12,
  },
  expertiseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  expertiseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  expertiseTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  expertiseText: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  moreText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pricingInfo: {},
  pricingLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  pricingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  availabilityText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#666',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 6,
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
  providerSummary: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  providerSummaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  providerSummaryType: {
    fontSize: 13,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  providerSummaryRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerSummaryRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pricingBreakdown: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  breakdownTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  breakdownTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  portfolioSection: {
    padding: 20,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  portfolioItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  portfolioItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  portfolioItemDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  testimonial: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  testimonialText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#666',
  },
  noPortfolio: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
