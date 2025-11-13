import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Brain, TrendingUp, Target, Users, Zap, Heart, Settings } from 'lucide-react-native';
import { useAIPersonalizationStore, getPersonalityArchetypes, getMoodEmoji, formatConfidence, getPriceSensitivityLabel, type ExplicitPreferences } from '../store/aiPersonalizationStore';

export default function AIProfileScreen() {
  const router = useRouter();
  const {
    userProfile,
    learningMetrics,
    getArchetypeInfo,
    getInsights,
    updateExplicitPreferences,
  } = useAIPersonalizationStore();

  const archetypeInfo = getArchetypeInfo();
  const insights = getInsights();
  const allArchetypes = getPersonalityArchetypes();

  const renderArchetypeCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.archetypeIcon}>{archetypeInfo.icon}</Text>
          <View>
            <Text style={styles.cardTitle}>{archetypeInfo.name}</Text>
            <Text style={styles.subtitle}>{archetypeInfo.description}</Text>
          </View>
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>{userProfile.archetypeConfidence}%</Text>
        </View>
      </View>

      <View style={styles.traitsContainer}>
        {archetypeInfo.traits.map((trait, index) => (
          <View key={index} style={styles.traitChip}>
            <Text style={styles.traitText}>{trait}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <TrendingUp size={20} color="#10b981" />
          <Text style={styles.metricLabel}>Accuracy</Text>
          <Text style={styles.metricValue}>{learningMetrics.modelAccuracy}%</Text>
        </View>
        <View style={styles.metric}>
          <Target size={20} color="#3b82f6" />
          <Text style={styles.metricLabel}>Actions Tracked</Text>
          <Text style={styles.metricValue}>{learningMetrics.actionsTracked}</Text>
        </View>
        <View style={styles.metric}>
          <Zap size={20} color="#f59e0b" />
          <Text style={styles.metricLabel}>Confidence</Text>
          <Text style={styles.metricValue}>{formatConfidence(userProfile.archetypeConfidence)}</Text>
        </View>
      </View>
    </View>
  );

  const renderInsightsCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Your Behavioral Insights 🧠</Text>
      <Text style={styles.subtitle}>What we've learned about you</Text>

      <View style={styles.insightsList}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <View style={styles.insightBullet} />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.behaviorPatterns}>
        <Text style={styles.sectionTitle}>Behavior Patterns</Text>
        
        <View style={styles.patternRow}>
          <Text style={styles.patternLabel}>Most Active Day</Text>
          <Text style={styles.patternValue}>
            {Object.entries(userProfile.implicitPreferences.behaviorPatterns.dayOfWeek)
              .sort((a, b) => b[1] - a[1])[0][0]}
          </Text>
        </View>

        <View style={styles.patternRow}>
          <Text style={styles.patternLabel}>Social Preference</Text>
          <Text style={styles.patternValue}>
            {userProfile.implicitPreferences.behaviorPatterns.companionPattern === 'friends' ? '👥 With Friends' : '🚶 Solo Explorer'}
          </Text>
        </View>

        <View style={styles.patternRow}>
          <Text style={styles.patternLabel}>Average Spend</Text>
          <Text style={styles.patternValue}>₹{userProfile.implicitPreferences.spendingHabits.averageSpend}</Text>
        </View>
      </View>
    </View>
  );

  const renderPreferencesCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Your Preferences</Text>
        <Settings size={20} color="#6b7280" />
      </View>
      <Text style={styles.subtitle}>Help us understand you better</Text>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Favorite Categories</Text>
        <View style={styles.chipsContainer}>
          {userProfile.explicitPreferences.favoriteCategories.map((category, index) => (
            <View key={index} style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{category}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Preferred Cuisines</Text>
        <View style={styles.chipsContainer}>
          {userProfile.explicitPreferences.preferredCuisines.map((cuisine, index) => (
            <View key={index} style={[styles.categoryChip, styles.cuisineChip]}>
              <Text style={styles.categoryChipText}>{cuisine}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Price Sensitivity</Text>
        <View style={styles.sensitivityBadge}>
          <Text style={styles.sensitivityText}>
            {getPriceSensitivityLabel(userProfile.explicitPreferences.priceSensitivity)}
          </Text>
        </View>
      </View>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Deal Responsiveness</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${userProfile.explicitPreferences.dealResponsiveness}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressLabel}>
          {userProfile.explicitPreferences.dealResponsiveness}% - You act on {userProfile.explicitPreferences.dealResponsiveness}% of deals you see
        </Text>
      </View>
    </View>
  );

  const renderDiscoveryProfileCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Discovery Profile 🗺️</Text>
      <Text style={styles.subtitle}>How you explore new experiences</Text>

      <View style={styles.discoveryMetric}>
        <View style={styles.discoveryHeader}>
          <Text style={styles.discoveryLabel}>Novelty Seeking</Text>
          <Text style={styles.discoveryScore}>
            {userProfile.implicitPreferences.discoveryPreferences.noveltySeeking}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              styles.noveltyFill,
              { width: `${userProfile.implicitPreferences.discoveryPreferences.noveltySeeking}%` }
            ]} 
          />
        </View>
        <Text style={styles.discoveryDescription}>
          {userProfile.implicitPreferences.discoveryPreferences.noveltySeeking > 70 
            ? 'You love trying new places!' 
            : 'You prefer familiar favorites'}
        </Text>
      </View>

      <View style={styles.discoveryMetric}>
        <View style={styles.discoveryHeader}>
          <Text style={styles.discoveryLabel}>Trend Following</Text>
          <Text style={styles.discoveryScore}>
            {userProfile.implicitPreferences.discoveryPreferences.trendFollowing}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              styles.trendFill,
              { width: `${userProfile.implicitPreferences.discoveryPreferences.trendFollowing}%` }
            ]} 
          />
        </View>
        <Text style={styles.discoveryDescription}>
          {userProfile.implicitPreferences.discoveryPreferences.trendFollowing > 70 
            ? 'You keep up with what\'s trending' 
            : 'You forge your own path'}
        </Text>
      </View>

      <View style={styles.discoveryMetric}>
        <View style={styles.discoveryHeader}>
          <Text style={styles.discoveryLabel}>Friend Influence</Text>
          <Text style={styles.discoveryScore}>
            {userProfile.implicitPreferences.discoveryPreferences.friendInfluence}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              styles.friendFill,
              { width: `${userProfile.implicitPreferences.discoveryPreferences.friendInfluence}%` }
            ]} 
          />
        </View>
        <Text style={styles.discoveryDescription}>
          {userProfile.implicitPreferences.discoveryPreferences.friendInfluence > 70 
            ? 'Friend recommendations matter to you' 
            : 'You make independent choices'}
        </Text>
      </View>
    </View>
  );

  const renderSocialInfluenceCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Social Influence 👥</Text>
      <Text style={styles.subtitle}>Your network's impact on your choices</Text>

      <View style={styles.socialMetric}>
        <Users size={24} color="#3b82f6" />
        <View style={styles.socialInfo}>
          <Text style={styles.socialLabel}>Closest Friends</Text>
          <Text style={styles.socialValue}>{userProfile.socialInfluence.closestFriends.length} connections</Text>
        </View>
      </View>

      <View style={styles.socialMetric}>
        <Heart size={24} color="#ec4899" />
        <View style={styles.socialInfo}>
          <Text style={styles.socialLabel}>Taste Makers</Text>
          <Text style={styles.socialValue}>{userProfile.socialInfluence.tasteMakers.length} influencers</Text>
        </View>
      </View>

      <View style={styles.socialMetric}>
        <Zap size={24} color="#f59e0b" />
        <View style={styles.socialInfo}>
          <Text style={styles.socialLabel}>Your Influence Score</Text>
          <Text style={styles.socialValue}>{userProfile.socialInfluence.influenceScore}/100</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.influenceDescription}>
        {userProfile.socialInfluence.influenceScore > 70 
          ? 'You\'re a trendsetter! Your friends often follow your recommendations.' 
          : 'You discover great places that inspire others.'}
      </Text>
    </View>
  );

  const renderAllArchetypes = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>All Personality Types</Text>
      <Text style={styles.subtitle}>Understand different explorer personalities</Text>

      {Object.entries(allArchetypes).map(([key, archetype]) => (
        <View 
          key={key} 
          style={[
            styles.archetypeOption,
            userProfile.personalityArchetype === key && styles.archetypeOptionActive
          ]}
        >
          <Text style={styles.archetypeOptionIcon}>{archetype.icon}</Text>
          <View style={styles.archetypeOptionInfo}>
            <Text style={styles.archetypeOptionName}>
              {archetype.name}
              {userProfile.personalityArchetype === key && ' (You)'}
            </Text>
            <Text style={styles.archetypeOptionDesc}>{archetype.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Brain size={24} color="#8b5cf6" />
          <Text style={styles.headerTitle}>AI Profile</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Your Archetype */}
        {renderArchetypeCard()}

        {/* Behavioral Insights */}
        {renderInsightsCard()}

        {/* Discovery Profile */}
        {renderDiscoveryProfileCard()}

        {/* Social Influence */}
        {renderSocialInfluenceCard()}

        {/* Your Preferences */}
        {renderPreferencesCard()}

        {/* All Archetypes */}
        {renderAllArchetypes()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your AI profile learns and evolves with every interaction
          </Text>
          <Text style={styles.footerSubtext}>
            Last updated: {new Date(userProfile.lastUpdated).toLocaleDateString()}
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
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  archetypeIcon: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  confidenceBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  traitChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  traitText: {
    fontSize: 12,
    color: '#4b5563',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  insightsList: {
    marginTop: 16,
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8b5cf6',
    marginTop: 6,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  behaviorPatterns: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  patternLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  patternValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  preferenceSection: {
    marginTop: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cuisineChip: {
    backgroundColor: '#fef3c7',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  sensitivityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sensitivityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  discoveryMetric: {
    marginBottom: 20,
  },
  discoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  discoveryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  discoveryScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  noveltyFill: {
    backgroundColor: '#8b5cf6',
  },
  trendFill: {
    backgroundColor: '#ec4899',
  },
  friendFill: {
    backgroundColor: '#10b981',
  },
  discoveryDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  socialMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  socialInfo: {
    flex: 1,
  },
  socialLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  socialValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  influenceDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 4,
  },
  archetypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f3f4f6',
    marginBottom: 12,
  },
  archetypeOptionActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  archetypeOptionIcon: {
    fontSize: 32,
  },
  archetypeOptionInfo: {
    flex: 1,
  },
  archetypeOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  archetypeOptionDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
