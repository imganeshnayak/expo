import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from 'react-native';
import { X, Save, Check, Plus, Trash2, Camera, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

interface BusinessProfileEditModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function BusinessProfileEditModal({ visible, onClose }: BusinessProfileEditModalProps) {
    const theme = useAppTheme();
    const { user, updateProfile, isLoading } = useAuthStore();
    const styles = getStyles(theme);

    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        phone: '',
        address: '',
        weekdaysHours: '',
        weekendsHours: '',
        paymentMethods: [] as string[],
        logo: '',
    });

    const [newPaymentMethod, setNewPaymentMethod] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (visible && user) {
            setFormData({
                businessName: user.businessName || '',
                businessType: user.businessType || '',
                phone: user.phone || '',
                address: user.address || '',
                weekdaysHours: user.businessHours?.weekdays || '9:00 AM - 6:00 PM',
                weekendsHours: user.businessHours?.weekends || '10:00 AM - 4:00 PM',
                paymentMethods: user.paymentMethods || ['Cash', 'UPI'],
                logo: user.logo || '',
            });
        }
    }, [visible, user]);

    const handleSave = async () => {
        try {
            await updateProfile({
                businessName: formData.businessName,
                businessType: formData.businessType,
                phone: formData.phone,
                address: formData.address,
                businessHours: {
                    weekdays: formData.weekdaysHours,
                    weekends: formData.weekendsHours,
                },
                paymentMethods: formData.paymentMethods,
                logo: formData.logo,
            });
            onClose();
        } catch (error) {
            console.error('Failed to update profile:', error);
            // Ideally show an error toast here
        }
    };

    const addPaymentMethod = () => {
        if (newPaymentMethod.trim()) {
            setFormData(prev => ({
                ...prev,
                paymentMethods: [...prev.paymentMethods, newPaymentMethod.trim()]
            }));
            setNewPaymentMethod('');
        }
    };

    const removePaymentMethod = (index: number) => {
        setFormData(prev => ({
            ...prev,
            paymentMethods: prev.paymentMethods.filter((_, i) => i !== index)
        }));
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
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
            setFormData(prev => ({ ...prev, logo: imageUrl }));
        } catch (error) {
            Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Edit Business Info</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                        {/* Logo Upload */}
                        <View style={styles.logoSection}>
                            <TouchableOpacity onPress={pickImage} disabled={uploading}>
                                <View style={styles.logoContainer}>
                                    {formData.logo ? (
                                        <Image source={{ uri: formData.logo }} style={styles.logoImage} />
                                    ) : (
                                        <View style={styles.logoPlaceholder}>
                                            <Camera size={32} color={theme.colors.textSecondary} />
                                        </View>
                                    )}
                                    {uploading && (
                                        <View style={styles.uploadingOverlay}>
                                            <ActivityIndicator color="#FFF" />
                                        </View>
                                    )}
                                    <View style={styles.editIconContainer}>
                                        <Upload size={14} color="#FFF" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.logoLabel}>Tap to change logo</Text>
                        </View>

                        {/* Basic Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Basic Details</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Business Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.businessName}
                                    onChangeText={(text) => setFormData({ ...formData, businessName: text })}
                                    placeholder="Enter business name"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Business Type</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.businessType}
                                    onChangeText={(text) => setFormData({ ...formData, businessType: text })}
                                    placeholder="e.g. Cafe, Retail, Service"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Address</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.address}
                                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                                    placeholder="Enter business address"
                                    multiline
                                    numberOfLines={3}
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>
                        </View>

                        {/* Business Hours */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Business Hours</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Weekdays (Mon-Fri)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.weekdaysHours}
                                    onChangeText={(text) => setFormData({ ...formData, weekdaysHours: text })}
                                    placeholder="e.g. 9:00 AM - 6:00 PM"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Weekends (Sat-Sun)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.weekendsHours}
                                    onChangeText={(text) => setFormData({ ...formData, weekendsHours: text })}
                                    placeholder="e.g. 10:00 AM - 4:00 PM"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                            </View>
                        </View>

                        {/* Payment Methods */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Payment Methods</Text>

                            <View style={styles.paymentInputContainer}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    value={newPaymentMethod}
                                    onChangeText={setNewPaymentMethod}
                                    placeholder="Add payment method"
                                    placeholderTextColor={theme.colors.textTertiary}
                                />
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={addPaymentMethod}
                                >
                                    <Plus size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.tagsContainer}>
                                {formData.paymentMethods.map((method, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{method}</Text>
                                        <TouchableOpacity onPress={() => removePaymentMethod(index)}>
                                            <X size={14} color={theme.colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Save size={20} color="#FFFFFF" />
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surfaceLight,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        fontFamily: theme.fontFamily.heading,
    },
    closeButton: {
        padding: 4,
    },
    formContainer: {
        padding: 20,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    logoPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 8,
        fontFamily: theme.fontFamily.primary,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
        fontFamily: theme.fontFamily.heading,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 8,
        fontFamily: theme.fontFamily.primary,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: theme.colors.text,
        fontFamily: theme.fontFamily.primary,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    paymentInputContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${theme.colors.primary}15`,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}30`,
    },
    tagText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
        fontFamily: theme.fontFamily.primary,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.surfaceLight,
        backgroundColor: theme.colors.surface,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: theme.fontFamily.primary,
    },
});
