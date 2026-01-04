import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface UnityWebGLProps {
    /** Path to Unity WebGL build index.html */
    buildPath?: string;
    /** Battle session data to pass to Unity */
    sessionData?: {
        sessionId: string;
        mode: string;
        opponentName: string;
        stake?: { type: string; amount: number };
    };
    /** Called when battle ends */
    onBattleEnd?: (result: {
        won: boolean;
        playerScore: number;
        opponentScore: number;
        duration: number;
    }) => void;
    /** Called when user exits */
    onExit?: () => void;
    /** Show loading overlay */
    loading?: boolean;
}

/**
 * UnityWebGL Component
 * Embeds Unity WebGL build in a WebView for in-app Utopia Arena battles
 */
export default function UnityWebGL({
    buildPath = '/unity/index.html',
    sessionData,
    onBattleEnd,
    onExit,
    loading = false,
}: UnityWebGLProps) {
    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Inject session data into Unity
    const injectedJavaScript = `
        window.UTOPIA_SESSION = ${JSON.stringify(sessionData || {})};
        
        // Bridge for Unity to communicate with React Native
        window.UtopiaArena = {
            onBattleEnd: function(result) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'BATTLE_END',
                    data: result
                }));
            },
            onReady: function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'UNITY_READY'
                }));
            },
            onError: function(error) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'UNITY_ERROR',
                    data: { message: error }
                }));
            }
        };
        
        true; // Required for injectedJavaScript
    `;

    // Handle messages from Unity WebGL
    const handleMessage = (event: { nativeEvent: { data: string } }) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);

            switch (message.type) {
                case 'UNITY_READY':
                    console.log('[UnityWebGL] Unity is ready');
                    setIsLoading(false);
                    break;

                case 'BATTLE_END':
                    Haptics.notificationAsync(
                        message.data.won
                            ? Haptics.NotificationFeedbackType.Success
                            : Haptics.NotificationFeedbackType.Error
                    );
                    onBattleEnd?.(message.data);
                    break;

                case 'UNITY_ERROR':
                    console.error('[UnityWebGL] Error:', message.data.message);
                    setError(message.data.message);
                    break;

                default:
                    console.log('[UnityWebGL] Unknown message:', message);
            }
        } catch (e) {
            console.error('[UnityWebGL] Failed to parse message:', e);
        }
    };

    const handleRetry = () => {
        setError(null);
        setIsLoading(true);
        webViewRef.current?.reload();
    };

    // Placeholder until WebGL build is available
    const placeholderHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    margin: 0;
                    background: linear-gradient(135deg, #0A0A0F 0%, #1A0A1F 50%, #0A1A2F 100%);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: -apple-system, system-ui, sans-serif;
                    color: white;
                }
                .logo { font-size: 64px; margin-bottom: 20px; }
                .title { font-size: 28px; font-weight: 800; margin-bottom: 10px; }
                .subtitle { font-size: 14px; opacity: 0.6; text-align: center; }
                .status { 
                    margin-top: 40px; 
                    padding: 16px 24px; 
                    background: rgba(0,217,163,0.1); 
                    border-radius: 12px;
                    border: 1px solid rgba(0,217,163,0.3);
                }
                .status-text { color: #00D9A3; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="logo">🏟️</div>
            <div class="title">UTOPIA ARENA</div>
            <div class="subtitle">Unity WebGL build will appear here</div>
            <div class="status">
                <span class="status-text">⚡ Build WebGL from Unity Editor</span>
            </div>
            <script>
                // Signal ready
                setTimeout(function() {
                    if (window.UtopiaArena) {
                        window.UtopiaArena.onReady();
                    }
                }, 1000);
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onExit}>
                    <ArrowLeft size={22} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>🏟️ UTOPIA ARENA</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* WebView Container */}
            <View style={styles.webViewContainer}>
                <WebView
                    ref={webViewRef}
                    source={{ html: placeholderHtml }}
                    // For actual WebGL: source={{ uri: buildPath }}
                    style={styles.webView}
                    injectedJavaScript={injectedJavaScript}
                    onMessage={handleMessage}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    onError={(e) => setError(e.nativeEvent.description)}
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled
                    domStorageEnabled
                    allowFileAccess
                    allowUniversalAccessFromFileURLs
                    mixedContentMode="always"
                    originWhitelist={['*']}
                />

                {/* Loading Overlay */}
                {(isLoading || loading) && (
                    <View style={styles.loadingOverlay}>
                        <LinearGradient
                            colors={['#0A0A0F', '#1A0A1F', '#0A1A2F']}
                            style={StyleSheet.absoluteFill}
                        />
                        <ActivityIndicator size="large" color="#00D9A3" />
                        <Text style={styles.loadingText}>Loading Arena...</Text>
                    </View>
                )}

                {/* Error Overlay */}
                {error && (
                    <View style={styles.errorOverlay}>
                        <LinearGradient
                            colors={['#0A0A0F', '#2E0A0A', '#0A1A2F']}
                            style={StyleSheet.absoluteFill}
                        />
                        <Text style={styles.errorTitle}>Failed to Load</Text>
                        <Text style={styles.errorMessage}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                            <RefreshCw size={18} color="#FFF" />
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0F',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 1,
    },
    webViewContainer: {
        flex: 1,
    },
    webView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#8B949E',
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#EF4444',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    retryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
});
