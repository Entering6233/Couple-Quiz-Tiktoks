import { theme } from './theme';

export const commonStyles = {
    card: {
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        boxShadow: theme.shadows.md,
        border: `1px solid ${theme.colors.border}`,
    },
    input: {
        backgroundColor: theme.colors.background.tertiary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.text.primary,
        fontSize: '14px',
        width: '100%',
        outline: 'none',
        transition: 'all 0.2s ease',
        '&:focus': {
            borderColor: theme.colors.primary,
            boxShadow: `0 0 0 2px ${theme.colors.primary}25`,
        },
    },
    button: {
        primary: {
            backgroundColor: theme.colors.primary,
            color: theme.colors.text.primary,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                backgroundColor: `${theme.colors.primary}E6`,
            },
            '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed',
            },
        },
        secondary: {
            backgroundColor: 'transparent',
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.md,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                backgroundColor: theme.colors.background.tertiary,
            },
        },
    },
    label: {
        color: theme.colors.text.secondary,
        fontSize: '14px',
        marginBottom: theme.spacing.xs,
        display: 'block',
    },
    heading: {
        color: theme.colors.text.primary,
        margin: `${theme.spacing.md} 0`,
    },
}; 