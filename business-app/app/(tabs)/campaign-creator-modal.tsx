import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { X, Rocket, TrendingUp, Users, RefreshCw } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import {
    useCampaignStore,
    type CampaignType,
    type AudienceType,
    getCategoryColor,
} from '../../store/campaignStore';

interface CampaignCreatorModalProps {
    visible: boolean;
    onClose: () => void;
    merchantId: string;
}

export default function CampaignCreatorModal({
    visible,
    onClose,
    merchantId,
}: CampaignCreatorModalProps) {
    const { templates, startCampaignFromTemplate, updateDraftCampaign, launchCampaign, saveDraft } =
        useCampaignStore();

    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [campaignName, setCampaignName] = useState('');
    const [campaignType, setCampaignType] = useState<CampaignType>('discount');
    const [audience, setAudience] = useState<AudienceType>('all');
    const [budget, setBudget] = useState('5000');
    const [discountPercent, setDiscountPercent] = useState('15');
    const [rideReimbursement, setRideReimbursement] = useState('100');

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        startCampaignFromTemplate(templateId, merchantId);
        const template = templates.find(t => t.id === templateId);
        if (template?.defaultConfig) {
            setCampaignName(template.name);
            setCampaignType(template.defaultConfig.type || 'discount');
            setAudience(template.defaultConfig.targeting?.audience || 'all');
            setBudget(template.defaultConfig.budget?.total?.toString() || '5000');
            setDiscountPercent(template.defaultConfig.offer?.discountPercent?.toString() || '15');
            setRideReimbursement(template.defaultConfig.offer?.rideReimbursement?.toString() || '100');
        }
        setStep(2);
    };

    const handleLaunch = () => {
        if (!campaignName.trim()) {
            Alert.alert('Error', 'Please enter a campaign name');
            return;
        }

        updateDraftCampaign({
            name: campaignName,
            type: campaignType,
            targeting: {
                audience,
                location: 'all',
                timing: 'always',
            },
            budget: {
                total: parseInt(budget) || 5000,
                spent: 0,
            },
            offer: {
                discountPercent: campaignType === 'discount' || campaignType === 'combo'
                    ? parseInt(discountPercent) : undefined,
                rideReimbursement: campaignType === 'ride_reimbursement' || campaignType === 'combo'
                    ? parseInt(rideReimbursement) : undefined,
            },
        });

        launchCampaign();
        Alert.alert('Success', 'Campaign launched successfully!');
        handleClose();
    };

    const handleSaveDraft = () => {
        updateDraftCampaign({
            name: campaignName,
            type: campaignType,
            targeting: { audience, location: 'all', timing: 'always' },
            budget: { total: parseInt(budget) || 5000, spent: 0 },
            offer: {
                discountPercent: parseInt(discountPercent),
                rideReimbursement: parseInt(rideReimbursement),
            },
        });
        saveDraft();
        Alert.alert('Success', 'Campaign saved as draft');
        handleClose();
    };

    const handleClose = () => {
        setStep(1);
        setSelectedTemplate(null);
        setCampaignName('');
        setAudience('all');
        setBudget('5000');
        setDiscountPercent('15');
        setRideReimbursement('100');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>
                            {step === 1 ? 'Choose Template' : 'Configure Campaign'}
                        </Text>
                        <Text style={styles.headerSubtitle}>Step {step} of 2</Text>
                    </View>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <X size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {step === 1 ? (
                        // Step 1: Template Selection
                        <View>
                            <Text style={styles.sectionTitle}>Quick Start Templates</Text>
                            <Text style={styles.sectionSubtitle}>
                                Choose a proven template to get started quickly
                            </Text>

                            {templates.map(template => (
                                <TouchableOpacity
                                    key={template.id}
                                    style={styles.templateCard}
                                    onPress={() => handleTemplateSelect(template.id)}>
                                    <View style={styles.templateHeader}>
                                        <View
                                            style={[
                                                styles.templateIcon,
                                                { backgroundColor: `${getCategoryColor(template.category)}20` },
                                            ]}>
                                            <Rocket size={24} color={getCategoryColor(template.category)} />
                                        </View>
                                        <View style={styles.templateInfo}>
                                            <Text style={styles.templateName}>{template.name}</Text>
                                            <Text style={styles.templateCategory}>
                                                {template.category.toUpperCase()} • {template.difficulty.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.templateDescription}>{template.description}</Text>
                                    <View style={styles.templateMetrics}>
                                        <View style={styles.templateMetric}>
                                            <TrendingUp size={16} color="#2ECC71" />
                                            <Text style={styles.templateMetricText}>{template.estimatedROI}% ROI</Text>
                                        </View>
                                        <View style={styles.templateMetric}>
                                            <Users size={16} color={theme.colors.primary} />
                                            <Text style={styles.templateMetricText}>
                                                {template.successRate}% success rate
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        // Step 2: Configuration
                        <View>
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Campaign Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={campaignName}
                                    onChangeText={setCampaignName}
                                    placeholder="e.g., Weekend Special 20% Off"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Target Audience</Text>
                                <View style={styles.optionsRow}>
                                    {(['all', 'new', 'returning', 'high_value', 'at_risk'] as AudienceType[]).map(
                                        aud => (
                                            <TouchableOpacity
                                                key={aud}
                                                style={[styles.optionChip, audience === aud && styles.optionChipActive]}
                                                onPress={() => setAudience(aud)}>
                                                <Text
                                                    style={[
                                                        styles.optionChipText,
                                                        audience === aud && styles.optionChipTextActive,
                                                    ]}>
                                                    {aud.replace('_', ' ').toUpperCase()}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    )}
                                </View>
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Total Budget (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={budget}
                                    onChangeText={setBudget}
                                    keyboardType="numeric"
                                    placeholder="5000"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>

                            {(campaignType === 'discount' || campaignType === 'combo') && (
                                <View style={styles.formSection}>
                                    <Text style={styles.label}>Discount Percentage (%)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={discountPercent}
                                        onChangeText={setDiscountPercent}
                                        keyboardType="numeric"
                                        placeholder="15"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                </View>
                            )}

                            {(campaignType === 'ride_reimbursement' || campaignType === 'combo') && (
                                <View style={styles.formSection}>
                                    <Text style={styles.label}>Ride Reimbursement (₹)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={rideReimbursement}
                                        onChangeText={setRideReimbursement}
                                        keyboardType="numeric"
                                        placeholder="100"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>

                {/* Footer */}
                {step === 2 && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleSaveDraft}>
                            <Text style={styles.secondaryButtonText}>Save Draft</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleLaunch}>
                            <Rocket size={20} color="#FFFFFF" />
                            <Text style={styles.primaryButtonText}>Launch Campaign</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surfaceLight,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: theme.colors.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 20,
    },
    templateCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    templateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    templateIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    templateInfo: {
        flex: 1,
    },
    templateName: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
    },
    templateCategory: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    templateDescription: {
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
        marginBottom: 12,
    },
    templateMetrics: {
        flexDirection: 'row',
        gap: 16,
    },
    templateMetric: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    templateMetricText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.text,
    },
    formSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    optionChipActive: {
        backgroundColor: `${theme.colors.primary}20`,
        borderColor: theme.colors.primary,
    },
    optionChipText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    optionChipTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.surfaceLight,
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
