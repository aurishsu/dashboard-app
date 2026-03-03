import { useEffect, useMemo, useState } from 'react';
import { ThemeContext, type ThemeMode } from './theme-context';

const THEME_STORAGE_KEY = 'ledger_theme_v1';

function getInitialTheme(): ThemeMode {
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    if (urlTheme === 'light' || urlTheme === 'dark') {
        return urlTheme;
    }

    try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
    } catch (error) {
        console.error('Failed to read theme from localStorage', error);
    }

    return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        root.style.colorScheme = theme;

        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.error('Failed to save theme to localStorage', error);
        }
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        isDark: theme === 'dark',
        setTheme,
        toggleTheme: () => setTheme(current => current === 'dark' ? 'light' : 'dark'),
    }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
