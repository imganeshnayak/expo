import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Rocket,
  Calendar,
  Clock,
  Crown,
  RefreshCw,
  Award,
  Target,
  Zap,
  Users,
  TrendingUp,
  Lightbulb,
  Check,
  X,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import {
  useCampaignStore,
  type CampaignTemplate,
  getCampaignTypeLabel,
  getCategoryColor,
  formatBudget,
} from '@/store/campaignStore';

const { width } = Dimensions.get('window');

const ICON_MAP: Record<string, any> = {
  rocket: Rocket,
  calendar: Calendar,
  clock: Clock,
  crown: Crown,
  refresh: RefreshCw,
  award: Award,
  target: Target,
  zap: Zap,
};

export default function CampaignCreatorScreen() {
  const router = useRouter();
  const {
    templates,
    draftCampaign,
    currentStep,
    loadTemplates,
    startCampaignFromTemplate,
    updateDraftCampaign,
    setCurrentStep,
    saveDraft,
    launchCampaign,
  } = useCampaignStore();

  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  // ============================================================================
  // STEP 0: TEMPLATE GALLERY
  // ============================================================================

  const TemplateGallery = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Campaign Goal</Text>
        <Text style={styles.sectionSubtitle}>
          Start with a proven template or create from scratch
        </Text>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {['all', 'acquisition', 'retention', 'reactivation', 'loyalty'].map(cat => (
            <TouchableOpacity key={cat} style={styles.categoryPill}>
              <Text style={styles.categoryText}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Template Cards */}
        <View style={styles.templateGrid}>
          {templates.map(template => {
            const IconComponent = ICON_MAP[template.icon] || Target;
            return (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate?.id === template.id && styles.templateCardSelected,
                ]}
                onPress={() => setSelectedTemplate(template)}>
                <View style={[styles.templateIcon, { backgroundColor: `${getCategoryColor(template.category)}20` }]}>
                  <IconComponent size={28} color={getCategoryColor(template.category)} />
                </View>

                <View style={styles.templateBadges}>
                  <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(template.category)}20` }]}>
                    <Text style={[styles.categoryBadgeText, { color: getCategoryColor(template.category) }]}>
                      {template.category.toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: template.difficulty === 'simple' ? '#2ECC7120' : '#F39C1220' },
                    ]}>
                    <Text
                      style={[
                        styles.difficultyText,
                        { color: template.difficulty === 'simple' ? '#2ECC71' : '#F39C12' },
                      ]}>
                      {template.difficulty.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>

                <View style={styles.templateStats}>
                  <View style={styles.templateStat}>
                    <TrendingUp size={16} color={theme.colors.primary} />
                    <Text style={styles.templateStatValue}>{template.estimatedROI}% ROI</Text>
                  </View>
                  <View style={styles.templateStat}>
                    <Check size={16} color="#2ECC71" />
                    <Text style={styles.templateStatValue}>{template.successRate}% Success</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedTemplate && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              startCampaignFromTemplate(selectedTemplate.id, 'merchant_coffee_house_123');
            }}>
            <Text style={styles.startButtonText}>Start with {selectedTemplate.name}</Text>
            <Rocket size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  // ============================================================================
  // STEP 1: CAMPAIGN DETAILS
  // ============================================================================

  const CampaignDetails = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Campaign Details</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Campaign Name *</Text>
          <TextInput
            style={styles.input}
            value={draftCampaign?.name || ''}
            onChangeText={(text) => updateDraftCampaign({ name: text })}
            placeholder="e.g., Weekend Lunch Special"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Campaign Type</Text>
          <View style={styles.typeGrid}>
            {(['stamp_card', 'discount', 'ride_reimbursement', 'combo'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.typeCard, draftCampaign?.type === type && styles.typeCardActive]}
                onPress={() => updateDraftCampaign({ type })}>
                <Text style={[styles.typeText, draftCampaign?.type === type && styles.typeTextActive]}>
                  {getCampaignTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(0)}>
            <ArrowLeft size={20} color={theme.colors.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentStep(2)}>
            <Text style={styles.nextButtonText}>Next: Offer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // ============================================================================
  // STEP 2: OFFER CONFIGURATION
  // ============================================================================

  const OfferConfiguration = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configure Your Offer</Text>
        <Text style={styles.sectionSubtitle}>What value will you provide to customers?</Text>

        {(draftCampaign?.type === 'discount' || draftCampaign?.type === 'combo') && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Discount Percentage</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{draftCampaign.offer?.discountPercent || 0}%</Text>
              <View style={styles.sliderButtons}>
                {[10, 15, 20, 25, 30, 40, 50].map(percent => (
                  <TouchableOpacity
                    key={percent}
                    style={[
                      styles.percentButton,
                      draftCampaign.offer?.discountPercent === percent && styles.percentButtonActive,
                    ]}
                    onPress={() =>
                      updateDraftCampaign({
                        offer: { ...draftCampaign.offer, discountPercent: percent },
                      })
                    }>
                    <Text
                      style={[
                        styles.percentButtonText,
                        draftCampaign.offer?.discountPercent === percent && styles.percentButtonTextActive,
                      ]}>
                      {percent}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {(draftCampaign?.type === 'ride_reimbursement' || draftCampaign?.type === 'combo') && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ride Reimbursement Amount</Text>
            <View style={styles.sliderButtons}>
              {[50, 100, 150, 200, 250, 300].map(amount => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.percentButton,
                    draftCampaign.offer?.rideReimbursement === amount && styles.percentButtonActive,
                  ]}
                  onPress={() =>
                    updateDraftCampaign({
                      offer: { ...draftCampaign.offer, rideReimbursement: amount },
                    })
                  }>
                  <Text
                    style={[
                      styles.percentButtonText,
                      draftCampaign.offer?.rideReimbursement === amount && styles.percentButtonTextActive,
                    ]}>
                    ₹{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {(draftCampaign?.type === 'stamp_card' || draftCampaign?.type === 'combo') && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Stamps Required</Text>
              <View style={styles.sliderButtons}>
                {[5, 6, 7, 8, 10, 12].map(stamps => (
                  <TouchableOpacity
                    key={stamps}
                    style={[
                      styles.percentButton,
                      draftCampaign.offer?.stampReward === stamps && styles.percentButtonActive,
                    ]}
                    onPress={() =>
                      updateDraftCampaign({
                        offer: { ...draftCampaign.offer, stampReward: stamps },
                      })
                    }>
                    <Text
                      style={[
                        styles.percentButtonText,
                        draftCampaign.offer?.stampReward === stamps && styles.percentButtonTextActive,
                      ]}>
                      {stamps}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bonus Stamps (Optional)</Text>
              <View style={styles.sliderButtons}>
                {[0, 1, 2, 3].map(bonus => (
                  <TouchableOpacity
                    key={bonus}
                    style={[
                      styles.percentButton,
                      draftCampaign.offer?.bonusStamps === bonus && styles.percentButtonActive,
                    ]}
                    onPress={() =>
                      updateDraftCampaign({
                        offer: { ...draftCampaign.offer, bonusStamps: bonus },
                      })
                    }>
                    <Text
                      style={[
                        styles.percentButtonText,
                        draftCampaign.offer?.bonusStamps === bonus && styles.percentButtonTextActive,
                      ]}>
                      +{bonus}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.aiButton} onPress={() => setShowAIModal(true)}>
          <Lightbulb size={20} color={theme.colors.primary} />
          <Text style={styles.aiButtonText}>Get AI Recommendations</Text>
        </TouchableOpacity>

        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(1)}>
            <ArrowLeft size={20} color={theme.colors.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(3)}>
            <Text style={styles.nextButtonText}>Next: Targeting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // ============================================================================
  // STEP 3: TARGETING & AUDIENCE
  // ============================================================================

  const TargetingConfiguration = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Target Your Audience</Text>
        <Text style={styles.sectionSubtitle}>Who should see this campaign?</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Audience Type</Text>
          <View style={styles.audienceGrid}>
            {(['all', 'new', 'returning', 'high_value', 'at_risk'] as const).map(audience => (
              <TouchableOpacity
                key={audience}
                style={[
                  styles.audienceCard,
                  draftCampaign?.targeting?.audience === audience && styles.audienceCardActive,
                ]}
                onPress={() =>
                  updateDraftCampaign({
                    targeting: { ...draftCampaign?.targeting!, audience },
                  })
                }>
                <Users size={20} color={draftCampaign?.targeting?.audience === audience ? theme.colors.primary : theme.colors.textSecondary} />
                <Text
                  style={[
                    styles.audienceText,
                    draftCampaign?.targeting?.audience === audience && styles.audienceTextActive,
                  ]}>
                  {audience.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.audienceCount}>~{audience === 'all' ? '157' : audience === 'new' ? '38' : audience === 'returning' ? '119' : audience === 'high_value' ? '15' : '12'} customers</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Timing</Text>
          <View style={styles.timingButtons}>
            <TouchableOpacity
              style={[
                styles.timingButton,
                draftCampaign?.targeting?.timing === 'always' && styles.timingButtonActive,
              ]}
              onPress={() =>
                updateDraftCampaign({
                  targeting: { ...draftCampaign?.targeting!, timing: 'always' },
                })
              }>
              <Clock size={18} color={draftCampaign?.targeting?.timing === 'always' ? '#FFFFFF' : theme.colors.textSecondary} />
              <Text
                style={[
                  styles.timingButtonText,
                  draftCampaign?.targeting?.timing === 'always' && styles.timingButtonTextActive,
                ]}>
                Always Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timingButton,
                draftCampaign?.targeting?.timing === 'schedule' && styles.timingButtonActive,
              ]}
              onPress={() =>
                updateDraftCampaign({
                  targeting: { ...draftCampaign?.targeting!, timing: 'schedule' },
                })
              }>
              <Calendar size={18} color={draftCampaign?.targeting?.timing === 'schedule' ? '#FFFFFF' : theme.colors.textSecondary} />
              <Text
                style={[
                  styles.timingButtonText,
                  draftCampaign?.targeting?.timing === 'schedule' && styles.timingButtonTextActive,
                ]}>
                Scheduled
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Max Uses Per Customer (Optional)</Text>
          <View style={styles.sliderButtons}>
            {[1, 2, 3, 5, 'Unlimited'].map((uses, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.percentButton,
                  (uses === 'Unlimited' ? !draftCampaign?.targeting?.maxUsesPerCustomer : draftCampaign?.targeting?.maxUsesPerCustomer === uses) && styles.percentButtonActive,
                ]}
                onPress={() =>
                  updateDraftCampaign({
                    targeting: {
                      ...draftCampaign?.targeting!,
                      maxUsesPerCustomer: uses === 'Unlimited' ? undefined : uses as number,
                    },
                  })
                }>
                <Text
                  style={[
                    styles.percentButtonText,
                    (uses === 'Unlimited' ? !draftCampaign?.targeting?.maxUsesPerCustomer : draftCampaign?.targeting?.maxUsesPerCustomer === uses) && styles.percentButtonTextActive,
                  ]}>
                  {uses}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(2)}>
            <ArrowLeft size={20} color={theme.colors.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(4)}>
            <Text style={styles.nextButtonText}>Next: Budget</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // ============================================================================
  // STEP 4: BUDGET CONFIGURATION
  // ============================================================================

  const BudgetConfiguration = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set Your Budget</Text>
        <Text style={styles.sectionSubtitle}>How much do you want to invest?</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Total Campaign Budget</Text>
          <View style={styles.budgetButtons}>
            {[5000, 8000, 10000, 15000, 20000, 25000].map(budget => (
              <TouchableOpacity
                key={budget}
                style={[
                  styles.budgetButton,
                  draftCampaign?.budget?.total === budget && styles.budgetButtonActive,
                ]}
                onPress={() =>
                  updateDraftCampaign({
                    budget: { ...draftCampaign?.budget!, total: budget },
                  })
                }>
                <Text
                  style={[
                    styles.budgetButtonText,
                    draftCampaign?.budget?.total === budget && styles.budgetButtonTextActive,
                  ]}>
                  ₹{(budget / 1000).toFixed(0)}K
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.customBudgetInput}
            value={draftCampaign?.budget?.total?.toString() || ''}
            onChangeText={(text) =>
              updateDraftCampaign({
                budget: { ...draftCampaign?.budget!, total: parseInt(text) || 0 },
              })
            }
            placeholder="Or enter custom amount"
            keyboardType="numeric"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Daily Budget Limit (Optional)</Text>
          <View style={styles.budgetButtons}>
            {[500, 1000, 1500, 2000, 'None'].map((limit, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.budgetButton,
                  (limit === 'None' ? !draftCampaign?.budget?.dailyLimit : draftCampaign?.budget?.dailyLimit === limit) && styles.budgetButtonActive,
                ]}
                onPress={() =>
                  updateDraftCampaign({
                    budget: {
                      ...draftCampaign?.budget!,
                      dailyLimit: limit === 'None' ? undefined : limit as number,
                    },
                  })
                }>
                <Text
                  style={[
                    styles.budgetButtonText,
                    (limit === 'None' ? !draftCampaign?.budget?.dailyLimit : draftCampaign?.budget?.dailyLimit === limit) && styles.budgetButtonTextActive,
                  ]}>
                  {limit === 'None' ? 'None' : `₹${(limit as number / 1000).toFixed(1)}K`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budget Summary */}
        <View style={styles.budgetSummary}>
          <View style={styles.budgetSummaryRow}>
            <Text style={styles.budgetSummaryLabel}>Total Budget:</Text>
            <Text style={styles.budgetSummaryValue}>{formatBudget(draftCampaign?.budget?.total || 0)}</Text>
          </View>
          {draftCampaign?.budget?.dailyLimit && (
            <View style={styles.budgetSummaryRow}>
              <Text style={styles.budgetSummaryLabel}>Daily Limit:</Text>
              <Text style={styles.budgetSummaryValue}>{formatBudget(draftCampaign.budget.dailyLimit)}</Text>
            </View>
          )}
          <View style={styles.budgetSummaryRow}>
            <Text style={styles.budgetSummaryLabel}>Estimated Reach:</Text>
            <Text style={styles.budgetSummaryValue}>~{Math.floor((draftCampaign?.budget?.total || 0) / 50)} customers</Text>
          </View>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(3)}>
            <ArrowLeft size={20} color={theme.colors.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(5)}>
            <Text style={styles.nextButtonText}>Preview & Launch</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // ============================================================================
  // STEP 5: PREVIEW & LAUNCH
  // ============================================================================

  const PreviewAndLaunch = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Campaign Preview</Text>
        <Text style={styles.sectionSubtitle}>Review and launch your campaign</Text>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewName}>{draftCampaign?.name}</Text>
              <Text style={styles.previewType}>{getCampaignTypeLabel(draftCampaign?.type || 'discount')}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>DRAFT</Text>
            </View>
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.previewSectionTitle}>Offer Details</Text>
            {draftCampaign?.offer?.discountPercent && (
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Discount:</Text>
                <Text style={styles.previewValue}>{draftCampaign.offer.discountPercent}% OFF</Text>
              </View>
            )}
            {draftCampaign?.offer?.rideReimbursement && (
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Ride Reimbursement:</Text>
                <Text style={styles.previewValue}>₹{draftCampaign.offer.rideReimbursement}</Text>
              </View>
            )}
            {draftCampaign?.offer?.stampReward && (
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Stamps Required:</Text>
                <Text style={styles.previewValue}>{draftCampaign.offer.stampReward} stamps</Text>
              </View>
            )}
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.previewSectionTitle}>Targeting</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Audience:</Text>
              <Text style={styles.previewValue}>{draftCampaign?.targeting?.audience?.toUpperCase()}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Timing:</Text>
              <Text style={styles.previewValue}>{draftCampaign?.targeting?.timing?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.previewSectionTitle}>Budget</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Total Budget:</Text>
              <Text style={styles.previewValue}>{formatBudget(draftCampaign?.budget?.total || 0)}</Text>
            </View>
            {draftCampaign?.budget?.dailyLimit && (
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Daily Limit:</Text>
                <Text style={styles.previewValue}>{formatBudget(draftCampaign.budget.dailyLimit)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.launchActions}>
          <TouchableOpacity style={styles.saveDraftButton} onPress={saveDraft}>
            <Text style={styles.saveDraftText}>Save as Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.launchButton} onPress={() => {
            launchCampaign();
            router.back();
          }}>
            <Rocket size={20} color="#FFFFFF" />
            <Text style={styles.launchButtonText}>Launch Campaign</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // ============================================================================
  // AI RECOMMENDATIONS MODAL
  // ============================================================================

  const AIRecommendationsModal = () => (
    <Modal
      visible={showAIModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowAIModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AI Recommendations</Text>
            <TouchableOpacity onPress={() => setShowAIModal(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.aiRecommendation}>
              <Lightbulb size={20} color={theme.colors.primary} />
              <View style={styles.aiRecommendationContent}>
                <Text style={styles.aiRecommendationTitle}>Increase Conversion Rate</Text>
                <Text style={styles.aiRecommendationText}>
                  Based on your data, increasing ride reimbursement to ₹200 could boost conversions by 25%
                </Text>
              </View>
            </View>

            <View style={styles.aiRecommendation}>
              <Lightbulb size={20} color={theme.colors.primary} />
              <View style={styles.aiRecommendationContent}>
                <Text style={styles.aiRecommendationTitle}>Target Office Workers</Text>
                <Text style={styles.aiRecommendationText}>
                  Schedule this campaign for 6-8 PM to capture after-work crowd (38% of your traffic)
                </Text>
              </View>
            </View>

            <View style={styles.aiRecommendation}>
              <Lightbulb size={20} color={theme.colors.primary} />
              <View style={styles.aiRecommendationContent}>
                <Text style={styles.aiRecommendationTitle}>Optimize Stamp Card</Text>
                <Text style={styles.aiRecommendationText}>
                  Reducing stamps from 8 to 5 could increase completion rate by 35% while maintaining profitability
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowAIModal(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ============================================================================
  // PROGRESS INDICATOR
  // ============================================================================

  const ProgressIndicator = () => {
    const steps = ['Template', 'Details', 'Offer', 'Targeting', 'Budget', 'Launch'];
    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                currentStep >= index && styles.progressDotActive,
                currentStep > index && styles.progressDotCompleted,
              ]}>
              {currentStep > index ? (
                <Check size={12} color="#FFFFFF" />
              ) : (
                <Text style={[styles.progressNumber, currentStep >= index && styles.progressNumberActive]}>
                  {index + 1}
                </Text>
              )}
            </View>
            {index < steps.length - 1 && (
              <View style={[styles.progressLine, currentStep > index && styles.progressLineActive]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Campaign Creator</Text>
          <Text style={styles.headerSubtitle}>
            {currentStep === 0
              ? 'Choose a template'
              : currentStep === 1
              ? 'Campaign details'
              : currentStep === 2
              ? 'Configure offer'
              : currentStep === 3
              ? 'Set targeting'
              : currentStep === 4
              ? 'Set budget'
              : 'Review & launch'}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {currentStep > 0 && <ProgressIndicator />}

      {currentStep === 0 && <TemplateGallery />}
      {currentStep === 1 && <CampaignDetails />}
      {currentStep === 2 && <OfferConfiguration />}
      {currentStep === 3 && <TargetingConfiguration />}
      {currentStep === 4 && <BudgetConfiguration />}
      {currentStep === 5 && <PreviewAndLaunch />}

      <AIRecommendationsModal />
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
  },
  progressDotActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  progressDotCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  progressNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  progressNumberActive: {
    color: theme.colors.primary,
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: theme.colors.surfaceLight,
  },
  progressLineActive: {
    backgroundColor: theme.colors.primary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  categories: {
    marginBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  templateCard: {
    width: (width - 52) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    borderColor: theme.colors.primary,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateBadges: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: '600',
  },
  templateName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  templateDescription: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  templateStats: {
    flexDirection: 'row',
    gap: 12,
  },
  templateStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateStatValue: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 16,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  typeTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  sliderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  percentButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  percentButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  percentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  percentButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${theme.colors.primary}20`,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  audienceCard: {
    width: (width - 64) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  audienceCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  audienceText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  audienceTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  audienceCount: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: 4,
  },
  timingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  timingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timingButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  timingButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  budgetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  budgetButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  budgetButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  budgetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  budgetButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  customBudgetInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 16,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  budgetSummary: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  budgetSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetSummaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  budgetSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  previewType: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  previewValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  launchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveDraftButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  saveDraftText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  launchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  launchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  nextButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalBody: {
    padding: 20,
  },
  aiRecommendation: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  aiRecommendationContent: {
    flex: 1,
  },
  aiRecommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  aiRecommendationText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  modalCloseButton: {
    backgroundColor: theme.colors.primary,
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
