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
import { useAdvancedAIStore } from '../store/advancedAIStore';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function MoodHistoryScreen() {
  const primaryColor = theme.colors.primary;
  
  const { profile, getMoodTrend } = useAdvancedAIStore();
  
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  
  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading mood history...</Text>
      </View>
    );
  }
  
  const hoursMap = { '24h': 24, '7d': 168, '30d': 720 };
  const moodHistory = getMoodTrend(hoursMap[timeRange]);
  
  const moodColors: Record<string, string> = {
    energetic: '#FF6B6B',
    relaxed: '#A78BFA',
    stressed: '#FFA94D',
    celebratory: '#FFD93D',
    adventurous: '#4ECDC4',
    focused: '#6BCF7F',
  };
  
  const moodIcons: Record<string, any> = {
    energetic: 'flash',
    relaxed: 'cafe',
    stressed: 'warning',
    celebratory: 'happy',
    adventurous: 'compass',
    focused: 'eye',
  };
  
  // Calculate mood distribution
  const moodCounts = moodHistory.reduce((acc, snapshot) => {
    acc[snapshot.mood] = (acc[snapshot.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalMoods = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
  
  const moodDistribution = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: totalMoods > 0 ? (count / totalMoods) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
  
  // Calculate average confidence
  const avgConfidence = moodHistory.length > 0
    ? moodHistory.reduce((sum, m) => sum + m.confidence, 0) / moodHistory.length
    : 0;
  
  // Get most frequent detection factors
  const factorCounts = moodHistory.reduce((acc, snapshot) => {
    snapshot.detectionFactors.forEach(factor => {
      acc[factor] = (acc[factor] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const topFactors = Object.entries(factorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
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
            <Text style={styles.headerTitle}>Mood History</Text>
            <Text style={styles.headerSubtitle}>
              {moodHistory.length} mood snapshots analyzed
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['24h', '7d', '30d'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && { backgroundColor: primaryColor },
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Current Mood */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Mood</Text>
          
          <View style={styles.currentMoodCard}>
            <View
              style={[
                styles.currentMoodIconContainer,
                { backgroundColor: `${moodColors[profile.currentMood.detectedMood]}20` },
              ]}
            >
              <Ionicons
                name={moodIcons[profile.currentMood.detectedMood]}
                size={48}
                color={moodColors[profile.currentMood.detectedMood]}
              />
            </View>
            <View style={styles.currentMoodInfo}>
              <Text style={styles.currentMoodName}>
                {profile.currentMood.detectedMood.charAt(0).toUpperCase() +
                  profile.currentMood.detectedMood.slice(1)}
              </Text>
              <Text style={styles.currentMoodConfidence}>
                {profile.currentMood.confidence.toFixed(0)}% confident
              </Text>
              <View style={styles.currentMoodFactors}>
                {profile.currentMood.detectionFactors.slice(0, 3).map((factor, idx) => (
                  <View key={idx} style={styles.factorTag}>
                    <Text style={styles.factorTagText}>
                      {factor.replace(/_/g, ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
        
        {/* Mood Distribution */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mood Distribution</Text>
          <Text style={styles.subtitle}>
            How you've felt over the past {timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : '30 days'}
          </Text>
          
          {moodDistribution.map(({ mood, count, percentage }) => (
            <View key={mood} style={styles.moodDistributionRow}>
              <View style={styles.moodDistributionLeft}>
                <View
                  style={[
                    styles.moodDistributionIcon,
                    { backgroundColor: `${moodColors[mood]}20` },
                  ]}
                >
                  <Ionicons name={moodIcons[mood]} size={20} color={moodColors[mood]} />
                </View>
                <Text style={styles.moodDistributionName}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </Text>
              </View>
              
              <View style={styles.moodDistributionRight}>
                <View style={styles.moodDistributionBarContainer}>
                  <View
                    style={[
                      styles.moodDistributionBar,
                      { width: `${percentage}%`, backgroundColor: moodColors[mood] },
                    ]}
                  />
                </View>
                <Text style={styles.moodDistributionPercentage}>
                  {percentage.toFixed(0)}%
                </Text>
                <Text style={styles.moodDistributionCount}>({count})</Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Mood Statistics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={32} color="#6BCF7F" />
              <Text style={styles.statValue}>{avgConfidence.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Avg. Confidence</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="analytics" size={32} color="#4ECDC4" />
              <Text style={styles.statValue}>{moodHistory.length}</Text>
              <Text style={styles.statLabel}>Total Snapshots</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons
                name={moodIcons[moodDistribution[0]?.mood || 'relaxed']}
                size={32}
                color={moodColors[moodDistribution[0]?.mood || 'relaxed']}
              />
              <Text style={styles.statValue}>
                {moodDistribution[0]?.mood.charAt(0).toUpperCase() +
                  (moodDistribution[0]?.mood.slice(1) || '')}
              </Text>
              <Text style={styles.statLabel}>Most Common</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={32} color="#FFD93D" />
              <Text style={styles.statValue}>
                {moodDistribution[0]?.percentage.toFixed(0) || 0}%
              </Text>
              <Text style={styles.statLabel}>Dominance</Text>
            </View>
          </View>
        </View>
        
        {/* Top Detection Factors */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Top Detection Factors</Text>
          <Text style={styles.subtitle}>
            What influences your mood the most
          </Text>
          
          {topFactors.map(([factor, count], idx) => (
            <View key={factor} style={styles.factorRow}>
              <View style={styles.factorRank}>
                <Text style={styles.factorRankText}>{idx + 1}</Text>
              </View>
              <View style={styles.factorInfo}>
                <Text style={styles.factorName}>
                  {factor.replace(/_/g, ' ').charAt(0).toUpperCase() +
                    factor.replace(/_/g, ' ').slice(1)}
                </Text>
                <View style={styles.factorBarContainer}>
                  <View
                    style={[
                      styles.factorBar,
                      {
                        width: `${(count / moodHistory.length) * 100}%`,
                        backgroundColor: primaryColor,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.factorCount}>{count}</Text>
            </View>
          ))}
        </View>
        
        {/* Mood Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mood Timeline</Text>
          <Text style={styles.subtitle}>Recent mood changes</Text>
          
          <View style={styles.timeline}>
            {moodHistory.slice(0, 20).map((snapshot, idx) => {
              const date = new Date(snapshot.timestamp);
              const timeStr = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });
              const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              
              return (
                <View key={snapshot.timestamp} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: moodColors[snapshot.mood] },
                      ]}
                    />
                    {idx < moodHistory.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <View style={styles.timelineMoodInfo}>
                        <Ionicons
                          name={moodIcons[snapshot.mood]}
                          size={20}
                          color={moodColors[snapshot.mood]}
                        />
                        <Text style={styles.timelineMoodName}>
                          {snapshot.mood.charAt(0).toUpperCase() + snapshot.mood.slice(1)}
                        </Text>
                        <View
                          style={[
                            styles.timelineConfidenceBadge,
                            { backgroundColor: `${moodColors[snapshot.mood]}20` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.timelineConfidenceText,
                              { color: moodColors[snapshot.mood] },
                            ]}
                          >
                            {snapshot.confidence.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.timelineTime}>
                        {timeStr}
                        {'\n'}
                        <Text style={styles.timelineDate}>{dateStr}</Text>
                      </Text>
                    </View>
                    
                    <View style={styles.timelineFactors}>
                      {snapshot.detectionFactors.map((factor, fIdx) => (
                        <View key={fIdx} style={styles.timelineFactorTag}>
                          <Text style={styles.timelineFactorText}>
                            {factor.replace(/_/g, ' ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    {snapshot.context && (
                      <Text style={styles.timelineContext}>
                        <Ionicons name="location" size={12} color="#999" /> {snapshot.context}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          
          {moodHistory.length > 20 && (
            <Text style={styles.timelineMore}>
              + {moodHistory.length - 20} more mood snapshots
            </Text>
          )}
          
          {moodHistory.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="timer-outline" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>No mood history yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your mood will be tracked as you use the app
              </Text>
            </View>
          )}
        </View>
        
        {/* Insights */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mood Insights</Text>
          
          <View style={styles.insightCard}>
            <Ionicons name="bulb" size={24} color="#FFD93D" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Pattern Detected</Text>
              <Text style={styles.insightText}>
                You tend to feel more{' '}
                <Text style={{ fontWeight: '600', color: moodColors[moodDistribution[0]?.mood || 'relaxed'] }}>
                  {moodDistribution[0]?.mood || 'relaxed'}
                </Text>{' '}
                during this time period. We'll optimize your recommendations accordingly.
              </Text>
            </View>
          </View>
          
          {avgConfidence > 70 && (
            <View style={styles.insightCard}>
              <Ionicons name="checkmark-circle" size={24} color="#6BCF7F" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>High Accuracy</Text>
                <Text style={styles.insightText}>
                  Our mood detection is {avgConfidence.toFixed(0)}% confident on average.
                  This helps us provide better personalized experiences.
                </Text>
              </View>
            </View>
          )}
          
          {topFactors.length > 0 && (
            <View style={styles.insightCard}>
              <Ionicons name="analytics" size={24} color="#4ECDC4" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Key Factor</Text>
                <Text style={styles.insightText}>
                  <Text style={{ fontWeight: '600' }}>
                    {topFactors[0][0].replace(/_/g, ' ').charAt(0).toUpperCase() +
                      topFactors[0][0].replace(/_/g, ' ').slice(1)}
                  </Text>{' '}
                  is the strongest predictor of your mood, appearing in{' '}
                  {((topFactors[0][1] / moodHistory.length) * 100).toFixed(0)}% of detections.
                </Text>
              </View>
            </View>
          )}
        </View>
        
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  
  // Time Range
  timeRangeContainer: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 8,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#FFF',
  },
  
  // Card
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
  },
  
  // Current Mood
  currentMoodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  currentMoodIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentMoodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  currentMoodName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  currentMoodConfidence: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  currentMoodFactors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  factorTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  factorTagText: {
    fontSize: 10,
    color: '#666',
    textTransform: 'capitalize',
  },
  
  // Mood Distribution
  moodDistributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodDistributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  moodDistributionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  moodDistributionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  moodDistributionRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodDistributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  moodDistributionBar: {
    height: '100%',
    borderRadius: 4,
  },
  moodDistributionPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    width: 40,
    textAlign: 'right',
  },
  moodDistributionCount: {
    fontSize: 12,
    color: '#999',
    width: 30,
  },
  
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Detection Factors
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  factorRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  factorRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  factorInfo: {
    flex: 1,
  },
  factorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  factorBarContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorBar: {
    height: '100%',
    borderRadius: 3,
  },
  factorCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginLeft: 12,
    width: 32,
    textAlign: 'right',
  },
  
  // Timeline
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 8,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineMoodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  timelineMoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timelineConfidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timelineConfidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  timelineDate: {
    fontSize: 10,
    color: '#999',
  },
  timelineFactors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  timelineFactorTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
  },
  timelineFactorText: {
    fontSize: 10,
    color: '#666',
    textTransform: 'capitalize',
  },
  timelineContext: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  timelineMore: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // Empty State
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
  
  // Insights
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  bottomSpacer: {
    height: 32,
  },
});
