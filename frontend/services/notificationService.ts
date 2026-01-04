import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Strict check for Expo Go on Android
const isExpoGo = Constants.appOwnership === 'expo';
const isAndroid = Platform.OS === 'android';
const shouldSkipNotifications = isExpoGo && isAndroid;

// Lazy load expo-notifications
let Notifications: any;

if (!shouldSkipNotifications) {
    try {
        Notifications = require('expo-notifications');

        // Configure how notifications behave when the app is in the foreground
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    } catch (e) {
        console.log('expo-notifications module not available or crashed on import');
    }
} else {
    console.log('⚠️ Skipping expo-notifications import on Android Expo Go (SDK 53 limitation)');
}

export async function registerForPushNotificationsAsync() {
    let token;

    if (shouldSkipNotifications) {
        console.log('Returning mock token for Android Expo Go');
        return 'ExponentPushToken[TestTokenForExpoGoSDK53]';
    }

    if (!Notifications) {
        console.log('Notifications module not loaded, returning mock token');
        return 'ExponentPushToken[TestTokenForExpoGoSDK53]';
    }

    if (Platform.OS === 'android') {
        try {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        } catch (e) {
            console.log('Error setting notification channel:', e);
        }
    }

    if (Device.isDevice) {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            // Get the token
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

            if (!projectId) {
                console.log('Project ID not found. Skipping push token generation.');
                return;
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;
            console.log('Expo Push Token:', token);
        } catch (e: any) {
            console.error('Error getting push token:', e);
            // Handle Expo Go SDK 53+ limitation
            if (e.message && e.message.includes('Expo Go') || e.message.includes('PushTokenAutoRegistration')) {
                console.log('⚠️ Detected Expo Go SDK 53+. Using mock token for testing flow.');
                token = 'ExponentPushToken[TestTokenForExpoGoSDK53]';
            }
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export function getNotificationsModule() {
    return Notifications;
}
