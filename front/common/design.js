export const Colors = {
    primary: '#893571', 
    secondary: '#b8658f',
    textPrimary: '#333333',
    textSecondary: '#666666',
    highlight: '#d9882a',
    inputBackground: '#f9f9f9',
    border: '#ddd',
    shadow: '#aaa',
    googleIcon: '#DB4437',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FFCC00',
    background: '#FFFFFF',
    lightPurple: '#f5eef3',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
};

export const Shadows = {
    small: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    large: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
};

// Re-export Typography
export { Typography } from './typography';
