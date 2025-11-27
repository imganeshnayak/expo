import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, Apple } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useAuth } from '../_layout';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(''); // To highlight active input

    const handleLogin = async () => {
        Keyboard.dismiss();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            login(); // Set authentication state
            router.replace('/(tabs)');
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="light" />

            {/* Dismiss keyboard when tapping outside */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <LinearGradient
                            colors={[theme.colors.primary, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.decorationCircle}
                        />
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={[
                            styles.inputContainer,
                            isFocused === 'email' && styles.inputFocused
                        ]}>
                            <View style={styles.iconContainer}>
                                <Mail color={isFocused === 'email' ? theme.colors.primary : theme.colors.textSecondary} size={20} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setIsFocused('email')}
                                onBlur={() => setIsFocused('')}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={[
                            styles.inputContainer,
                            isFocused === 'password' && styles.inputFocused
                        ]}>
                            <View style={styles.iconContainer}>
                                <Lock color={isFocused === 'password' ? theme.colors.primary : theme.colors.textSecondary} size={20} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onFocus={() => setIsFocused('password')}
                                onBlur={() => setIsFocused('')}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                {showPassword ? (
                                    <EyeOff color={theme.colors.textSecondary} size={20} />
                                ) : (
                                    <Eye color={theme.colors.textSecondary} size={20} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.primaryDark]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </Text>
                                {!isLoading && <ArrowRight color="#FFF" size={20} strokeWidth={2.5} />}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footerSection}>
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialButtons}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Chrome color={theme.colors.text} size={22} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                {/* Assuming you might want an Apple icon here for the second empty button */}
                                <View style={{ width: 22, height: 22, backgroundColor: theme.colors.text, borderRadius: 4 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.signupContainer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <Link href="/auth/register" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>

                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: theme.spacing.xl,
        paddingTop: theme.spacing.xxxl, // Extra top padding for visual balance
        paddingBottom: 40, // Bottom padding for scrolling space
    },
    decorationCircle: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 200,
        height: 200,
        borderRadius: 100,
        opacity: 0.1,
    },
    header: {
        marginBottom: 40,
        position: 'relative',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 16, // More rounded
        height: 60, // Slightly taller for modern look
        borderWidth: 1.5,
        borderColor: theme.colors.surfaceLight,
        paddingHorizontal: 16,
        // Shadow for sleekness
        shadowColor: theme.colors.shadow || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface, // Ensure it stays solid
    },
    iconContainer: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
    },
    eyeIcon: {
        padding: 8,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    forgotPasswordText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        borderRadius: 16,
        gap: 10,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footerSection: {
        marginTop: 40,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.surfaceLight,
    },
    dividerText: {
        color: theme.colors.textTertiary,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 30,
    },
    socialButton: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: theme.colors.textSecondary,
        fontSize: 15,
    },
    linkText: {
        color: theme.colors.primary,
        fontSize: 15,
        fontWeight: 'bold',
    },
});