import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { theme, lightColors, darkColors, commonTheme } from '../../constants/theme';

const { width } = Dimensions.get('window');

import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading, error } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? darkColors : lightColors;
    const activeTheme = { ...commonTheme, colors };

    const handleLogin = async () => {
        if (!email || !password) return;

        try {
            await login(email, password);
            // Check if setup is complete by looking for businessType (set during setup)
            const user = useAuthStore.getState().user;
            // If user has businessType and address, they've completed setup
            const isSetupComplete = user?.businessType && user?.address;
            if (isSetupComplete) {
                router.replace('/(tabs)/analytics');
            } else {
                router.replace('/(auth)/setup');
            }
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: activeTheme.colors.background }]}>
            <LinearGradient
                colors={[activeTheme.colors.background, activeTheme.colors.surface, activeTheme.colors.background]}
                style={StyleSheet.absoluteFill}
            />

            {/* Background ambient lights */}
            <View style={[styles.ambientLight, { top: -100, left: -100, backgroundColor: activeTheme.colors.primary }]} />
            <View style={[styles.ambientLight, { bottom: -100, right: -100, backgroundColor: activeTheme.colors.info }]} />

            <BlurView intensity={30} style={StyleSheet.absoluteFill} tint={colorScheme === 'dark' ? 'dark' : 'light'} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: activeTheme.colors.text }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: activeTheme.colors.textSecondary }]}>Sign in to continue managing your business</Text>
                </View>

                <View style={styles.form}>
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

                    {error && (
                        <Text style={{ color: activeTheme.colors.error, textAlign: 'center' }}>{error}</Text>
                    )}

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={[styles.forgotPasswordText, { color: activeTheme.colors.primary }]}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={activeTheme.colors.gradientPrimary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>{isLoading ? 'Signing In...' : 'Sign In'}</Text>
                            {!isLoading && <ArrowRight color="#000" size={20} />}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: activeTheme.colors.textSecondary }]}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/register' as any)}>
                            <Text style={[styles.linkText, { color: activeTheme.colors.primary }]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        justifyContent: 'center',
        padding: 24,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 8,
    },
    forgotPasswordText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontFamily: theme.fontFamily.primary,
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
