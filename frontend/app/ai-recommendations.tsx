import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, Sparkles, TrendingUp, Target, Clock, MapPin, 
  Heart, Users, Zap, Star, ChevronRight, Gift, Trophy
} from 'lucide-react-native';
import { 
  useAIPersonalizationStore, 
  getMoodEmoji,
  type PersonalizedDeal,
  type PersonalizedMission 
} from '../store/aiPersonalizationStore';

export default function AIRecommendationsScreen() {
  const router = useRouter();
  const {
    userProfile,
    generatePersonalizedContent,
    predictNextActions,
    trackAction,
    getArchetypeInfo,
  } = useAIPersonalizationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [content, setContent] = useState(generatePersonalizedContent());
  const [predictions, setPredictions] = useState(predictNextActions('today'));

  const archetypeInfo = getArchetypeInfo();

  useEffect(() => {
    loadPersonalizedContent();
  }, []);

  const loadPersonalizedContent = () => {
    const newContent = generatePersonalizedContent();
    const newPredictions = predictNextActions('today');
    setContent(newContent);
    setPredictions(newPredictions);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadPersonalizedContent();
      setRefreshing(false);
    }, 1000);
  };

  const handleDealTap = (deal: PersonalizedDeal) => {
    trackAction({
      type: 'deal_viewed',
      timestamp: new Date(),
      metadata: { dealId: deal.dealId },
      context: userProfile.currentContext,
    });
    // Navigate to deal details
  };

  const handleMissionTap = (mission: PersonalizedMission) => {
    trackAction({
      type: 'mission_started',
      timestamp: new Date(),
      metadata: { missionId: mission.missionId },
      context: userProfile.currentContext,
    });
    // Navigate to mission details
  };

  const renderGreeting = () => (
    <View style={styles.greetingCard}>
      <View style={styles.greetingHeader}>
        <View>
          <Text style={styles.greeting}>{content.greeting}</Text>
          <Text style={styles.contextMessage}>{content.contextMessage}</Text>
        </View>
        <View style={styles.moodBadge}>
          <Text style={styles.moodEmoji}>
            {getMoodEmoji(userProfile.currentContext.mood)}
          </Text>
        </View>
      </View>

      <View style={styles.archetypeBanner}>
        <Text style={styles.archetypeIcon}>{archetypeInfo.icon}</Text>
        <View style={styles.archetypeInfo}>
          <Text style={styles.archetypeLabel}>Your AI Profile</Text>
          <Text style={styles.archetypeName}>{archetypeInfo.name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewProfileButton}
          onPress={() => router.push('/ai-profile' as any)}
        >
          <Text style={styles.viewProfileText}>View</Text>
          <ChevronRight size={16} color="#8b5cf6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPredictions = () => {
    if (predictions.length === 0) return null;

    const prediction = predictions[0];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Sparkles size={20} color="#f59e0b" />
          <Text style={styles.cardTitle}>AI Prediction</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{prediction.confidence}%</Text>
          </View>
        </View>

        <View style={styles.predictionContent}>
          <Text style={styles.predictionTitle}>{prediction.nextLikelyActivity}</Text>
          <View style={styles.predictionTiming}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.predictionTimingText}>
              Best time: {prediction.optimalTiming.bestTime}
            </Text>
          </View>
          <Text style={styles.predictionReason}>{prediction.optimalTiming.reason}</Text>
        </View>
      </View>
    );
  };

  const renderPriorityDeals = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Target size={20} color="#3b82f6" />
        <Text style={styles.sectionTitle}>Perfect for You</Text>
        <Text style={styles.sectionBadge}>AI Ranked</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {content.priorityDeals.map((deal, index) => (
          <TouchableOpacity 
            key={deal.dealId} 
            style={styles.dealCard}
            onPress={() => handleDealTap(deal)}
          >
            <View style={styles.dealHeader}>
              <View style={styles.dealRank}>
                <Text style={styles.dealRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.relevanceScore}>
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.relevanceText}>{deal.relevanceScore}</Text>
              </View>
            </View>

            <Text style={styles.dealMerchant}>{deal.merchantName}</Text>
            <Text style={styles.dealTitle}>{deal.title}</Text>
            <View style={styles.dealDiscount}>
              <Gift size={16} color="#10b981" />
              <Text style={styles.dealDiscountText}>{deal.discount}</Text>
            </View>

            <View style={styles.dealReasons}>
              <Text style={styles.dealReasonsTitle}>Why for you:</Text>
              {deal.reasons.slice(0, 2).map((reason, idx) => (
                <View key={idx} style={styles.reasonItem}>
                  <View style={styles.reasonBullet} />
                  <Text style={styles.reasonText} numberOfLines={2}>{reason}</Text>
                </View>
              ))}
            </View>

            {deal.urgency && (
              <View style={styles.urgencyBadge}>
                <Zap size={12} color="#f59e0b" />
                <Text style={styles.urgencyText}>{deal.urgency}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSuggestedMissions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Trophy size={20} color="#8b5cf6" />
        <Text style={styles.sectionTitle}>Curated Missions</Text>
        <Text style={[styles.sectionBadge, styles.missionBadge]}>
          For {archetypeInfo.name}s
        </Text>
      </View>

      {content.suggestedMissions.map((mission, index) => (
        <TouchableOpacity 
          key={mission.missionId} 
          style={styles.missionCard}
          onPress={() => handleMissionTap(mission)}
        >
          <View style={styles.missionHeader}>
            <View style={[
              styles.difficultyBadge,
              mission.difficulty === 'easy' && styles.difficultyEasy,
              mission.difficulty === 'medium' && styles.difficultyMedium,
              mission.difficulty === 'hard' && styles.difficultyHard,
            ]}>
              <Text style={styles.difficultyText}>
                {mission.difficulty.toUpperCase()}
              </Text>
            </View>
            <View style={styles.missionScore}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.missionScoreText}>{mission.relevanceScore}</Text>
            </View>
          </View>

          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionDescription}>{mission.description}</Text>

          <View style={styles.missionMeta}>
            <View style={styles.missionTime}>
              <Clock size={14} color="#6b7280" />
              <Text style={styles.missionTimeText}>{mission.estimatedTime} min</Text>
            </View>
            <Text style={styles.missionCategory}>{mission.category}</Text>
          </View>

          <View style={styles.missionReasons}>
            {mission.reasons.slice(0, 2).map((reason, idx) => (
              <View key={idx} style={styles.reasonItem}>
                <View style={styles.reasonBullet} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSocialHighlights = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Users size={20} color="#ec4899" />
        <Text style={styles.sectionTitle}>Your Social Insights</Text>
      </View>

      <View style={styles.highlightsCard}>
        {content.socialHighlights.map((highlight, index) => (
          <View key={index} style={styles.highlightItem}>
            <TrendingUp size={16} color="#10b981" />
            <Text style={styles.highlightText}>{highlight}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMoodBasedSuggestions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Heart size={20} color="#ef4444" />
        <Text style={styles.sectionTitle}>
          Mood-Based Picks {getMoodEmoji(userProfile.currentContext.mood)}
        </Text>
      </View>

      <View style={styles.moodCard}>
        {content.moodBasedSuggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionChip}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </View>
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
          <Sparkles size={24} color="#8b5cf6" />
          <Text style={styles.headerTitle}>AI Recommendations</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Personalized Greeting */}
        {renderGreeting()}

        {/* AI Predictions */}
        {renderPredictions()}

        {/* Priority Deals */}
        {renderPriorityDeals()}

        {/* Suggested Missions */}
        {renderSuggestedMissions()}

        {/* Social Highlights */}
        {renderSocialHighlights()}

        {/* Mood-Based Suggestions */}
        {renderMoodBasedSuggestions()}

        <View style={styles.footer}>
          <Sparkles size={20} color="#8b5cf6" />
          <Text style={styles.footerText}>
            Recommendations update based on your behavior, context, and preferences
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
  },
  greetingCard: {
    backgroundColor: '#8b5cf6',
    padding: 20,
    margin: 20,
    marginBottom: 0,
    borderRadius: 20,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  contextMessage: {
    fontSize: 14,
    color: '#f3e8ff',
  },
  moodBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 24,
  },
  archetypeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  archetypeIcon: {
    fontSize: 32,
  },
  archetypeInfo: {
    flex: 1,
  },
  archetypeLabel: {
    fontSize: 11,
    color: '#f3e8ff',
    marginBottom: 2,
  },
  archetypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  confidenceBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  predictionContent: {
    gap: 8,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  predictionTiming: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  predictionTimingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  predictionReason: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
  },
  missionBadge: {
    backgroundColor: '#f3e8ff',
    color: '#8b5cf6',
  },
  dealCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginLeft: 20,
    marginRight: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dealRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  relevanceScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  relevanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  dealMerchant: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  dealDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dealDiscountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10b981',
  },
  dealReasons: {
    gap: 6,
    marginBottom: 8,
  },
  dealReasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  reasonBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8b5cf6',
    marginTop: 6,
  },
  reasonText: {
    flex: 1,
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f59e0b',
  },
  missionCard: {
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
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyEasy: {
    backgroundColor: '#d1fae5',
  },
  difficultyMedium: {
    backgroundColor: '#fef3c7',
  },
  difficultyHard: {
    backgroundColor: '#fee2e2',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065f46',
  },
  missionScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  missionScoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  missionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  missionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  missionTimeText: {
    fontSize: 13,
    color: '#6b7280',
  },
  missionCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8b5cf6',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  missionReasons: {
    gap: 6,
  },
  highlightsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  moodCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionChip: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 13,
    color: '#991b1b',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: 280,
  },
});
