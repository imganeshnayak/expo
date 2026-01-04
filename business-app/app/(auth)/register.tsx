import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, ScrollView, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { theme, lightColors, darkColors, commonTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? darkColors : lightColors;
    const activeTheme = { ...commonTheme, colors };

    const { register, error, isLoading } = useAuthStore();

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            await register({
                email,
                password,
                businessName: 'My Business', // TODO: Add business name input
                name: fullName,
                phone: '1234567890', // TODO: Add phone input
            });
            // Navigation is handled by the store or we can do it here
            router.replace('/(tabs)/analytics');
        } catch (err: any) {
            console.error('Registration error:', err);
            Alert.alert('Error', err.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: activeTheme.colors.background }]}>
            <LinearGradient
                colors={[activeTheme.colors.background, activeTheme.colors.surface, activeTheme.colors.background]}
                style={StyleSheet.absoluteFill}
            />

            {/* Background ambient lights */}
            <View style={[styles.ambientLight, { top: -100, right: -100, backgroundColor: activeTheme.colors.secondary }]} />
            <View style={[styles.ambientLight, { bottom: -100, left: -100, backgroundColor: activeTheme.colors.primary }]} />

            <BlurView intensity={30} style={StyleSheet.absoluteFill} tint={colorScheme === 'dark' ? 'dark' : 'light'} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: activeTheme.colors.surface }]}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft color={activeTheme.colors.text} size={24} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={[styles.title, { color: activeTheme.colors.text }]}>Create Account</Text>
                        <Text style={[styles.subtitle, { color: activeTheme.colors.textSecondary }]}>Join us and start growing your business today</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={[styles.inputContainer, { backgroundColor: activeTheme.colors.surface, borderColor: activeTheme.colors.surfaceLight }]}>
                            <User color={activeTheme.colors.textTertiary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: activeTheme.colors.text }]}
                                placeholder="Full Name"
                                placeholderTextColor={activeTheme.colors.textTertiary}
                                value={fullName}
                                onChangeText={setFullName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={[styles.inputContainer, { backgroundColor: activeTheme.colors.surface, borderColor: activeTheme.colors.surfaceLight }]}>
                            <Mail color={activeTheme.colors.textTertiary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: activeTheme.colors.text }]}
                                placeholder="Email Address"
                                placeholderTextColor={activeTheme.colors.textTertiary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={[styles.inputContainer, { backgroundColor: activeTheme.colors.surface, borderColor: activeTheme.colors.surfaceLight }]}>
                            <Lock color={activeTheme.colors.textTertiary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: activeTheme.colors.text }]}
                                placeholder="Password"
                                placeholderTextColor={activeTheme.colors.textTertiary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOff color={activeTheme.colors.textTertiary} size={20} />
                                ) : (
                                    <Eye color={activeTheme.colors.textTertiary} size={20} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.inputContainer, { backgroundColor: activeTheme.colors.surface, borderColor: activeTheme.colors.surfaceLight }]}>
                            <Lock color={activeTheme.colors.textTertiary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: activeTheme.colors.text }]}
                                placeholder="Confirm Password"
                                placeholderTextColor={activeTheme.colors.textTertiary}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? (
                                    <EyeOff color={activeTheme.colors.textTertiary} size={20} />
                                ) : (
                                    <Eye color={activeTheme.colors.textTertiary} size={20} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={activeTheme.colors.gradientPrimary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
                                {!isLoading && <ArrowRight color="#000" size={20} />}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: activeTheme.colors.textSecondary }]}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={[styles.linkText, { color: activeTheme.colors.primary }]}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    ambientLight: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.15,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    backButton: {
        marginBottom: 24,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontFamily: theme.fontFamily.heading,
        fontSize: 42,
        color: theme.colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontFamily: theme.fontFamily.primary,
        fontSize: 16,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        height: 56,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        fontFamily: theme.fontFamily.primary,
        fontSize: 16,
    },
    button: {
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        gap: 8,
    },
    buttonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: theme.fontFamily.primary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontFamily: theme.fontFamily.primary,
    },
    linkText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
        fontFamily: theme.fontFamily.primary,
    },
});
