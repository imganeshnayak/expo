import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Gift,
  Users,
  DollarSign,
  Share2,
  Copy,
  Check,
  TrendingUp,
  Star,
  Clock,
  Award,
  Zap,
  ChevronRight,
} from 'lucide-react-native';
import { useSocialStore, formatTimeAgo, type Referral } from '../store/socialStore';
import { theme } from '../constants/theme';

export default function ReferralScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);

  const {
    myReferralCode,
    referrals,
    getTotalEarnings,
    getCompletedReferrals,
    generateReferralLink,
    trackReferral,
  } = useSocialStore();

  const referralLink = generateReferralLink();
  const totalEarnings = getTotalEarnings();
  const completedReferrals = getCompletedReferrals();
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const joinedReferrals = referrals.filter(r => r.status === 'joined').length;

  // Calculate potential earnings (pending + joined)
  const potentialEarnings = referrals
    .filter(r => r.status === 'pending' || r.status === 'joined')
    .reduce((sum, r) => sum + r.rewards.referrerReward, 0);

  // Bonus eligibility (₹50 extra after 5 successful referrals)
  const bonusProgress = completedReferrals;
  const bonusTarget = 5;
  const bonusEarned = Math.floor(bonusProgress / bonusTarget) * 50;
  const nextBonusIn = bonusTarget - (bonusProgress % bonusTarget);

  const handleCopyCode = () => {
    Clipboard.setString(myReferralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const handleShare = async () => {
    try {
      const message = `🎉 Join UMA and get ₹150 bonus!\n\nI'm using UMA to save money on rides, food, and shopping. Use my code "${myReferralCode}" when you sign up and we both get rewards!\n\n${referralLink}`;
      
      await Share.share({
        message,
        title: 'Join UMA - Get ₹150 Bonus',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleInviteByPhone = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    trackReferral(phoneNumber);
    setPhoneNumber('');
    Alert.alert(
      'Invitation Sent!',
      'Your friend will receive an SMS with your referral code',
      [{ text: 'OK' }]
    );
  };

  const getStatusBadge = (status: Referral['status']) => {
    const badges = {
      pending: { text: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
      joined: { text: 'Joined', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
      completed: { text: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
      expired: { text: 'Expired', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
    };
    return badges[status];
  };

  const renderReferralCard = (referral: Referral) => {
    const statusBadge = getStatusBadge(referral.status);
    
    return (
      <View
        key={referral.id}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor:
            referral.status === 'completed'
              ? theme.colors.success
              : referral.status === 'joined'
              ? '#3b82f6'
              : '#d1d5db',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
              {referral.refereeName || referral.refereePhone || 'Pending Signup'}
            </Text>
            {referral.refereePhone && !referral.refereeName && (
              <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                {referral.refereePhone}
              </Text>
            )}
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              Sent {formatTimeAgo(referral.createdAt)}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: statusBadge.bg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: statusBadge.color }}>
              {statusBadge.text}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={{ marginBottom: 12 }}>
          {referral.status === 'pending' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Clock size={14} color="#9ca3af" />
              <Text style={{ fontSize: 13, color: '#6b7280' }}>
                Waiting for signup
              </Text>
            </View>
          )}
          
          {referral.status === 'joined' && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Check size={14} color="#10b981" />
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Joined {formatTimeAgo(referral.joinedAt!)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Clock size={14} color="#3b82f6" />
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Waiting for first deal completion
                </Text>
              </View>
            </>
          )}
          
          {referral.status === 'completed' && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Check size={14} color="#10b981" />
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Joined {formatTimeAgo(referral.joinedAt!)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Check size={14} color="#10b981" />
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Completed {formatTimeAgo(referral.completedAt!)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Earnings */}
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#f3f4f6',
            gap: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>
              Your Reward
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.primary }}>
              ₹{referral.earnings.referrer}
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                {referral.status !== 'completed' && ` / ₹${referral.rewards.referrerReward}`}
              </Text>
            </Text>
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>
              Friend's Reward
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#10b981' }}>
              ₹{referral.earnings.referee}
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                {referral.status !== 'completed' && ` / ₹${referral.rewards.refereeReward}`}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft color="#111827" size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
            Refer & Earn
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Earnings Overview */}
        <View style={{ backgroundColor: 'linear-gradient(135deg, #00d9a3 0%, #00a67e 100%)', padding: 24, marginBottom: 8 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 8 }}>
              Total Earnings
            </Text>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#ffffff' }}>
              ₹{totalEarnings}
            </Text>
            {potentialEarnings > 0 && (
              <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', marginTop: 4 }}>
                +₹{potentialEarnings} pending
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, padding: 16, alignItems: 'center' }}>
              <Users size={24} color="#ffffff" />
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginTop: 8 }}>
                {completedReferrals}
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.9)' }}>
                Successful
              </Text>
            </View>

            <View style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, padding: 16, alignItems: 'center' }}>
              <Clock size={24} color="#ffffff" />
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginTop: 8 }}>
                {pendingReferrals + joinedReferrals}
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.9)' }}>
                In Progress
              </Text>
            </View>

            <View style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, padding: 16, alignItems: 'center' }}>
              <Gift size={24} color="#ffffff" />
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginTop: 8 }}>
                ₹{bonusEarned}
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.9)' }}>
                Bonus
              </Text>
            </View>
          </View>
        </View>

        {/* Bonus Progress */}
        {bonusProgress < bonusTarget && (
          <View style={{ backgroundColor: '#ffffff', padding: 20, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Star size={20} color="#f59e0b" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginLeft: 8 }}>
                Bonus Challenge
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
              Refer {nextBonusIn} more friend{nextBonusIn > 1 ? 's' : ''} to unlock ₹50 bonus!
            </Text>
            <View style={{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  width: `${(bonusProgress % bonusTarget) * 20}%`,
                  backgroundColor: '#f59e0b',
                  borderRadius: 4,
                }}
              />
            </View>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              {bonusProgress % bonusTarget} / {bonusTarget} completed
            </Text>
          </View>
        )}

        {/* How It Works */}
        <View style={{ backgroundColor: '#ffffff', padding: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
            How It Works
          </Text>

          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0, 217, 163, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.primary }}>
                  1
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                  Share Your Code
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  Invite friends via WhatsApp, SMS, or any social platform
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0, 217, 163, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.primary }}>
                  2
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                  Friend Joins & Gets ₹150
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  They get ₹150 welcome bonus + 2 bonus stamps when they sign up
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0, 217, 163, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.primary }}>
                  3
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                  You Both Earn
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  You get ₹100 when they complete their first deal!
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Star size={20} color="#f59e0b" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                  Bonus Rewards
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  Earn ₹50 extra for every 5 successful referrals!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Your Referral Code */}
        <View style={{ backgroundColor: '#ffffff', padding: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
            Your Referral Code
          </Text>

          <View
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: 12,
              padding: 20,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: theme.colors.primary,
              borderStyle: 'dashed',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
              Share this code with friends
            </Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: theme.colors.primary, letterSpacing: 2 }}>
              {myReferralCode}
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: theme.colors.primary,
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
              onPress={handleCopyCode}
            >
              {copied ? (
                <>
                  <Check size={16} color="#ffffff" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
                    Copied!
                  </Text>
                </>
              ) : (
                <>
                  <Copy size={16} color="#ffffff" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
                    Copy Code
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Share Buttons */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.colors.primary,
                borderRadius: 8,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onPress={handleShare}
            >
              <Share2 size={18} color="#ffffff" />
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#ffffff' }}>
                Share Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#f3f4f6',
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleCopyLink}
            >
              <Copy size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Invite by Phone */}
        <View style={{ backgroundColor: '#ffffff', padding: 20, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
            Invite by Phone
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+91 98765 43210"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              style={{
                flex: 1,
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 16,
                fontSize: 15,
                color: '#111827',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleInviteByPhone}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#ffffff' }}>
                Send
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
            We'll send them an SMS with your referral code
          </Text>
        </View>

        {/* Referral History */}
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
              Referral History
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>
              {referrals.length} total
            </Text>
          </View>

          {referrals.length > 0 ? (
            referrals
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(referral => renderReferralCard(referral))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Gift size={48} color="#d1d5db" />
              <Text style={{ fontSize: 16, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
                No referrals yet
              </Text>
              <Text style={{ fontSize: 14, color: '#d1d5db', marginTop: 4, textAlign: 'center' }}>
                Start inviting friends to earn rewards!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
