import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdvancedAIStore, SmartRecommendation } from '../store/advancedAIStore';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function SmartRecommendationsScreen() {
  const primaryColor = theme.colors.primary;
  
  const {
    profile,
    recordRecommendationOutcome,
    detectMood,
    updateContext,
  } = useAdvancedAIStore();
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'merchant' | 'mission' | 'deal' | 'journey' | 'social'>('all');
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  
  useEffect(() => {
    if (profile) {
      updateContext({
        timeContext: getTimeContext(),
        socialContext: 'solo',
      });
      detectMood();
      loadRecommendations();
    }
  }, [profile, selectedFilter]);
  
  const loadRecommendations = () => {
    if (!profile) return;
    const sampleRecs = generateSampleRecommendations();
    const filtered = selectedFilter === 'all' 
      ? sampleRecs 
      : sampleRecs.filter(r => r.type === selectedFilter);
    setRecommendations(filtered);
  };
  
  const getTimeContext = (): 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'late_night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    if (hour >= 22 || hour < 2) return 'night';
    return 'late_night';
  };
  
  const generateSampleRecommendations = (): SmartRecommendation[] => {
    if (!profile) return [];
    
    const mood = profile.currentMood.detectedMood;
    const dominantArchetype = profile.dominantArchetype;
    const timeContext = getTimeContext();
    const prediction = profile.behaviorPredictions;
    
    const recs: SmartRecommendation[] = [];
    
    // Generate contextual recommendations
    if (dominantArchetype === 'foodie') {
      recs.push({
        id: 'merchant_1',
        type: 'merchant',
        title: 'Bombay Brasserie - New Menu Launch',
        description: 'Award-winning chef introducing fusion cuisine. Perfect for food enthusiasts.',
        reasoning: [
          'Matches your foodie archetype (92% score)',
          'Premium dining experience preference detected',
          `Optimal timing for ${timeContext} exploration`,
        ],
        relevanceScore: 94,
        urgency: 'high',
        moodAlignment: mood === 'adventurous' ? 95 : 80,
        timing: {
          optimal: timeContext === 'evening' ? 'Tonight 7-9 PM' : 'This weekend evening',
          window: [Date.now(), Date.now() + 7 * 24 * 60 * 60 * 1000],
        },
        context: {
          mood,
          archetypes: ['foodie', 'explorer'],
          predictedFit: 94,
        },
        metadata: {
          cuisine: 'Fusion',
          priceRange: '₹₹₹',
          distance: '2.3 km',
          rating: 4.8,
        },
      });
    }
    
    recs.push({
      id: 'mission_1',
      type: 'mission',
      title: '3 Café Challenge - Coffee Explorer',
      description: 'Visit 3 unique cafés in one week. Earn 500 coins + free coffee voucher.',
      reasoning: [
        'Matches your typical journey patterns',
        `${timeContext === 'morning' ? 'Perfect timing for morning ritual' : 'Aligns with coffee preferences'}`,
        'Discovery preference: trying new places',
      ],
      relevanceScore: 85,
      urgency: 'medium',
      moodAlignment: 80,
      timing: {
        optimal: 'Start tomorrow morning',
        window: [Date.now(), Date.now() + 7 * 24 * 60 * 60 * 1000],
      },
      context: {
        mood,
        archetypes: ['explorer', 'foodie'],
        predictedFit: 85,
      },
      metadata: {
        reward: '500 coins + free coffee',
        difficulty: 'Easy',
        duration: '7 days',
      },
    });
    
    return recs.sort((a, b) => b.relevanceScore - a.relevanceScore);
  };
  
  const handleAcceptRecommendation = (rec: SmartRecommendation) => {
    recordRecommendationOutcome(rec.id, true);
    if (rec.type === 'mission') {
      router.push('/(tabs)' as any);
    } else if (rec.type === 'deal') {
      router.push('/(tabs)' as any);
    }
  };
  
  const handleRejectRecommendation = (rec: SmartRecommendation) => {
    recordRecommendationOutcome(rec.id, false);
    setRecommendations(prev => prev.filter(r => r.id !== rec.id));
  };
  
  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  const urgencyColors = {
    low: '#6BCF7F',
    medium: '#FFD93D',
    high: '#FFA94D',
    critical: '#FF6B6B',
  };
  
  const typeIcons: Record<SmartRecommendation['type'], any> = {
    merchant: 'storefront',
    mission: 'flag',
    deal: 'pricetag',
    journey: 'map',
    social: 'people',
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient colors={[primaryColor, `${primaryColor}CC`]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Smart Recommendations</Text>
            <Text style={styles.headerSubtitle}>{recommendations.length} personalized for you</Text>
          </View>
        </View>
        
        <View style={styles.contextBar}>
          <View style={styles.contextItem}>
            <Ionicons name="person" size={16} color="#FFF" />
            <Text style={styles.contextText}>{profile.dominantArchetype}</Text>
          </View>
          <View style={styles.contextItem}>
            <Ionicons name="happy" size={16} color="#FFF" />
            <Text style={styles.contextText}>{profile.currentMood.detectedMood}</Text>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'merchant', 'mission', 'deal', 'journey', 'social'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, selectedFilter === filter && { backgroundColor: primaryColor }]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterTabText, selectedFilter === filter && styles.filterTabTextActive]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {recommendations.map((rec) => (
          <View key={rec.id} style={styles.card}>
            <View style={styles.recHeader}>
              <View style={styles.recHeaderLeft}>
                <View style={[styles.recTypeIcon, { backgroundColor: `${urgencyColors[rec.urgency]}20` }]}>
                  <Ionicons name={typeIcons[rec.type]} size={20} color={urgencyColors[rec.urgency]} />
                </View>
                <Text style={styles.recType}>{rec.type.toUpperCase()}</Text>
              </View>
              <View style={[styles.urgencyBadge, { backgroundColor: urgencyColors[rec.urgency] }]}>
                <Text style={styles.urgencyText}>{rec.urgency.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.recTitle}>{rec.title}</Text>
            <Text style={styles.recDescription}>{rec.description}</Text>
            
            <View style={styles.reasoningContainer}>
              <Text style={styles.reasoningTitle}>Why this?</Text>
              {rec.reasoning.map((reason, idx) => (
                <Text key={idx} style={styles.reasoningText}>• {reason}</Text>
              ))}
            </View>
            
            <View style={styles.recActions}>
              <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectRecommendation(rec)}>
                <Text style={styles.rejectButtonText}>Not Interested</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.acceptButton, { backgroundColor: primaryColor }]}
                onPress={() => handleAcceptRecommendation(rec)}
              >
                <Text style={styles.acceptButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFFCC',
  },
  contextBar: {
    flexDirection: 'row',
    gap: 12,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF30',
  },
  contextText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'capitalize',
  },
  filterContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  recTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  recDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  reasoningContainer: {
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    marginBottom: 16,
  },
  reasoningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  recActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  acceptButton: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomSpacer: {
    height: 32,
  },
});
