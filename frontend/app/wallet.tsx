import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Gift,
  ShoppingBag,
  RefreshCw,
  Calendar,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { walletService, Wallet, WalletTransaction } from '@/services/api';

export default function WalletScreen() {
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const response = await walletService.getWallet();
      if (response.data) {
        setWallet(response.data);
      }
    } catch (error) {
      console.error('Failed to load wallet', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWallet();
  };

  const transactions = wallet?.transactions || [];

  const stats = {
    totalEarned: transactions.filter(t => t.type === 'WALLET_TOPUP' || t.type === 'REWARD').reduce((acc, t) => acc + t.amount, 0),
    totalSpent: transactions.filter(t => t.type === 'WITHDRAWAL' || t.type === 'RIDE_PAYMENT' || t.type === 'DEAL_PURCHASE').reduce((acc, t) => acc + t.amount, 0),
    netBalance: wallet?.balance || 0,
    transactionCount: transactions.length,
  };

  const TransactionItem = ({ transaction }: { transaction: WalletTransaction }) => {
    const isEarned = transaction.type === 'WALLET_TOPUP' || transaction.type === 'REWARD';
    const Icon = isEarned ? Gift : ShoppingBag;
    const amountColor = isEarned ? theme.colors.success : theme.colors.textSecondary;
    const amountPrefix = isEarned ? '+' : '-';

    return (
      <View style={styles.transactionItem}>
        <View style={[styles.transactionIcon, { backgroundColor: isEarned ? 'rgba(0, 217, 163, 0.15)' : 'rgba(102, 102, 102, 0.15)' }]}>
          <Icon size={20} color={isEarned ? theme.colors.primary : theme.colors.textSecondary} />
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{transaction.description}</Text>
          <Text style={styles.transactionBusiness}>{transaction.type}</Text>
          <Text style={styles.transactionDate}>
            {new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>

        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, { color: amountColor }]}>
            {amountPrefix}₹{transaction.amount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups: any, transaction) => {
    const date = formatDate(transaction.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <RefreshCw size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <TrendingUp size={18} color={theme.colors.success} />
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <Text style={styles.statValue}>₹{stats.totalEarned.toFixed(2)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <TrendingDown size={18} color={theme.colors.textSecondary} />
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <Text style={styles.statValue}>₹{stats.totalSpent.toFixed(2)}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net Balance</Text>
            <Text style={[styles.summaryValue, { color: stats.netBalance >= 0 ? theme.colors.success : theme.colors.error }]}>
              {stats.netBalance >= 0 ? '+' : ''}₹{Math.abs(stats.netBalance).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Transactions</Text>
            <Text style={styles.summaryValue}>{stats.transactionCount}</Text>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={theme.colors.text} />
            <Text style={styles.sectionTitle}>Transaction History</Text>
          </View>

          {Object.entries(groupedTransactions).map(([date, txns]: [string, any]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {txns.map((transaction: any) => (
                <TransactionItem key={transaction.transactionId} transaction={transaction} />
              ))}
            </View>
          ))}

          {transactions.length === 0 && !loading && (
            <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 20 }}>No transactions yet</Text>
          )}
        </View>

        <View style={{ height: 40 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.surfaceLight,
    marginVertical: 12,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  transactionBusiness: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
});
