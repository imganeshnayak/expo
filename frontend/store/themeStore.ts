import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, lightColors, darkColors } from '@/constants/theme';

interface ThemeState {
    isDarkMode: boolean;
    toggleTheme: () => void;
    setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isDarkMode: false, // Default to light mode
            toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
            setTheme: (isDark) => set({ isDarkMode: isDark }),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Hook to get the current theme object
export const useAppTheme = () => {
    const isDarkMode = useThemeStore((state) => state.isDarkMode);

    return {
        ...theme,
        colors: isDarkMode ? darkColors : lightColors,
        isDark: isDarkMode,
    };
};
