import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useMarketplaceStore,
  B2BTransaction,
  ServiceBooking,
  BulkPurchase,
} from '../store/marketplaceStore';
import { theme } from '../constants/theme';

export default function B2BTransactionsScreen() {
  const router = useRouter();
  const {
    b2bTransactions,
    serviceBookings,
    bulkPurchases,
    getBusinessTransactions,
    updateTransactionStatus,
    calculateMarketplaceInsights,
    marketplaceInsights,
  } = useMarketplaceStore();

  const [activeTab, setActiveTab] = useState<'transactions' | 'bookings' | 'bulk'>('transactions');
  const myBusinessId = 'my_business_id';

  useEffect(() => {
    calculateMarketplaceInsights();
  }, []);

  const myTransactions = getBusinessTransactions(myBusinessId);
  const myBookings = serviceBookings.filter(
    (b) => b.businessId === myBusinessId
  );
  const myBulkPurchases = bulkPurchases.filter((bp) =>
    bp.participants.some((p) => p.businessId === myBusinessId)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
      case 'scheduled':
        return '#2196F3';
      case 'in_progress':
        return '#9C27B0';
      case 'completed':
      case 'paid':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#888';
    }
  };

  const TransactionCard = ({ transaction }: { transaction: B2BTransaction }) => {
    const isBuyer = transaction.buyerId === myBusinessId;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>
              {transaction.type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.transactionPartner}>
              {isBuyer ? transaction.sellerName : transaction.buyerName}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(transaction.status) },
            ]}
          >
            <Text style={styles.statusText}>{transaction.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {transaction.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={styles.itemPrice}>₹{item.total.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.transactionFooter}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>
              ₹{transaction.totalAmount.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.transactionDate}>
            {transaction.createdAt.toLocaleDateString()}
          </Text>
        </View>

        {transaction.deliveryDetails && (
          <View style={styles.deliveryInfo}>
            <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.deliveryText}>
              Delivery: {transaction.deliveryDetails.scheduledDate.toLocaleDateString()}
            </Text>
          </View>
        )}

        {transaction.status === 'pending' && isBuyer && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => updateTransactionStatus(transaction.id, 'cancelled')}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => updateTransactionStatus(transaction.id, 'confirmed')}
            >
              <Text style={styles.confirmButtonText}>Confirm Payment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const BookingCard = ({ booking }: { booking: ServiceBooking }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingService}>{booking.providerName}</Text>
            <Text style={styles.bookingType}>
              {booking.serviceType.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          >
            <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.detailText}>
              {booking.scheduledDate.toLocaleDateString()} at{' '}
              {booking.scheduledDate.toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.detailText}>{booking.duration} hours</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.detailText}>₹{booking.totalCost.toLocaleString()}</Text>
          </View>
        </View>

        {booking.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}

        <View style={styles.paymentStatusRow}>
          <Text style={styles.paymentLabel}>Payment Status:</Text>
          <View
            style={[
              styles.paymentBadge,
              {
                backgroundColor:
                  booking.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800',
              },
            ]}
          >
            <Text style={styles.paymentText}>
              {booking.paymentStatus.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const BulkPurchaseCard = ({ purchase }: { purchase: BulkPurchase }) => {
    const progress = (purchase.currentQuantity / purchase.targetQuantity) * 100;
    const myParticipation = purchase.participants.find(
      (p) => p.businessId === myBusinessId
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.bulkInfo}>
            <Text style={styles.bulkProduct}>{purchase.productName}</Text>
            <Text style={styles.bulkCategory}>{purchase.category}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  purchase.status === 'open'
                    ? '#2196F3'
                    : purchase.status === 'fulfilled'
                    ? '#4CAF50'
                    : '#888',
              },
            ]}
          >
            <Text style={styles.statusText}>{purchase.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>
              {purchase.currentQuantity}/{purchase.targetQuantity} units
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{progress.toFixed(0)}% completed</Text>
        </View>

        <View style={styles.pricingSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Original Price:</Text>
            <Text style={styles.priceValue}>₹{purchase.pricePerUnit}/unit</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Bulk Price:</Text>
            <Text style={[styles.priceValue, styles.discountPrice]}>
              ₹{purchase.discountedPrice}/unit
            </Text>
          </View>
          <View style={styles.savingsRow}>
            <Ionicons name="trending-down" size={18} color="#4CAF50" />
            <Text style={styles.savingsText}>Save {purchase.savingsPercent}%!</Text>
          </View>
        </View>

        {myParticipation && (
          <View style={styles.participationSection}>
            <Text style={styles.participationLabel}>Your Order:</Text>
            <Text style={styles.participationValue}>
              {myParticipation.quantity} units = ₹
              {(myParticipation.quantity * purchase.discountedPrice).toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.participantsSection}>
          <Text style={styles.participantsLabel}>
            {purchase.participants.length} Participants
          </Text>
          <View style={styles.participantsList}>
            {purchase.participants.slice(0, 3).map((participant, index) => (
              <View key={index} style={styles.participantChip}>
                <Text style={styles.participantText}>{participant.businessName}</Text>
              </View>
            ))}
            {purchase.participants.length > 3 && (
              <Text style={styles.moreParticipants}>
                +{purchase.participants.length - 3} more
              </Text>
            )}
          </View>
        </View>

        <View style={styles.deadlineRow}>
          <Ionicons name="time-outline" size={16} color="#FF9800" />
          <Text style={styles.deadlineText}>
            Deadline: {purchase.deadline.toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>B2B Transactions</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {marketplaceInsights.totalB2BTransactions}
          </Text>
          <Text style={styles.statLabel}>Total Transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ₹{(marketplaceInsights.totalTransactionValue / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ₹{(marketplaceInsights.averageDealSize / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Avg Deal Size</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'transactions' && styles.tabTextActive,
            ]}
          >
            Transactions ({myTransactions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.tabActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'bookings' && styles.tabTextActive,
            ]}
          >
            Bookings ({myBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bulk' && styles.tabActive]}
          onPress={() => setActiveTab('bulk')}
        >
          <Text
            style={[styles.tabText, activeTab === 'bulk' && styles.tabTextActive]}
          >
            Bulk Orders ({myBulkPurchases.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'transactions' && (
          <>
            {myTransactions.length > 0 ? (
              myTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>
                  Start ordering from suppliers to see transactions here
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'bookings' && (
          <>
            {myBookings.length > 0 ? (
              myBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No service bookings yet</Text>
                <Text style={styles.emptySubtext}>
                  Book services from providers to see bookings here
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'bulk' && (
          <>
            {myBulkPurchases.length > 0 ? (
              myBulkPurchases.map((purchase) => (
                <BulkPurchaseCard key={purchase.id} purchase={purchase} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No bulk purchases yet</Text>
                <Text style={styles.emptySubtext}>
                  Join bulk purchase deals to save on collective buying
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {},
  transactionType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  transactionPartner: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemsList: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  transactionDate: {
    fontSize: 13,
    color: '#888',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  deliveryText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookingInfo: {},
  bookingService: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  bookingType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  notesSection: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#666',
  },
  paymentStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  bulkInfo: {},
  bulkProduct: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  bulkCategory: {
    fontSize: 13,
    color: '#888',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  progressValue: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressPercent: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  pricingSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  discountPrice: {
    color: '#4CAF50',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  savingsText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  participationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  participationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  participationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  participantsSection: {
    marginBottom: 12,
  },
  participantsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  participantChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  participantText: {
    fontSize: 12,
    color: '#666',
  },
  moreParticipants: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomPadding: {
    height: 80,
  },
});
