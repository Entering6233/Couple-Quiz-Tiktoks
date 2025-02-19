import React from 'react';
import { theme } from '../../styles/theme';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ label, value, options, onChange }) => {
    return (
        <div style={styles.container}>
            <label style={styles.label}>{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={styles.select}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: theme.spacing.xs,
    },
    label: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.text.secondary,
    },
    select: {
        backgroundColor: theme.colors.background.secondary,
        color: theme.colors.text.primary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        fontSize: theme.fontSizes.sm,
        cursor: 'pointer',
        outline: 'none',
        '&:focus': {
            borderColor: theme.colors.primary,
        },
    },
}; 