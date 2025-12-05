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
    Image,
    ActivityIndicator,
} from 'react-native';
import { X, Rocket, TrendingUp, Users, RefreshCw, Image as ImageIcon, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../constants/theme';
import { api } from '../../lib/api';
import {
    useCampaignStore,
    type CampaignType,
    type AudienceType,
    getCategoryColor,
} from '../../store/campaignStore';
import { BUSINESS_CATEGORIES } from '../../constants/categories';

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

    // New Fields
    const [description, setDescription] = useState('');
    const [consumerCategory, setConsumerCategory] = useState('Food');
    const [maxRedemptions, setMaxRedemptions] = useState('100');
    const [originalPrice, setOriginalPrice] = useState('0');
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

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

            // New Fields
            setDescription(template.description || '');
            setConsumerCategory('Food'); // Default or map from template category
            setMaxRedemptions(template.defaultConfig.targeting?.maxUses?.toString() || '100');
            setOriginalPrice('0');
            setImages([]);
        }
        setStep(2);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            handleImageUpload(result.assets[0].uri);
        }
    };

    const handleImageUpload = async (uri: string) => {
        setUploading(true);
        try {
            const imageUrl = await api.uploadImage(uri);
            setImages(prev => [...prev, imageUrl]);
        } catch (error) {
            Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
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
            // Frontend Deal Fields
            description,
            consumerCategory,
            maxRedemptions: parseInt(maxRedemptions) || 100,
            pricing: {
                originalPrice: parseInt(originalPrice) || 0,
                discountedPrice: parseInt(originalPrice) * (1 - (parseInt(discountPercent) || 0) / 100),
            },
            images: ['https://via.placeholder.com/300'], // Placeholder for now
            termsAndConditions: ['Valid at all locations'], // Default
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
            // Frontend Deal Fields
            description,
            consumerCategory,
            maxRedemptions: parseInt(maxRedemptions) || 100,
            pricing: {
                originalPrice: parseInt(originalPrice) || 0,
                discountedPrice: parseInt(originalPrice) * (1 - (parseInt(discountPercent) || 0) / 100),
            },
            images: ['https://via.placeholder.com/300'],
            termsAndConditions: ['Valid at all locations'],
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
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Describe your offer..."
                                    placeholderTextColor={theme.colors.textTertiary}
                                    multiline
                                />
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Campaign Images</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                                    {images.map((img, index) => (
                                        <View key={index} style={styles.imageContainer}>
                                            <Image source={{ uri: img }} style={styles.uploadedImage} />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => removeImage(index)}
                                            >
                                                <X size={12} color="#FFF" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.addImageButton}
                                        onPress={pickImage}
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <ActivityIndicator color={theme.colors.primary} />
                                        ) : (
                                            <>
                                                <Upload size={24} color={theme.colors.primary} />
                                                <Text style={styles.addImageText}>Upload</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Category</Text>
                                <View style={styles.optionsRow}>
                                    {BUSINESS_CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.optionChip, consumerCategory === cat && styles.optionChipActive]}
                                            onPress={() => setConsumerCategory(cat)}>
                                            <Text
                                                style={[
                                                    styles.optionChipText,
                                                    consumerCategory === cat && styles.optionChipTextActive,
                                                ]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
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

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Max Redemptions</Text>
                                <TextInput
                                    style={styles.input}
                                    value={maxRedemptions}
                                    onChangeText={setMaxRedemptions}
                                    keyboardType="numeric"
                                    placeholder="100"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>

                            {(campaignType === 'discount' || campaignType === 'combo') && (
                                <View style={styles.row}>
                                    <View style={[styles.formSection, { flex: 1, marginRight: 10 }]}>
                                        <Text style={styles.label}>Original Price (₹)</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={originalPrice}
                                            onChangeText={setOriginalPrice}
                                            keyboardType="numeric"
                                            placeholder="500"
                                            placeholderTextColor={theme.colors.textTertiary}
                                        />
                                    </View>
                                    <View style={[styles.formSection, { flex: 1 }]}>
                                        <Text style={styles.label}>Discount (%)</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={discountPercent}
                                            onChangeText={setDiscountPercent}
                                            keyboardType="numeric"
                                            placeholder="15"
                                            placeholderTextColor={theme.colors.textTertiary}
                                        />
                                    </View>
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    // Image Upload Styles
    imageScroll: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 10,
        position: 'relative',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: theme.colors.error || '#EF4444',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFF',
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addImageText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '500',
    },
});
