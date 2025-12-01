import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@uma_merchant_token';
const USER_KEY = '@uma_merchant_user';

export const storage = {
    // Token management
    async saveToken(token: string): Promise<void> {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    },

    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem(TOKEN_KEY);
    },

    async removeToken(): Promise<void> {
        await AsyncStorage.removeItem(TOKEN_KEY);
    },

    // User data management
    async saveUser(user: any): Promise<void> {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    async getUser(): Promise<any | null> {
        const user = await AsyncStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    async removeUser(): Promise<void> {
        await AsyncStorage.removeItem(USER_KEY);
    },

    // Clear all data
    async clearAll(): Promise<void> {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    },
};
