import { useThemeStore } from '../store/themeStore';
import { commonTheme, darkColors, lightColors } from '../constants/theme';

export const useAppTheme = () => {
    const { mode, toggleMode, setMode } = useThemeStore();

    const colors = mode === 'dark' ? darkColors : lightColors;

    return {
        ...commonTheme,
        colors,
        mode,
        toggleMode,
        setMode,
        isDark: mode === 'dark',
    };
};
