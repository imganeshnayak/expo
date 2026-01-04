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
import { useUserStore } from './userStore';

export const useAppTheme = () => {
    const isDarkMode = useThemeStore((state) => state.isDarkMode);
    // Get rank safely (might be null during init)
    const rank = useUserStore((state) => state.gamification?.rank?.league);

    let colors = isDarkMode ? { ...darkColors } : { ...lightColors };

    // RANK THEME OVERRIDES
    if (rank === 'Gold') {
        colors = {
            ...colors,
            primary: '#FFD700', // Gold
            primaryLight: 'rgba(255, 215, 0, 0.2)',
        };
    } else if (rank === 'Platinum') {
        colors = {
            ...colors,
            primary: '#E5E4E2', // Platinum
            background: isDarkMode ? '#000000' : colors.background, // Pure Black if Dark Mode
            surface: isDarkMode ? '#111111' : colors.surface,
        };
    } else if (rank === 'Diamond') {
        colors = {
            ...colors,
            primary: '#00F0FF', // Cyan/Holo
            primaryLight: 'rgba(0, 240, 255, 0.2)',
        };
    } else if (rank === 'Silver') {
        // Subtle silver tint
        colors = {
            ...colors,
            primary: isDarkMode ? '#C0C0C0' : '#A0A0A0',
        }
    }

    return {
        ...theme,
        colors,
        isDark: isDarkMode,
        mode: rank || 'Bronze', // Expose mode for advanced UI checks
    };
};
