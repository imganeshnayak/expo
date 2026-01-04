import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions,
    Switch,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
    X,
    Rocket,
    TrendingUp,
    Users,
    Zap,
    Target,
    Gift,
    Clock,
    Check,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Crown,
    RefreshCw,
    Plus,
    Percent,
    Car,
    Award,
    Calendar,
    Tag,
    ShoppingBag,
    Timer,
    MapPin,
    Camera,
    ImageIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
    useCampaignStore,
    type CampaignType,
    type CampaignTemplate,
} from '../../store/campaignStore';

const { width } = Dimensions.get('window');

interface CampaignCreatorModalProps {
    visible?: boolean;
    onClose?: () => void;
    merchantId?: string;
}

type DisplayCategory = 'All' | 'Loyalty' | 'Growth' | 'Retention';

export default function CampaignCreatorModal({
    visible = true,
    onClose,
    merchantId = 'demo-merchant',
}: CampaignCreatorModalProps) {
    const theme = useAppTheme();
    const router = useRouter();
    const {
        launchCampaign,
        templates,
        loadTemplates,
        startCampaignFromTemplate,
        draftCampaign,
        updateDraftCampaign
    } = useCampaignStore();

    const safeClose = () => {
        if (onClose) onClose();
        else router.back();
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    // Wizard State
    const [step, setStep] = useState(1);
    const [activeTab, setActiveTab] = useState<DisplayCategory>('All');
    const [selectedType, setSelectedType] = useState<CampaignType | 'custom'>('discount');

    // Common Config
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Stamp Card Config
    const [stampsRequired, setStampsRequired] = useState('8');
    const [rewardItem, setRewardItem] = useState('Free Coffee');
    const [bonusStamps, setBonusStamps] = useState('1');

    // Discount Config
    const [discountPercent, setDiscountPercent] = useState('20');
    const [minSpend, setMinSpend] = useState('0');
    const [maxDiscount, setMaxDiscount] = useState('500');

    // Flash Deal Config
    const [duration, setDuration] = useState('2');
    const [slotsAvailable, setSlotsAvailable] = useState('50');
    const [urgencyEnabled, setUrgencyEnabled] = useState(true);

    // Ride Reimbursement Config
    const [maxRideAmount, setMaxRideAmount] = useState('200');
    const [includeDiscount, setIncludeDiscount] = useState(true);
    const [discountWithRide, setDiscountWithRide] = useState('10');

    // Combo Deal Config
    const [originalPrice, setOriginalPrice] = useState('500');
    const [comboPrice, setComboPrice] = useState('350');
    const [comboItems, setComboItems] = useState('Coffee + Sandwich + Dessert');

    // Campaign Image
    const [campaignImage, setCampaignImage] = useState<string | null>(null);

    const STYLES = getStyles(theme);

    // Image Upload Handler
    const handleImageUpload = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Please allow photo library access to upload campaign images.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setCampaignImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const getFilteredTemplates = () => {
        if (activeTab === 'All') return templates;
        const catMap: Record<DisplayCategory, string> = {
            'All': '',
            'Loyalty': 'loyalty',
            'Growth': 'acquisition',
            'Retention': 'retention'
        };
        return templates.filter(t => t.category === catMap[activeTab]);
    };

    const handleTemplateSelect = (template: CampaignTemplate) => {
        startCampaignFromTemplate(template.id, merchantId);
        setTitle(template.name);
        setDescription(template.description);
        setSelectedType(template.defaultConfig.type || 'discount');

        // Set defaults based on template
        if (template.defaultConfig.offer?.discountPercent) {
            setDiscountPercent(template.defaultConfig.offer.discountPercent.toString());
        }
        if (template.defaultConfig.offer?.rideReimbursement) {
            setMaxRideAmount(template.defaultConfig.offer.rideReimbursement.toString());
        }
        if (template.defaultConfig.offer?.bonusStamps) {
            setBonusStamps(template.defaultConfig.offer.bonusStamps.toString());
        }

        setStep(2);
    };

    const handleCustomCampaign = () => {
        setTitle('My Custom Campaign');
        setDescription('Create your own unique offer');
        setSelectedType('custom');
        setStep(2);
    };

    const handleLaunch = () => {
        const offerConfig: any = {};

        if (selectedType === 'stamp_card') {
            offerConfig.stampReward = parseInt(stampsRequired);
            offerConfig.bonusStamps = parseInt(bonusStamps);
        } else if (selectedType === 'discount' || selectedType === 'custom') {
            offerConfig.discountPercent = parseInt(discountPercent);
        } else if (selectedType === 'flash_deal') {
            offerConfig.discountPercent = parseInt(discountPercent);
        } else if (selectedType === 'ride_reimbursement') {
            offerConfig.rideReimbursement = parseInt(maxRideAmount);
            if (includeDiscount) {
                offerConfig.discountPercent = parseInt(discountWithRide);
            }
        } else if (selectedType === 'combo') {
            offerConfig.discountPercent = Math.round((1 - parseInt(comboPrice) / parseInt(originalPrice)) * 100);
        }

        updateDraftCampaign({
            name: title,
            description,
            offer: offerConfig
        });

        launchCampaign();
        Alert.alert("🚀 Campaign Launched!", "Your promotion is now live and visible to Utopia users.");
        handleClose();
    };

    const handleClose = () => {
        setStep(1);
        safeClose();
    };

    // =========================================================================
    // STEP 1: Template Gallery
    // =========================================================================
    const renderTemplateStep = () => (
        <View style={STYLES.stepContainer}>
            <Text style={STYLES.heading}>Create a Promotion</Text>
            <Text style={STYLES.subheading}>Choose a template or start from scratch</Text>

            {/* Fixed Tabs - No cutoff */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={STYLES.tabScrollContent}
            >
                {(['All', 'Loyalty', 'Growth', 'Retention'] as DisplayCategory[]).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[STYLES.tab, activeTab === tab && STYLES.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[STYLES.tabText, activeTab === tab && STYLES.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={STYLES.gridContainer}>
                {/* Custom Campaign Card - First */}
                <TouchableOpacity style={STYLES.customCard} onPress={handleCustomCampaign}>
                    <LinearGradient
                        colors={[theme.colors.primary + '30', theme.colors.primary + '10']}
                        style={STYLES.customGradient}
                    >
                        <View style={STYLES.customIconBox}>
                            <Plus size={32} color={theme.colors.primary} />
                        </View>
                        <Text style={STYLES.customTitle}>Create Custom</Text>
                        <Text style={STYLES.customDesc}>Build your own unique promotion from scratch</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Template Cards */}
                {getFilteredTemplates().map(template => (
                    <TouchableOpacity
                        key={template.id}
                        style={STYLES.templateCard}
                        onPress={() => handleTemplateSelect(template)}
                    >
                        <View style={STYLES.cardContent}>
                            <View style={STYLES.cardHeader}>
                                <View style={[STYLES.iconBox, { backgroundColor: getCategoryColor(template.category) + '20' }]}>
                                    {getIcon(template.icon, getCategoryColor(template.category))}
                                </View>
                                {template.difficulty === 'advanced' && (
                                    <View style={STYLES.proBadge}>
                                        <Crown size={10} color="#FFF" />
                                        <Text style={STYLES.proBadgeText}>PRO</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={STYLES.templateTitle}>{template.name}</Text>
                            <Text style={STYLES.templateDesc} numberOfLines={2}>{template.description}</Text>

                            <View style={STYLES.metricsRow}>
                                <View style={STYLES.metric}>
                                    <TrendingUp size={14} color="#16A34A" />
                                    <Text style={STYLES.metricText}>{template.estimatedROI}% ROI</Text>
                                </View>
                                <View style={STYLES.metric}>
                                    <Users size={14} color={theme.colors.primary} />
                                    <Text style={STYLES.metricText}>{template.successRate}%</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    // =========================================================================
    // STEP 2: Unique Configurators per Type
    // =========================================================================
    const renderConfigStep = () => {
        const renderTypeSpecificConfig = () => {
            switch (selectedType) {
                case 'stamp_card':
                    return (
                        <>
                            <View style={STYLES.sectionHeader}>
                                <Award size={20} color={theme.colors.primary} />
                                <Text style={STYLES.sectionTitle}>Stamp Card Settings</Text>
                            </View>
                            <View style={STYLES.configCard}>
                                <View style={STYLES.configRow}>
                                    <Text style={STYLES.configLabel}>Stamps to Complete</Text>
                                    <View style={STYLES.stepper}>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setStampsRequired(Math.max(3, parseInt(stampsRequired) - 1).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>−</Text>
                                        </TouchableOpacity>
                                        <Text style={STYLES.stepperValue}>{stampsRequired}</Text>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setStampsRequired((parseInt(stampsRequired) + 1).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={STYLES.divider} />
                                <View style={STYLES.formGroup}>
                                    <Text style={STYLES.label}>Reward Item</Text>
                                    <TextInput
                                        style={STYLES.input}
                                        value={rewardItem}
                                        onChangeText={setRewardItem}
                                        placeholder="e.g. Free Coffee"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                </View>
                                <View style={STYLES.configRow}>
                                    <Text style={STYLES.configLabel}>Bonus Stamps (Weekend)</Text>
                                    <View style={STYLES.stepper}>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setBonusStamps(Math.max(0, parseInt(bonusStamps) - 1).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>−</Text>
                                        </TouchableOpacity>
                                        <Text style={STYLES.stepperValue}>{bonusStamps}</Text>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setBonusStamps((parseInt(bonusStamps) + 1).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </>
                    );

                case 'discount':
                case 'custom':
                    return (
                        <>
                            <View style={STYLES.sectionHeader}>
                                <Percent size={20} color={theme.colors.primary} />
                                <Text style={STYLES.sectionTitle}>Discount Settings</Text>
                            </View>
                            <View style={STYLES.configCard}>
                                <View style={STYLES.configRow}>
                                    <Text style={STYLES.configLabel}>Discount Percentage</Text>
                                    <View style={STYLES.stepper}>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setDiscountPercent(Math.max(5, parseInt(discountPercent) - 5).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>−</Text>
                                        </TouchableOpacity>
                                        <Text style={STYLES.stepperValue}>{discountPercent}%</Text>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setDiscountPercent(Math.min(50, parseInt(discountPercent) + 5).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={STYLES.divider} />
                                <View style={STYLES.formGroup}>
                                    <Text style={STYLES.label}>Minimum Spend (₹)</Text>
                                    <TextInput
                                        style={STYLES.input}
                                        value={minSpend}
                                        onChangeText={setMinSpend}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                </View>
                                <View style={STYLES.formGroup}>
                                    <Text style={STYLES.label}>Maximum Discount (₹)</Text>
                                    <TextInput
                                        style={STYLES.input}
                                        value={maxDiscount}
                                        onChangeText={setMaxDiscount}
                                        keyboardType="numeric"
                                        placeholder="500"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                </View>
                            </View>
                        </>
                    );

                case 'flash_deal':
                    return (
                        <>
                            <View style={STYLES.sectionHeader}>
                                <Zap size={20} color="#F59E0B" />
                                <Text style={STYLES.sectionTitle}>Flash Deal Settings</Text>
                            </View>
                            <View style={STYLES.configCard}>
                                <View style={STYLES.configRow}>
                                    <Text style={STYLES.configLabel}>Duration (Hours)</Text>
                                    <View style={STYLES.stepper}>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setDuration(Math.max(1, parseInt(duration) - 1).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>−</Text>
                                        </TouchableOpacity>
                                        <Text style={STYLES.stepperValue}>{duration}h</Text>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setDuration(Math.min(24, parseInt(duration) + 1).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={STYLES.divider} />
                                <View style={STYLES.configRow}>
                                    <Text style={STYLES.configLabel}>Discount</Text>
                                    <View style={STYLES.stepper}>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setDiscountPercent(Math.max(10, parseInt(discountPercent) - 5).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>−</Text>
                                        </TouchableOpacity>
                                        <Text style={STYLES.stepperValue}>{discountPercent}%</Text>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setDiscountPercent(Math.min(80, parseInt(discountPercent) + 5).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={STYLES.divider} />
                                <View style={STYLES.formGroup}>
                                    <Text style={STYLES.label}>Available Slots</Text>
                                    <TextInput
                                        style={STYLES.input}
                                        value={slotsAvailable}
                                        onChangeText={setSlotsAvailable}
                                        keyboardType="numeric"
                                        placeholder="50"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                </View>
                                <View style={STYLES.configRow}>
                                    <Text style={STYLES.configLabel}>Show Urgency Badge</Text>
                                    <Switch
                                        value={urgencyEnabled}
                                        onValueChange={setUrgencyEnabled}
                                        trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
                                    />
                                </View>
                            </View>
                        </>
                    );

                case 'ride_reimbursement':
                    return (
                        <>
                            <View style={STYLES.sectionHeader}>
                                <Car size={20} color="#8B5CF6" />
                                <Text style={STYLES.sectionTitle}>Ride Reimbursement</Text>
                            </View>
                            <View style={STYLES.configCard}>
                                <View style={STYLES.formGroup}>
                                    <Text style={STYLES.label}>Maximum Ride Amount (₹)</Text>
                                    <TextInput
                                        style={STYLES.input}
                                        value={maxRideAmount}
                                        onChangeText={setMaxRideAmount}
                                        keyboardType="numeric"
                                        placeholder="200"
                                        placeholderTextColor={theme.colors.textTertiary}
                                    />
                                </View>
                                <View style={STYLES.configRow}>
                                    <Text style={STYLES.configLabel}>Include Store Discount</Text>
                                    <Switch
                                        value={includeDiscount}
                                        onValueChange={setIncludeDiscount}
                                        trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
                                    />
                                </View>
                                {includeDiscount && (
                                    <>
                                        <View style={STYLES.divider} />
                                        <View style={STYLES.configRow}>
                                            <Text style={STYLES.configLabel}>Additional Discount</Text>
                                            <View style={STYLES.stepper}>
                                                <TouchableOpacity
                                                    style={STYLES.stepperBtn}
                                                    onPress={() => setDiscountWithRide(Math.max(5, parseInt(discountWithRide) - 5).toString())}
                                                >
                                                    <Text style={STYLES.stepperText}>−</Text>
                                                </TouchableOpacity>
                                                <Text style={STYLES.stepperValue}>{discountWithRide}%</Text>
                                                <TouchableOpacity
                                                    style={STYLES.stepperBtn}
                                                    onPress={() => setDiscountWithRide(Math.min(30, parseInt(discountWithRide) + 5).toString())}
                                                >
                                                    <Text style={STYLES.stepperText}>+</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>
                        </>
                    );

                case 'combo':
                    return (
                        <>
                            <View style={STYLES.sectionHeader}>
                                <ShoppingBag size={20} color="#EC4899" />
                                <Text style={STYLES.sectionTitle}>Combo Deal Settings</Text>
                            </View>
                            <View style={STYLES.configCard}>
                                <View style={STYLES.formGroup}>
                                    <Text style={STYLES.label}>Items Included</Text>
                                    <TextInput
                                        style={[STYLES.input, { height: 60 }]}
                                        value={comboItems}
                                        onChangeText={setComboItems}
                                        placeholder="e.g. Coffee + Sandwich + Dessert"
                                        placeholderTextColor={theme.colors.textTertiary}
                                        multiline
                                    />
                                </View>
                                <View style={STYLES.priceRow}>
                                    <View style={STYLES.priceInput}>
                                        <Text style={STYLES.label}>Original Price</Text>
                                        <TextInput
                                            style={STYLES.input}
                                            value={originalPrice}
                                            onChangeText={setOriginalPrice}
                                            keyboardType="numeric"
                                            placeholder="500"
                                            placeholderTextColor={theme.colors.textTertiary}
                                        />
                                    </View>
                                    <ArrowRight size={20} color={theme.colors.textSecondary} style={{ marginTop: 30 }} />
                                    <View style={STYLES.priceInput}>
                                        <Text style={STYLES.label}>Combo Price</Text>
                                        <TextInput
                                            style={STYLES.input}
                                            value={comboPrice}
                                            onChangeText={setComboPrice}
                                            keyboardType="numeric"
                                            placeholder="350"
                                            placeholderTextColor={theme.colors.textTertiary}
                                        />
                                    </View>
                                </View>
                                <View style={STYLES.savingsBox}>
                                    <Text style={STYLES.savingsText}>
                                        Customers save ₹{parseInt(originalPrice) - parseInt(comboPrice)} ({Math.round((1 - parseInt(comboPrice) / parseInt(originalPrice)) * 100)}% off)
                                    </Text>
                                </View>
                            </View>
                        </>
                    );

                default:
                    return (
                        <>
                            <View style={STYLES.sectionHeader}>
                                <Target size={20} color={theme.colors.primary} />
                                <Text style={STYLES.sectionTitle}>Campaign Settings</Text>
                            </View>
                            <View style={STYLES.configCard}>
                                <View style={STYLES.configRow}>
                                    <Text style={STYLES.configLabel}>Discount</Text>
                                    <View style={STYLES.stepper}>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setDiscountPercent(Math.max(5, parseInt(discountPercent) - 5).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>−</Text>
                                        </TouchableOpacity>
                                        <Text style={STYLES.stepperValue}>{discountPercent}%</Text>
                                        <TouchableOpacity
                                            style={STYLES.stepperBtn}
                                            onPress={() => setDiscountPercent(Math.min(50, parseInt(discountPercent) + 5).toString())}
                                        >
                                            <Text style={STYLES.stepperText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </>
                    );
            }
        };

        return (
            <ScrollView style={STYLES.stepContainer} showsVerticalScrollIndicator={false}>
                <Text style={STYLES.heading}>Configure Campaign</Text>

                {/* Basic Info */}
                <View style={STYLES.sectionHeader}>
                    <Tag size={20} color={theme.colors.textSecondary} />
                    <Text style={STYLES.sectionTitle}>Basic Information</Text>
                </View>
                <View style={STYLES.configCard}>
                    <View style={STYLES.formGroup}>
                        <Text style={STYLES.label}>Campaign Title</Text>
                        <TextInput
                            style={STYLES.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Give your campaign a name"
                            placeholderTextColor={theme.colors.textTertiary}
                        />
                    </View>
                    <View style={STYLES.formGroup}>
                        <Text style={STYLES.label}>Description</Text>
                        <TextInput
                            style={[STYLES.input, { height: 80 }]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your offer..."
                            placeholderTextColor={theme.colors.textTertiary}
                            multiline
                        />
                    </View>
                </View>

                {/* Campaign Image */}
                <View style={STYLES.sectionHeader}>
                    <Camera size={20} color={theme.colors.primary} />
                    <Text style={STYLES.sectionTitle}>Campaign Image</Text>
                </View>
                <TouchableOpacity style={STYLES.imageUploadCard} onPress={handleImageUpload}>
                    {campaignImage ? (
                        <View style={STYLES.imagePreviewContainer}>
                            <Image source={{ uri: campaignImage }} style={STYLES.imagePreview} />
                            <TouchableOpacity
                                style={STYLES.imageRemoveBtn}
                                onPress={() => setCampaignImage(null)}
                            >
                                <X size={16} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={STYLES.imageUploadPlaceholder}>
                            <ImageIcon size={32} color={theme.colors.textSecondary} />
                            <Text style={STYLES.imageUploadText}>Tap to add image</Text>
                            <Text style={STYLES.imageUploadHint}>16:9 recommended • Shows in user app</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Type-Specific Config */}
                {renderTypeSpecificConfig()}

                {/* Preview */}
                <View style={STYLES.sectionHeader}>
                    <Sparkles size={20} color={theme.colors.primary} />
                    <Text style={STYLES.sectionTitle}>How Users Will See It</Text>
                </View>
                <View style={STYLES.previewCard}>
                    <View style={STYLES.previewHeader}>
                        <View style={[STYLES.previewIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                            {getTypeIcon(selectedType, theme.colors.primary)}
                        </View>
                        <View style={STYLES.previewInfo}>
                            <Text style={STYLES.previewTitle}>{title || 'Campaign Title'}</Text>
                            <Text style={STYLES.previewDesc} numberOfLines={2}>{description || 'Campaign description'}</Text>
                        </View>
                    </View>
                    <View style={STYLES.previewBadges}>
                        {selectedType === 'stamp_card' && (
                            <View style={STYLES.previewBadge}>
                                <Award size={12} color={theme.colors.primary} />
                                <Text style={STYLES.previewBadgeText}>{stampsRequired} stamps → {rewardItem}</Text>
                            </View>
                        )}
                        {(selectedType === 'discount' || selectedType === 'custom') && (
                            <View style={STYLES.previewBadge}>
                                <Percent size={12} color="#16A34A" />
                                <Text style={STYLES.previewBadgeText}>{discountPercent}% OFF</Text>
                            </View>
                        )}
                        {selectedType === 'flash_deal' && (
                            <>
                                <View style={[STYLES.previewBadge, { backgroundColor: '#FEF3C7' }]}>
                                    <Zap size={12} color="#F59E0B" />
                                    <Text style={[STYLES.previewBadgeText, { color: '#F59E0B' }]}>FLASH</Text>
                                </View>
                                <View style={STYLES.previewBadge}>
                                    <Timer size={12} color={theme.colors.primary} />
                                    <Text style={STYLES.previewBadgeText}>{duration}h only</Text>
                                </View>
                            </>
                        )}
                        {selectedType === 'ride_reimbursement' && (
                            <View style={STYLES.previewBadge}>
                                <Car size={12} color="#8B5CF6" />
                                <Text style={STYLES.previewBadgeText}>Free ride up to ₹{maxRideAmount}</Text>
                            </View>
                        )}
                        {selectedType === 'combo' && (
                            <View style={STYLES.previewBadge}>
                                <ShoppingBag size={12} color="#EC4899" />
                                <Text style={STYLES.previewBadgeText}>₹{comboPrice} (Save ₹{parseInt(originalPrice) - parseInt(comboPrice)})</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={STYLES.container}>
                {/* Header */}
                <View style={STYLES.header}>
                    <TouchableOpacity onPress={step === 1 ? handleClose : () => setStep(1)} style={STYLES.headerBtn}>
                        {step === 1 ? (
                            <X size={24} color={theme.colors.text} />
                        ) : (
                            <ArrowLeft size={24} color={theme.colors.text} />
                        )}
                    </TouchableOpacity>
                    <Text style={STYLES.headerTitle}>{step === 1 ? 'Create Promotion' : 'Configure'}</Text>
                    {step === 2 ? (
                        <TouchableOpacity onPress={handleLaunch} style={STYLES.launchBtn}>
                            <Text style={STYLES.launchText}>Launch</Text>
                            <Rocket size={16} color="#FFF" />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 80 }} />
                    )}
                </View>

                {step === 1 ? renderTemplateStep() : renderConfigStep()}
            </View>
        </Modal>
    );
}

// Helpers
const getCategoryColor = (cat: string) => {
    switch (cat) {
        case 'acquisition': return '#3B82F6';
        case 'retention': return '#10B981';
        case 'loyalty': return '#8B5CF6';
        default: return '#F59E0B';
    }
};

const getIcon = (name: string, color: string) => {
    switch (name) {
        case 'rocket': return <Rocket size={24} color={color} />;
        case 'calendar': return <Clock size={24} color={color} />;
        case 'crown': return <Crown size={24} color={color} />;
        case 'refresh': return <RefreshCw size={24} color={color} />;
        case 'zap': return <Zap size={24} color={color} />;
        case 'award': return <Award size={24} color={color} />;
        case 'clock': return <Timer size={24} color={color} />;
        default: return <Target size={24} color={color} />;
    }
};

const getTypeIcon = (type: CampaignType | 'custom', color: string) => {
    switch (type) {
        case 'stamp_card': return <Award size={24} color={color} />;
        case 'discount': return <Percent size={24} color={color} />;
        case 'flash_deal': return <Zap size={24} color="#F59E0B" />;
        case 'ride_reimbursement': return <Car size={24} color="#8B5CF6" />;
        case 'combo': return <ShoppingBag size={24} color="#EC4899" />;
        case 'custom': return <Sparkles size={24} color={color} />;
        default: return <Target size={24} color={color} />;
    }
};

const getStyles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surfaceLight,
    },
    headerBtn: { width: 40 },
    headerTitle: { fontSize: 18, fontFamily: theme.fontFamily.heading, color: theme.colors.text, fontWeight: '600' },
    launchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    launchText: { fontSize: 14, color: '#FFF', fontWeight: '600' },

    stepContainer: { flex: 1, paddingTop: 20 },
    heading: { fontSize: 28, fontFamily: theme.fontFamily.heading, color: theme.colors.text, marginBottom: 8, paddingHorizontal: 20 },
    subheading: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: 24, fontFamily: theme.fontFamily.primary, paddingHorizontal: 20 },

    // Tabs - Fixed no cutoff
    tabScrollContent: { paddingHorizontal: 20, paddingBottom: 16, gap: 10, flexDirection: 'row' },
    tab: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        flexShrink: 0,
    },
    activeTab: { backgroundColor: theme.colors.text, borderColor: theme.colors.text },
    tabText: { color: theme.colors.text, fontWeight: '600', fontSize: 13, flexShrink: 0 },
    activeTabText: { color: theme.colors.background },


    // Custom Campaign Card
    customCard: { marginBottom: 16, marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: theme.colors.primary, borderStyle: 'dashed' },
    customGradient: { padding: 24, alignItems: 'center' },
    customIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    customTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    customDesc: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },

    // Template Cards
    gridContainer: { paddingBottom: 40, paddingHorizontal: 20 },
    templateCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.surfaceLight, backgroundColor: theme.colors.surface },
    cardContent: { padding: 20 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    proBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F59E0B', borderRadius: 6 },
    proBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    templateTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: theme.colors.text },
    templateDesc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 16, lineHeight: 20 },
    metricsRow: { flexDirection: 'row', gap: 16 },
    metric: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metricText: { fontSize: 12, fontWeight: '600', color: theme.colors.text },

    // Config Step
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    configCard: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceLight },
    configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    configLabel: { fontSize: 15, color: theme.colors.text },
    divider: { height: 1, backgroundColor: theme.colors.surfaceLight, marginVertical: 12 },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    stepperBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
    stepperText: { fontSize: 20, color: theme.colors.text, fontWeight: '600' },
    stepperValue: { fontSize: 18, fontWeight: '700', color: theme.colors.primary, minWidth: 50, textAlign: 'center' },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: theme.colors.text },
    input: { backgroundColor: theme.colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: theme.colors.surfaceLight, color: theme.colors.text },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    priceInput: { flex: 1 },
    savingsBox: { marginTop: 12, padding: 12, backgroundColor: '#10B98120', borderRadius: 8 },
    savingsText: { fontSize: 14, color: '#10B981', fontWeight: '600', textAlign: 'center' },

    // Preview
    previewCard: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceLight },
    previewHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    previewIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    previewInfo: { flex: 1 },
    previewTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
    previewDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
    previewBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    previewBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    previewBadgeText: { fontSize: 12, fontWeight: '600', color: theme.colors.text },

    // Image Upload
    imageUploadCard: { backgroundColor: theme.colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.surfaceLight, marginBottom: 8 },
    imagePreviewContainer: { width: '100%', height: 180, position: 'relative' },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    imageRemoveBtn: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    imageUploadPlaceholder: { padding: 32, alignItems: 'center' },
    imageUploadText: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginTop: 12 },
    imageUploadHint: { fontSize: 12, color: theme.colors.textTertiary, marginTop: 4 },
});
