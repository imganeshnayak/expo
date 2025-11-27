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
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useAuth } from '../_layout';

export default function RegisterScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // State to track which input is currently active for styling
    const [isFocused, setIsFocused] = useState('');

    const handleRegister = async () => {
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

                    {/* Header Section */}
                    <View style={styles.header}>
                        <LinearGradient
                            colors={[theme.colors.primary, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.decorationCircle}
                        />
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join the UMA community today</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>

                        {/* Name Input */}
                        <View style={[
                            styles.inputContainer,
                            isFocused === 'name' && styles.inputFocused
                        ]}>
                            <View style={styles.iconContainer}>
                                <User color={isFocused === 'name' ? theme.colors.primary : theme.colors.textSecondary} size={20} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                onFocus={() => setIsFocused('name')}
                                onBlur={() => setIsFocused('')}
                            />
                        </View>

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

                        {/* Confirm Password Input */}
                        <View style={[
                            styles.inputContainer,
                            isFocused === 'confirm' && styles.inputFocused
                        ]}>
                            <View style={styles.iconContainer}>
                                <Lock color={isFocused === 'confirm' ? theme.colors.primary : theme.colors.textSecondary} size={20} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                onFocus={() => setIsFocused('confirm')}
                                onBlur={() => setIsFocused('')}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff color={theme.colors.textSecondary} size={20} />
                                ) : (
                                    <Eye color={theme.colors.textSecondary} size={20} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={handleRegister}
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
                                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                                </Text>
                                {!isLoading && <ArrowRight color="#FFF" size={20} strokeWidth={2.5} />}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/auth/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>Sign In</Text>
                            </TouchableOpacity>
                        </Link>
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
        paddingTop: 60, // Extra padding for header
        paddingBottom: 40,
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
        borderRadius: 16, // Modern pill shape
        height: 60, // Taller click area
        borderWidth: 1.5,
        borderColor: theme.colors.surfaceLight,
        paddingHorizontal: 16,
        // Subtle shadow
        shadowColor: theme.colors.shadow || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
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
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        borderRadius: 16,
        gap: 10,
        marginTop: 10,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
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