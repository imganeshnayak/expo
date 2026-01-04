import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Dimensions,
    Animated,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
    Camera,
    Clock,
    ArrowRight,
    ArrowLeft,
    Check,
    MapPin,
    Phone,
    Star,
    Coffee,
    Scissors,
    Dumbbell,
    ShoppingBag,
    Utensils,
    Briefcase,
    Sparkles,
    Store,
    Navigation,
    X,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'cafe', name: 'Café', icon: Coffee, color: '#8B4513' },
    { id: 'restaurant', name: 'Restaurant', icon: Utensils, color: '#E74C3C' },
    { id: 'salon', name: 'Salon & Spa', icon: Scissors, color: '#9B59B6' },
    { id: 'gym', name: 'Gym & Fitness', icon: Dumbbell, color: '#3498DB' },
    { id: 'retail', name: 'Retail Store', icon: ShoppingBag, color: '#2ECC71' },
    { id: 'services', name: 'Services', icon: Briefcase, color: '#F39C12' },
];

export default function BusinessSetupScreen() {
    const theme = useAppTheme();
    const router = useRouter();
    const { updateProfile, user } = useAuthStore();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const progressAnim = useRef(new Animated.Value(1)).current;

    // Form State
    const [businessName, setBusinessName] = useState(user?.businessName || '');
    const [tagline, setTagline] = useState('');
    const [category, setCategory] = useState('');
    const [address, setAddress] = useState(user?.address || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [openTime, setOpenTime] = useState('09:00');
    const [closeTime, setCloseTime] = useState('22:00');
    const [logoUri, setLogoUri] = useState<string | null>(null);

    const STYLES = getStyles(theme);

    const animateToStep = (newStep: number) => {
        Animated.spring(progressAnim, {
            toValue: newStep,
            useNativeDriver: false,
            friction: 8,
        }).start();
        setStep(newStep);
    };

    // Logo Upload with ImagePicker
    const handleLogoUpload = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Please allow access to your photo library to upload a logo.');
                return;
            }

            // Launch picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setLogoUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    // Auto-detect location
    const handleDetectLocation = async () => {
        setIsDetectingLocation(true);
        try {
            // Check if location services are enabled
            const serviceEnabled = await Location.hasServicesEnabledAsync();
            if (!serviceEnabled) {
                Alert.alert(
                    'Location Services Disabled',
                    'Please enable Location/GPS in your device settings to use auto-detect.',
                    [{ text: 'OK' }]
                );
                setIsDetectingLocation(false);
                return;
            }

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Please allow location access to auto-detect your address.');
                setIsDetectingLocation(false);
                return;
            }

            // Get current location with timeout
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 10000,
            });

            // Reverse geocode to get address
            const [geocode] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (geocode) {
                const addressParts = [
                    geocode.streetNumber,
                    geocode.street,
                    geocode.district || geocode.subregion,
                    geocode.city,
                    geocode.region,
                    geocode.postalCode,
                ].filter(Boolean);

                const formattedAddress = addressParts.join(', ');
                setAddress(formattedAddress);
                Alert.alert('📍 Location Detected', 'Your address has been auto-filled. You can edit it if needed.');
            } else {
                Alert.alert('Location Error', 'Could not detect address. Please enter manually.');
            }
        } catch (error: any) {
            console.error('Error detecting location:', error);
            if (error.message?.includes('unavailable')) {
                Alert.alert(
                    'GPS Unavailable',
                    'Cannot get current location. Please make sure GPS is enabled and try again, or enter address manually.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'Failed to detect location. Please enter address manually.');
            }
        } finally {
            setIsDetectingLocation(false);
        }
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            await updateProfile({
                businessName,
                businessType: category,
                address,
                phone,
                businessHours: { weekdays: `${openTime} - ${closeTime}`, weekends: `${openTime} - ${closeTime}` },
                settings: { isSetupComplete: true }
            });
            setTimeout(() => {
                router.replace('/(tabs)/analytics');
            }, 800);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const canProceed = () => {
        if (step === 1) return businessName.trim().length >= 2;
        if (step === 2) return category !== '';
        if (step === 3) return address.trim().length >= 5 && phone.trim().length >= 10;
        return true;
    };

    // =========================================================================
    // PROGRESS BAR
    // =========================================================================
    const renderProgressBar = () => {
        const progressWidth = progressAnim.interpolate({
            inputRange: [1, 3],
            outputRange: ['33%', '100%'],
        });

        return (
            <View style={STYLES.progressContainer}>
                <View style={STYLES.progressBar}>
                    <Animated.View style={[STYLES.progressFill, { width: progressWidth }]} />
                </View>
                <View style={STYLES.stepsRow}>
                    {[1, 2, 3].map((s) => (
                        <View key={s} style={STYLES.stepIndicator}>
                            <View style={[
                                STYLES.stepCircle,
                                step >= s && STYLES.stepCircleActive,
                                step > s && STYLES.stepCircleComplete
                            ]}>
                                {step > s ? (
                                    <Check size={14} color="#FFF" />
                                ) : (
                                    <Text style={[STYLES.stepNumber, step >= s && STYLES.stepNumberActive]}>{s}</Text>
                                )}
                            </View>
                            <Text style={[STYLES.stepLabel, step >= s && STYLES.stepLabelActive]}>
                                {s === 1 ? 'Identity' : s === 2 ? 'Category' : 'Location'}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    // =========================================================================
    // STEP 1: Business Identity
    // =========================================================================
    const renderStep1 = () => (
        <View style={STYLES.stepContent}>
            <View style={STYLES.stepHeader}>
                <Sparkles size={32} color={theme.colors.primary} />
                <Text style={STYLES.stepTitle}>Let's set up your brand</Text>
                <Text style={STYLES.stepSubtitle}>This is how customers will discover you on Utopia</Text>
            </View>

            {/* Logo Upload - Now Functional */}
            <TouchableOpacity style={STYLES.logoUpload} onPress={handleLogoUpload}>
                {logoUri ? (
                    <View style={STYLES.logoPreviewContainer}>
                        <Image source={{ uri: logoUri }} style={STYLES.logoPreview} />
                        <TouchableOpacity
                            style={STYLES.logoRemove}
                            onPress={() => setLogoUri(null)}
                        >
                            <X size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <LinearGradient
                        colors={[theme.colors.surface, theme.colors.surfaceLight]}
                        style={STYLES.logoGradient}
                    >
                        <Camera size={32} color={theme.colors.textSecondary} />
                        <Text style={STYLES.logoText}>Add Logo</Text>
                        <Text style={STYLES.logoHint}>Tap to upload • 512x512 recommended</Text>
                    </LinearGradient>
                )}
            </TouchableOpacity>

            <View style={STYLES.formGroup}>
                <Text style={STYLES.label}>Business Name *</Text>
                <TextInput
                    style={STYLES.input}
                    placeholder="What's your business called?"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={businessName}
                    onChangeText={setBusinessName}
                    autoFocus
                />
            </View>

            <View style={STYLES.formGroup}>
                <Text style={STYLES.label}>Tagline</Text>
                <TextInput
                    style={STYLES.input}
                    placeholder="e.g. Best coffee in town!"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={tagline}
                    onChangeText={setTagline}
                />
                <Text style={STYLES.inputHint}>A short description that appears under your name</Text>
            </View>
        </View>
    );

    // =========================================================================
    // STEP 2: Category Selection
    // =========================================================================
    const renderStep2 = () => (
        <View style={STYLES.stepContent}>
            <View style={STYLES.stepHeader}>
                <Store size={32} color={theme.colors.primary} />
                <Text style={STYLES.stepTitle}>What do you do?</Text>
                <Text style={STYLES.stepSubtitle}>Select the category that best describes your business</Text>
            </View>

            <View style={STYLES.categoryGrid}>
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            style={[STYLES.categoryCard, isSelected && { borderColor: cat.color, borderWidth: 2 }]}
                            onPress={() => setCategory(cat.id)}
                        >
                            <View style={[STYLES.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                                <Icon size={28} color={cat.color} />
                            </View>
                            <Text style={[STYLES.categoryName, isSelected && { color: cat.color }]}>{cat.name}</Text>
                            {isSelected && (
                                <View style={[STYLES.checkBadge, { backgroundColor: cat.color }]}>
                                    <Check size={12} color="#FFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    // =========================================================================
    // STEP 3: Location & Contact
    // =========================================================================
    const renderStep3 = () => (
        <View style={STYLES.stepContent}>
            <View style={STYLES.stepHeader}>
                <MapPin size={32} color={theme.colors.primary} />
                <Text style={STYLES.stepTitle}>Where are you located?</Text>
                <Text style={STYLES.stepSubtitle}>Help customers find and contact you</Text>
            </View>

            {/* Auto-Detect Location Button */}
            <TouchableOpacity
                style={STYLES.detectLocationBtn}
                onPress={handleDetectLocation}
                disabled={isDetectingLocation}
            >
                <LinearGradient
                    colors={[theme.colors.primary + '20', theme.colors.primary + '10']}
                    style={STYLES.detectLocationGradient}
                >
                    {isDetectingLocation ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <Navigation size={24} color={theme.colors.primary} />
                    )}
                    <View style={STYLES.detectLocationText}>
                        <Text style={STYLES.detectLocationTitle}>
                            {isDetectingLocation ? 'Detecting location...' : 'Auto-Detect My Location'}
                        </Text>
                        <Text style={STYLES.detectLocationHint}>Uses GPS to fill your address</Text>
                    </View>
                    <ArrowRight size={20} color={theme.colors.primary} />
                </LinearGradient>
            </TouchableOpacity>

            <View style={STYLES.divider}>
                <View style={STYLES.dividerLine} />
                <Text style={STYLES.dividerText}>or enter manually</Text>
                <View style={STYLES.dividerLine} />
            </View>

            <View style={STYLES.formGroup}>
                <Text style={STYLES.label}>Full Address *</Text>
                <TextInput
                    style={[STYLES.input, { height: 80 }]}
                    placeholder="Street, Area, City, Pincode"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                />
            </View>

            <View style={STYLES.formGroup}>
                <Text style={STYLES.label}>Phone Number *</Text>
                <TextInput
                    style={STYLES.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={STYLES.hoursRow}>
                <View style={STYLES.hourInput}>
                    <Text style={STYLES.label}>Opens At</Text>
                    <TextInput
                        style={STYLES.input}
                        placeholder="09:00"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={openTime}
                        onChangeText={setOpenTime}
                    />
                </View>
                <View style={STYLES.hoursDividerBox}>
                    <Text style={STYLES.hoursDividerText}>to</Text>
                </View>
                <View style={STYLES.hourInput}>
                    <Text style={STYLES.label}>Closes At</Text>
                    <TextInput
                        style={STYLES.input}
                        placeholder="22:00"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={closeTime}
                        onChangeText={setCloseTime}
                    />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {renderProgressBar()}

                <ScrollView
                    contentContainerStyle={STYLES.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </ScrollView>

                {/* Footer Navigation */}
                <View style={STYLES.footer}>
                    {step > 1 && (
                        <TouchableOpacity style={STYLES.backButton} onPress={() => animateToStep(step - 1)}>
                            <ArrowLeft size={20} color={theme.colors.text} />
                            <Text style={STYLES.backText}>Back</Text>
                        </TouchableOpacity>
                    )}
                    {step === 1 && <View style={{ flex: 1 }} />}

                    <TouchableOpacity
                        style={[STYLES.nextButton, !canProceed() && STYLES.nextButtonDisabled]}
                        onPress={step === 3 ? handleComplete : () => animateToStep(step + 1)}
                        disabled={!canProceed() || isLoading}
                    >
                        <LinearGradient
                            colors={canProceed() ? theme.colors.gradientPrimary : [theme.colors.surfaceLight, theme.colors.surfaceLight]}
                            style={STYLES.nextGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={[STYLES.nextText, !canProceed() && { color: theme.colors.textTertiary }]}>
                                {step === 3 ? (isLoading ? 'Launching...' : 'Launch Business') : 'Continue'}
                            </Text>
                            <ArrowRight size={20} color={canProceed() ? '#000' : theme.colors.textTertiary} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    // Progress Bar
    progressContainer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
    progressBar: { height: 4, backgroundColor: theme.colors.surfaceLight, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 2 },
    stepsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    stepIndicator: { alignItems: 'center', flex: 1 },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    stepCircleActive: { backgroundColor: theme.colors.primary },
    stepCircleComplete: { backgroundColor: theme.colors.primary },
    stepNumber: { fontSize: 12, fontWeight: '600', color: theme.colors.textTertiary },
    stepNumberActive: { color: '#000' },
    stepLabel: { fontSize: 11, color: theme.colors.textTertiary, fontWeight: '500' },
    stepLabelActive: { color: theme.colors.text },

    // Content
    scrollContent: { paddingBottom: 120, paddingHorizontal: 24 },
    stepContent: { flex: 1 },
    stepHeader: { alignItems: 'center', marginBottom: 32, paddingTop: 16 },
    stepTitle: { fontSize: 24, fontFamily: theme.fontFamily.heading, color: theme.colors.text, marginTop: 16, textAlign: 'center' },
    stepSubtitle: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center' },

    // Logo Upload
    logoUpload: { marginBottom: 32, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: theme.colors.surfaceLight, borderStyle: 'dashed' },
    logoGradient: { padding: 32, alignItems: 'center' },
    logoText: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginTop: 12 },
    logoHint: { fontSize: 12, color: theme.colors.textTertiary, marginTop: 4 },
    logoPreviewContainer: { width: '100%', aspectRatio: 2, position: 'relative' },
    logoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    logoRemove: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },

    // Form
    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
    input: { backgroundColor: theme.colors.surface, borderRadius: 12, padding: 16, fontSize: 16, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.surfaceLight },
    inputHint: { fontSize: 12, color: theme.colors.textTertiary, marginTop: 6 },

    // Category Grid
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    categoryCard: {
        width: (width - 60) / 2,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        position: 'relative',
    },
    categoryIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    categoryName: { fontSize: 14, fontWeight: '600', color: theme.colors.text, textAlign: 'center' },
    checkBadge: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },

    // Auto-Detect Location
    detectLocationBtn: { marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
    detectLocationGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    detectLocationText: { flex: 1 },
    detectLocationTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.primary },
    detectLocationHint: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },

    // Divider
    divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.surfaceLight },
    dividerText: { paddingHorizontal: 12, fontSize: 12, color: theme.colors.textTertiary },

    // Hours
    hoursRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
    hourInput: { flex: 1 },
    hoursDividerBox: { paddingBottom: 16 },
    hoursDividerText: { color: theme.colors.textSecondary, fontSize: 14 },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.surfaceLight,
    },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
    backText: { fontSize: 16, color: theme.colors.text, fontWeight: '500' },
    nextButton: { borderRadius: 16, overflow: 'hidden', flex: 1, marginLeft: 12 },
    nextButtonDisabled: { opacity: 0.6 },
    nextGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 8 },
    nextText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
