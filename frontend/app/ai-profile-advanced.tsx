import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdvancedAIStore } from '../store/advancedAIStore';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function AdvancedAIProfileScreen() {
  const primaryColor = theme.colors.primary;
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    profile,
    initializeProfile,
    getArchetypeScores,
    getDominantArchetype,
    getProfileSummary,
    detectMood,
    predictNextActivity,
    generateInsights,
    analyzeAndLearn,
  } = useAdvancedAIStore();
  
  useEffect(() => {
    if (!profile) {
      initializeProfile('user_001');
    }
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    analyzeAndLearn();
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Initializing AI Profile...</Text>
      </View>
    );
  }
  
  const archetypeScores = getArchetypeScores();
  const dominantArchetype = getDominantArchetype();
  const summary = getProfileSummary();
  const prediction = predictNextActivity();
  const insights = generateInsights();
  
  const archetypeColors: Record<string, string> = {
    explorer: '#FF6B6B',
    foodie: '#FFA94D',
    socializer: '#FFD93D',
    planner: '#6BCF7F',
    adventurer: '#4ECDC4',
    relaxer: '#A78BFA',
  };
  
  const archetypeIcons: Record<string, any> = {
    explorer: 'compass',
    foodie: 'restaurant',
    socializer: 'people',
    planner: 'calendar',
    adventurer: 'rocket',
    relaxer: 'leaf',
  };
  
  const moodIcons: Record<string, any> = {
    energetic: 'flash',
    relaxed: 'cafe',
    stressed: 'warning',
    celebratory: 'happy',
    adventurous: 'compass',
    focused: 'eye',
  };
  
  const moodColors: Record<string, string> = {
    energetic: '#FF6B6B',
    relaxed: '#A78BFA',
    stressed: '#FFA94D',
    celebratory: '#FFD93D',
    adventurous: '#4ECDC4',
    focused: '#6BCF7F',
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[primaryColor, `${primaryColor}CC`]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Your AI Profile</Text>
            <Text style={styles.headerSubtitle}>Instagram-level understanding</Text>
          </View>
          <TouchableOpacity onPress={() => analyzeAndLearn()} style={styles.analyzeButton}>
            <Ionicons name="sync" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Profile Overview</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="person" size={24} color={primaryColor} />
              <Text style={styles.summaryLabel}>Archetype</Text>
              <Text style={styles.summaryValue}>{dominantArchetype}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name={moodIcons[profile.currentMood.detectedMood]} size={24} color={moodColors[profile.currentMood.detectedMood]} />
              <Text style={styles.summaryLabel}>Mood</Text>
              <Text style={styles.summaryValue}>{profile.currentMood.detectedMood}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="trending-up" size={24} color="#6BCF7F" />
              <Text style={styles.summaryLabel}>Accuracy</Text>
              <Text style={styles.summaryValue}>
                {profile.learningMetrics.recommendationAccuracy.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>
        
        {/* Behavioral Archetypes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Behavioral Archetypes</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.archetypesContainer}>
            {Object.entries(archetypeScores).map(([archetype, score]) => {
              const color = archetypeColors[archetype];
              const icon = archetypeIcons[archetype];
              const isDominant = archetype === dominantArchetype;
              
              return (
                <View key={archetype} style={styles.archetypeItem}>
                  <View style={styles.archetypeHeader}>
                    <View style={styles.archetypeIconContainer}>
                      <Ionicons name={icon} size={20} color={color} />
                      {isDominant && (
                        <View style={[styles.dominantBadge, { backgroundColor: color }]}>
                          <Ionicons name="star" size={10} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <View style={styles.archetypeInfo}>
                      <Text style={styles.archetypeName}>
                        {archetype.charAt(0).toUpperCase() + archetype.slice(1)}
                      </Text>
                      <Text style={styles.archetypeScore}>{score.toFixed(0)}%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${score}%`, backgroundColor: color },
                        ]}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.archetypeTraits}>
                    {profile.archetypes[archetype as keyof typeof profile.archetypes].traits.map(
                      (trait, idx) => (
                        <View key={idx} style={[styles.traitBadge, { borderColor: color }]}>
                          <Text style={[styles.traitText, { color }]}>{trait}</Text>
                        </View>
                      )
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Current Mood Analysis */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Mood Detection</Text>
          
          <View style={styles.moodCard}>
            <View style={styles.moodHeader}>
              <View style={[styles.moodIconLarge, { backgroundColor: `${moodColors[profile.currentMood.detectedMood]}20` }]}>
                <Ionicons
                  name={moodIcons[profile.currentMood.detectedMood]}
                  size={40}
                  color={moodColors[profile.currentMood.detectedMood]}
                />
              </View>
              <View style={styles.moodInfo}>
                <Text style={styles.moodTitle}>
                  {profile.currentMood.detectedMood.charAt(0).toUpperCase() + 
                   profile.currentMood.detectedMood.slice(1)}
                </Text>
                <Text style={styles.moodConfidence}>
                  {profile.currentMood.confidence.toFixed(0)}% confident
                </Text>
              </View>
            </View>
            
            <Text style={styles.detectionFactorsTitle}>Detection Factors:</Text>
            <View style={styles.detectionFactors}>
              {profile.currentMood.detectionFactors.map((factor, idx) => (
                <View key={idx} style={styles.factorBadge}>
                  <Text style={styles.factorText}>
                    {factor.replace(/_/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
            
            {profile.currentMood.moodHistory.length > 0 && (
              <TouchableOpacity
                style={styles.moodHistoryButton}
                onPress={() => router.push('/mood-history' as any)}
              >
                <Text style={styles.moodHistoryButtonText}>View Mood History</Text>
                <Ionicons name="chevron-forward" size={16} color={primaryColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Predictive Behavior */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Behavior Predictions</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{prediction.confidence}% confident</Text>
            </View>
          </View>
          
          <View style={styles.predictionCard}>
            <View style={styles.predictionRow}>
              <Ionicons name="star" size={20} color="#FFD93D" />
              <View style={styles.predictionInfo}>
                <Text style={styles.predictionLabel}>Next Activity</Text>
                <Text style={styles.predictionValue}>{prediction.nextLikelyActivity}</Text>
              </View>
            </View>
            
            <View style={styles.predictionRow}>
              <Ionicons name="time" size={20} color="#6BCF7F" />
              <View style={styles.predictionInfo}>
                <Text style={styles.predictionLabel}>Optimal Timing</Text>
                <Text style={styles.predictionValue}>{prediction.optimalTiming}</Text>
              </View>
            </View>
            
            <View style={styles.predictionRow}>
              <Ionicons name="people" size={20} color="#4ECDC4" />
              <View style={styles.predictionInfo}>
                <Text style={styles.predictionLabel}>Preferred Companions</Text>
                <Text style={styles.predictionValue}>
                  {prediction.preferredCompanions === 0
                    ? 'Solo'
                    : prediction.preferredCompanions === 1
                    ? 'One friend'
                    : `${prediction.preferredCompanions}+ people`}
                </Text>
              </View>
            </View>
            
            <View style={styles.predictionRow}>
              <Ionicons name="cash" size={20} color="#FFA94D" />
              <View style={styles.predictionInfo}>
                <Text style={styles.predictionLabel}>Budget Range</Text>
                <Text style={styles.predictionValue}>
                  ₹{prediction.budgetRange[0]} - ₹{prediction.budgetRange[1]}
                </Text>
              </View>
            </View>
          </View>
          
          {prediction.alternativePredictions.length > 0 && (
            <>
              <Text style={styles.alternativesTitle}>Alternative Predictions:</Text>
              {prediction.alternativePredictions.map((alt, idx) => (
                <View key={idx} style={styles.alternativePrediction}>
                  <Text style={styles.alternativeActivity}>{alt.activity}</Text>
                  <Text style={styles.alternativeConfidence}>{alt.confidence}%</Text>
                </View>
              ))}
            </>
          )}
        </View>
        
        {/* Journey Patterns */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Journey Patterns</Text>
            <TouchableOpacity onPress={() => router.push('/ai-profile-advanced' as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {profile.journeyPatterns.typicalSequences.length > 0 ? (
            <>
              {profile.journeyPatterns.typicalSequences.slice(0, 3).map((seq, idx) => (
                <View key={idx} style={styles.journeyCard}>
                  <View style={styles.journeyHeader}>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>×{seq.frequency}</Text>
                    </View>
                    <Text style={styles.journeyDays}>{seq.typicalDays.join(', ')}</Text>
                  </View>
                  
                  <View style={styles.sequenceFlow}>
                    {seq.sequence.map((activity, actIdx) => (
                      <React.Fragment key={actIdx}>
                        <View style={styles.activityBubble}>
                          <Text style={styles.activityText}>{activity}</Text>
                        </View>
                        {actIdx < seq.sequence.length - 1 && (
                          <Ionicons name="arrow-forward" size={16} color="#CCC" />
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                  
                  <Text style={styles.journeyDuration}>
                    Avg. duration: {Math.floor(seq.averageDuration / 60)}h {seq.averageDuration % 60}m
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>No journey patterns detected yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Keep using the app to discover your typical activity sequences
              </Text>
            </View>
          )}
        </View>
        
        {/* Discovery Preferences */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Discovery Preferences</Text>
          
          <View style={styles.preferenceSliders}>
            <PreferenceSlider
              label="Novelty vs Familiarity"
              value={profile.journeyPatterns.discoveryPreferences.noveltyVsFamiliarity}
              leftLabel="Familiar"
              rightLabel="New"
              color="#4ECDC4"
            />
            <PreferenceSlider
              label="Impulse vs Planning"
              value={profile.journeyPatterns.discoveryPreferences.impulseVsPlanning}
              leftLabel="Impulsive"
              rightLabel="Planner"
              color="#A78BFA"
            />
            <PreferenceSlider
              label="Research Depth"
              value={profile.journeyPatterns.discoveryPreferences.researchDepth}
              leftLabel="Quick"
              rightLabel="Thorough"
              color="#FFD93D"
            />
            <PreferenceSlider
              label="Risk Tolerance"
              value={profile.journeyPatterns.discoveryPreferences.riskTolerance}
              leftLabel="Safe"
              rightLabel="Adventurous"
              color="#FF6B6B"
            />
            <PreferenceSlider
              label="Price vs Experience"
              value={profile.journeyPatterns.discoveryPreferences.priceVsExperience}
              leftLabel="Price"
              rightLabel="Experience"
              color="#FFA94D"
            />
          </View>
        </View>
        
        {/* Proactive Insights */}
        {insights.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Proactive Insights</Text>
              <View style={styles.insightCountBadge}>
                <Text style={styles.insightCountText}>{insights.length}</Text>
              </View>
            </View>
            
            {insights.slice(0, 3).map((insight) => (
              <View key={insight.id} style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Ionicons
                    name={
                      insight.type === 'opportunity' ? 'bulb' :
                      insight.type === 'pattern_detected' ? 'analytics' :
                      insight.type === 'preference_shift' ? 'trending-up' :
                      'alert-circle'
                    }
                    size={24}
                    color={
                      insight.type === 'opportunity' ? '#FFD93D' :
                      insight.type === 'pattern_detected' ? '#4ECDC4' :
                      insight.type === 'preference_shift' ? '#6BCF7F' :
                      '#FFA94D'
                    }
                  />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightMessage}>{insight.message}</Text>
                    <Text style={styles.insightDetails}>{insight.details}</Text>
                  </View>
                </View>
                
                {insight.actionable && (
                  <View style={styles.insightActions}>
                    {insight.suggestedActions.slice(0, 2).map((action, idx) => (
                      <TouchableOpacity key={idx} style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>{action}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
            
            {insights.length > 3 && (
              <TouchableOpacity style={styles.viewAllInsightsButton}>
                <Text style={styles.viewAllInsightsText}>
                  View All {insights.length} Insights
                </Text>
                <Ionicons name="chevron-forward" size={16} color={primaryColor} />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Learning Metrics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Learning Quality</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {profile.learningMetrics.recommendationAccuracy.toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>Recommendation Accuracy</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {profile.learningMetrics.profileCompleteness.toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>Profile Completeness</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {profile.learningMetrics.dataPoints}
              </Text>
              <Text style={styles.metricLabel}>Data Points</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {summary.learningQuality}
              </Text>
              <Text style={styles.metricLabel}>Overall Quality</Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: primaryColor }]}
            onPress={() => router.push('/smart-recommendations' as any)}
          >
            <Ionicons name="sparkles" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Get Personalized Recommendations</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/ai-profile-advanced' as any)}
          >
            <Ionicons name="settings" size={20} color={primaryColor} />
            <Text style={[styles.secondaryButtonText, { color: primaryColor }]}>
              AI Settings & Privacy
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// Preference Slider Component
function PreferenceSlider({
  label,
  value,
  leftLabel,
  rightLabel,
  color,
}: {
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
  color: string;
}) {
  return (
    <View style={styles.preferenceSlider}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderEndLabel}>{leftLabel}</Text>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${value}%`, backgroundColor: color }]} />
          <View style={[styles.sliderThumb, { left: `${value}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.sliderEndLabel}>{rightLabel}</Text>
      </View>
      <Text style={styles.preferenceValue}>{value.toFixed(0)}/100</Text>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginTop: 2,
  },
  analyzeButton: {
    padding: 8,
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
  
  // Summary Card
  summaryCard: {
    backgroundColor: '#FFF',
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  
  // Cards
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Archetypes
  archetypesContainer: {
    gap: 16,
  },
  archetypeItem: {
    marginBottom: 8,
  },
  archetypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  archetypeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dominantBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archetypeInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  archetypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  archetypeScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  archetypeTraits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Mood
  moodCard: {
    marginTop: 8,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  moodTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  moodConfidence: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detectionFactorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  detectionFactors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  factorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  factorText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  moodHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  moodHistoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },
  
  // Predictions
  predictionCard: {
    gap: 16,
    marginBottom: 16,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  predictionLabel: {
    fontSize: 12,
    color: '#666',
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  alternativesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  alternativePrediction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  alternativeActivity: {
    fontSize: 14,
    color: '#333',
  },
  alternativeConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  // Journey Patterns
  journeyCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  journeyDays: {
    fontSize: 12,
    color: '#666',
  },
  sequenceFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  activityBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activityText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  journeyDuration: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Preference Sliders
  preferenceSliders: {
    gap: 20,
  },
  preferenceSlider: {
    marginBottom: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderEndLabel: {
    fontSize: 12,
    color: '#999',
    width: 60,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -5,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 2,
  },
  preferenceValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  
  // Insights
  insightCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFD93D',
  },
  insightCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  insightCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  insightDetails: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  insightActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  viewAllInsightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  viewAllInsightsText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },
  
  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Action Buttons
  actionButtonsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  bottomSpacer: {
    height: 32,
  },
});
