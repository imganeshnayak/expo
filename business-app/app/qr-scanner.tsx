import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, XCircle, Scan } from 'lucide-react-native';

export default function QRScannerScreen() {
    const router = useRouter();
    const [redemptionCode, setRedemptionCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [redeemResult, setRedeemResult] = useState<any>(null);

    const handleRedeem = async () => {
        if (!redemptionCode.trim()) {
            Alert.alert('Error', 'Please enter a redemption code');
            return;
        }

        try {
            setLoading(true);
            setRedeemResult(null);

            // Import dealsService dynamically
            const { dealsService } = await import('@/services/api/dealsService');
            const response = await dealsService.redeemDeal(redemptionCode.trim());

            if (response.data) {
                setRedeemResult({
                    success: true,
                    data: response.data,
                });
                Alert.alert(
                    'Success!',
                    `Deal redeemed successfully! Customer saved ₹${response.data.savings}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setRedemptionCode('');
                                setRedeemResult(null);
                            },
                        },
                    ]
                );
            } else if (response.error) {
                setRedeemResult({
                    success: false,
                    error: response.error,
                });
                Alert.alert('Error', response.error);
            }
        } catch (error: any) {
            setRedeemResult({
                success: false,
                error: error.message || 'Failed to redeem deal',
            });
            Alert.alert('Error', error.message || 'Failed to redeem deal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Redeem Deal</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Scanner Icon */}
                <View style={styles.iconContainer}>
                    <Scan size={80} color="#00D9A3" strokeWidth={1.5} />
                </View>

                <Text style={styles.title}>Enter Redemption Code</Text>
                <Text style={styles.subtitle}>
                    Ask the customer to show their QR code and enter the code below
                </Text>

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., a1b2c3-d4e5f6-789012"
                        value={redemptionCode}
                        onChangeText={setRedemptionCode}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                    />
                </View>

                {/* Redeem Button */}
                <TouchableOpacity
                    style={[styles.redeemButton, loading && styles.redeemButtonDisabled]}
                    onPress={handleRedeem}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.redeemButtonText}>Redeem Deal</Text>
                    )}
                </TouchableOpacity>

                {/* Result Display */}
                {redeemResult && (
                    <View
                        style={[
                            styles.resultContainer,
                            redeemResult.success ? styles.resultSuccess : styles.resultError,
                        ]}
                    >
                        {redeemResult.success ? (
                            <>
                                <CheckCircle size={48} color="#10B981" />
                                <Text style={styles.resultTitle}>Redeemed Successfully!</Text>
                                <View style={styles.resultDetails}>
                                    <Text style={styles.resultLabel}>Customer:</Text>
                                    <Text style={styles.resultValue}>
                                        {redeemResult.data.user?.name || redeemResult.data.user?.email}
                                    </Text>
                                </View>
                                <View style={styles.resultDetails}>
                                    <Text style={styles.resultLabel}>Deal:</Text>
                                    <Text style={styles.resultValue}>{redeemResult.data.deal?.title}</Text>
                                </View>
                                <View style={styles.resultDetails}>
                                    <Text style={styles.resultLabel}>Savings:</Text>
                                    <Text style={[styles.resultValue, styles.savingsValue]}>
                                        ₹{redeemResult.data.savings}
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <XCircle size={48} color="#EF4444" />
                                <Text style={styles.resultTitle}>Redemption Failed</Text>
                                <Text style={styles.errorText}>{redeemResult.error}</Text>
                            </>
                        )}
                    </View>
                )}

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>How to Redeem:</Text>
                    <Text style={styles.instructionItem}>1. Ask customer to open their claimed deal</Text>
                    <Text style={styles.instructionItem}>2. Customer shows QR code on their phone</Text>
                    <Text style={styles.instructionItem}>3. Enter the code shown below the QR code</Text>
                    <Text style={styles.instructionItem}>4. Tap "Redeem Deal" to complete</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0, 217, 163, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 24,
    },
    input: {
        width: '100%',
        height: 56,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111827',
    },
    redeemButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#00D9A3',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    redeemButtonDisabled: {
        opacity: 0.6,
    },
    redeemButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    resultContainer: {
        width: '100%',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    resultSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        borderColor: '#10B981',
    },
    resultError: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderColor: '#EF4444',
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginTop: 16,
        marginBottom: 16,
    },
    resultDetails: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    resultLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    resultValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
    },
    savingsValue: {
        color: '#10B981',
        fontSize: 16,
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
    },
    instructionsContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    instructionItem: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
        lineHeight: 20,
    },
});
