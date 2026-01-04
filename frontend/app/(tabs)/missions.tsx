import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  Trophy,
  Target,
  CheckCircle2,
  Circle,
  ChevronRight,
  Star,
  Clock,
  Award,
  Zap,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppTheme } from '@/store/themeStore';
import { useMissionStore, Mission, MissionStep } from '@/store/missionStore';
import { useUserStore } from '@/store/userStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

export default function MissionsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const { gamification } = useUserStore();
  const {
    missions,
    activeMissions,
    totalPoints,
    initializeMissions,
    startMission,
    completeStep,
    claimReward,
    getRecommendedMissions,
  } = useMissionStore();

  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    console.log('[MissionsScreen] MOUNTED - Initializing missions');
    // Always initialize missions for demo - no rank requirement
    initializeMissions();
    return () => console.log('[MissionsScreen] UNMOUNTED');
  }, []);

  const recommendedMissions = getRecommendedMissions();

  const handleStartMission = (missionId: string) => {
    startMission(missionId);
  };

  const handleStepPress = (mission: Mission, step: MissionStep) => {
    if (step.completed) return;

    if (step.deepLink) {
      router.push(step.deepLink as any);
    } else {
      Alert.alert(
        'Complete Step',
        'Visit the location and scan the QR code to complete this step.',
        [{ text: 'Got it' }]
      );
    }
  };

  const handleClaimReward = (mission: Mission) => {
    claimReward(mission.id);
    setShowCelebration(true);

    Animated.sequence([
      Animated.spring(celebrationAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.delay(2000),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowCelebration(false));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#2ECC71';
      case 'medium':
        return '#F39C12';
      case 'hard':
        return '#E74C3C';
      default:
        return theme.colors.textSecondary;
    }
  };

  const MissionCard = ({ mission }: { mission: Mission }) => {
    const isActive = mission.startedAt && !mission.completed;
    const isCompleted = mission.completed;

    return (
      <TouchableOpacity
        style={[
          styles.missionCard,
          !!isActive && styles.missionCardActive,
          isCompleted && styles.missionCardCompleted,
        ]}
        activeOpacity={0.9}
        onPress={() => setSelectedMission(mission)}>
        {/* Category Badge */}
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: `${mission.categoryColor}20` },
          ]}>
          <Text style={[styles.categoryText, { color: mission.categoryColor }]}>
            {mission.category.toUpperCase()}
          </Text>
          <View
            style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(mission.difficulty) }]}
          />
        </View>

        {/* Mission Title */}
        <Text style={styles.missionTitle}>{mission.title}</Text>
        <Text style={styles.missionDescription}>{mission.description}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${mission.progress}%`,
                  backgroundColor: mission.categoryColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(mission.progress)}%</Text>
        </View>

        {/* Steps Preview */}
        <View style={styles.stepsPreview}>
          {mission.steps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.stepDot,
                step.completed && styles.stepDotCompleted,
              ]}>
              {step.completed ? (
                <CheckCircle2 size={16} color={mission.categoryColor} />
              ) : (
                <Circle size={16} color={theme.colors.textTertiary} />
              )}
            </View>
          ))}
        </View>

        {/* Rewards */}
        <View style={styles.rewardsRow}>
          <View style={styles.rewardItem}>
            <Star size={16} color="#F39C12" fill="#F39C12" />
            <Text style={styles.rewardText}>{mission.reward} pts</Text>
          </View>
          <View style={styles.rewardItem}>
            <Zap size={16} color={theme.colors.primary} />
            <Text style={styles.rewardText}>₹{mission.estimatedSavings}</Text>
          </View>
          <View style={styles.rewardItem}>
            <Clock size={16} color={theme.colors.textSecondary} />
            <Text style={styles.rewardText}>{mission.timeEstimate}</Text>
          </View>
        </View>

        {/* Action Button */}
        {!isActive && !isCompleted && (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: mission.categoryColor }]}
            onPress={() => handleStartMission(mission.id)}>
            <Text style={styles.startButtonText}>Start Mission</Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {isActive && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setSelectedMission(mission)}>
            <Text style={styles.continueButtonText}>Continue →</Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => handleClaimReward(mission)}>
            <Trophy size={18} color="#F39C12" />
            <Text style={styles.claimButtonText}>Claim Reward</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const MissionDetailModal = ({ mission }: { mission: Mission }) => {
    return (
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedMission(null)}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{mission.title}</Text>
            <TouchableOpacity onPress={() => setSelectedMission(null)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalDescription}>{mission.description}</Text>

            {/* Steps List */}
            <View style={styles.stepsList}>
              {mission.steps.map((step, index) => (
                <TouchableOpacity
                  key={step.id}
                  style={styles.stepCard}
                  onPress={() => handleStepPress(mission, step)}
                  disabled={step.completed}>
                  <View style={styles.stepNumber}>
                    {step.completed ? (
                      <CheckCircle2 size={24} color={mission.categoryColor} />
                    ) : (
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepInstructions,
                        step.completed && styles.stepInstructionsCompleted,
                      ]}>
                      {step.instructions}
                    </Text>
                    <Text style={styles.stepType}>{step.type.toUpperCase()}</Text>
                  </View>
                  {!step.completed && step.actionRequired && (
                    <ChevronRight size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Mission Rewards */}
            <View style={styles.modalRewards}>
              <Text style={styles.modalRewardsTitle}>Rewards</Text>
              <View style={styles.modalRewardsGrid}>
                <View style={styles.modalRewardCard}>
                  <Star size={24} color="#F39C12" fill="#F39C12" />
                  <Text style={styles.modalRewardValue}>{mission.reward}</Text>
                  <Text style={styles.modalRewardLabel}>Points</Text>
                </View>
                <View style={styles.modalRewardCard}>
                  <Zap size={24} color={theme.colors.primary} />
                  <Text style={styles.modalRewardValue}>₹{mission.estimatedSavings}</Text>
                  <Text style={styles.modalRewardLabel}>Savings</Text>
                </View>
                <View style={styles.modalRewardCard}>
                  <Award size={24} color="#9B59B6" />
                  <Text style={styles.modalRewardValue}>1</Text>
                  <Text style={styles.modalRewardLabel}>Badge</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const CelebrationOverlay = () => {
    const scale = celebrationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.celebrationOverlay,
          {
            opacity: celebrationAnim,
            transform: [{ scale }],
          },
        ]}>
        <Trophy size={80} color="#F39C12" />
        <Text style={styles.celebrationText}>Mission Complete!</Text>
        <Text style={styles.celebrationSubtext}>Reward claimed ✨</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Missions</Text>
          <Text style={styles.headerSubtitle}>Complete & Earn Rewards</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Sparkles size={20} color="#F39C12" />
          <Text style={styles.pointsText}>{totalPoints}</Text>
        </View>
      </View>

      {/* Active Missions Count */}
      {activeMissions.length > 0 && (
        <View style={styles.activeCount}>
          <Target size={18} color={theme.colors.primary} />
          <Text style={styles.activeCountText}>
            {activeMissions.length} active mission{activeMissions.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Missions Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.missionsScroll}
        snapToInterval={CARD_WIDTH + 20}
        decelerationRate="fast">
        {recommendedMissions.map((mission) => (
          <View key={mission.id} style={styles.missionCardWrapper}>
            <MissionCard mission={mission} />
          </View>
        ))}
      </ScrollView>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
        <Text style={styles.tipsText}>
          • Complete missions to earn points and exclusive rewards
        </Text>
        <Text style={styles.tipsText}>
          • Steps auto-complete when you book deals or rides
        </Text>
        <Text style={styles.tipsText}>
          • New missions unlock based on your preferences
        </Text>
      </View>

      {/* Mission Detail Modal */}
      {selectedMission && <MissionDetailModal mission={selectedMission} />}

      {/* Celebration Overlay */}
      {showCelebration && <CelebrationOverlay />}

      {/* Missions now always unlocked for demo - removed Bronze restriction */}
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F39C12',
  },
  activeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  activeCountText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  missionsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  missionCardWrapper: {
    width: CARD_WIDTH,
    marginRight: 20,
  },
  missionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
  },
  missionCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0, 217, 163, 0.05)',
  },
  missionCardCompleted: {
    borderColor: '#F39C12',
    backgroundColor: 'rgba(243, 156, 18, 0.05)',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  missionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 40,
  },
  stepsPreview: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotCompleted: {
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
    borderWidth: 1,
    borderColor: '#F39C12',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  claimButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F39C12',
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 100, // Extra padding for tab bar
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  modalClose: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    paddingLeft: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  stepsList: {
    gap: 12,
    marginBottom: 24,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  stepContent: {
    flex: 1,
  },
  stepInstructions: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  stepInstructionsCompleted: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  stepType: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalRewards: {
    marginTop: 8,
  },
  modalRewardsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  modalRewardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modalRewardCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  modalRewardValue: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalRewardLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  celebrationText: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 24,
  },
  celebrationSubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  lockedContent: {
    width: '85%',
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  lockedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  lockedText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  lockedProgress: {
    width: '100%',
    gap: 8,
  },
  lockedProgressText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  lockedProgressBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  lockedProgressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.textSecondary,
    borderRadius: 4,
  },
});
