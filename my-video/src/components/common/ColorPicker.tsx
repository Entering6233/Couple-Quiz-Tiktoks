import React from 'react';
import { theme } from '../../styles/theme';

interface ColorPickerProps {
    label: string;
    color: string;
    onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    label,
    color,
    onChange,
}) => {
    return (
        <div style={styles.container}>
            <label style={styles.label}>{label}</label>
            <div style={styles.inputContainer}>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    style={styles.colorInput}
                />
                <input
                    type="text"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    style={styles.textInput}
                />
            </div>
        </div>
    );
};

const styles = {
    container: {
        marginBottom: theme.spacing.sm,
    },
    label: {
        display: 'block',
        marginBottom: theme.spacing.xs,
        color: theme.colors.text.primary,
        fontSize: theme.fontSizes.sm,
    },
    inputContainer: {
        display: 'flex',
        gap: theme.spacing.sm,
        alignItems: 'center',
    },
    colorInput: {
        width: '40px',
        height: '40px',
        padding: 0,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.sm,
        cursor: 'pointer',
    },
    textInput: {
        flex: 1,
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.background.tertiary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.sm,
        color: theme.colors.text.primary,
        fontSize: theme.fontSizes.sm,
    },
}; 