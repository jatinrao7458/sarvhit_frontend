import { createContext, useContext, useState, useEffect } from 'react';

var ThemeContext = createContext();

export function ThemeProvider({ children }) {
    var [theme, setTheme] = useState(function() {
        try {
            return localStorage.getItem('sarvhit-theme') || 'light';
        } catch(e) {
            return 'light';
        }
    });

    useEffect(function() {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('sarvhit-theme', theme);
        } catch(e) { /* ignore */ }
    }, [theme]);

    function toggleTheme() {
        setTheme(function(t) { return t === 'dark' ? 'light' : 'dark'; });
    }

    return (
        <ThemeContext.Provider value={{ theme: theme, toggleTheme: toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    var ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
