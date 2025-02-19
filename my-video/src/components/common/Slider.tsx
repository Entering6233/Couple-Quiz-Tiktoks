import React from 'react';
import { theme } from '../../styles/theme';

interface SliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
}

export const Slider: React.FC<SliderProps> = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
}) => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <label style={styles.label}>{label}</label>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    min={min}
                    max={max}
                    step={step}
                    style={styles.numberInput}
                />
            </div>
            <input
                type="range"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                step={step}
                style={styles.slider}
            />
        </div>
    );
};

const styles = {
    container: {
        marginBottom: theme.spacing.sm,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    label: {
        color: theme.colors.text.primary,
        fontSize: theme.fontSizes.sm,
    },
    numberInput: {
        width: '60px',
        padding: theme.spacing.xs,
        backgroundColor: theme.colors.background.tertiary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.sm,
        color: theme.colors.text.primary,
        fontSize: theme.fontSizes.sm,
        textAlign: 'right' as const,
    },
    slider: {
        width: '100%',
        height: '2px',
        WebkitAppearance: 'none',
        background: theme.colors.primary,
        outline: 'none',
        opacity: 0.7,
        transition: 'opacity 0.2s',
        cursor: 'pointer',
        '&:hover': {
            opacity: 1,
        },
        '&::-webkit-slider-thumb': {
            WebkitAppearance: 'none',
            appearance: 'none',
            width: '16px',
            height: '16px',
            background: theme.colors.primary,
            borderRadius: '50%',
            cursor: 'pointer',
        },
        '&::-moz-range-thumb': {
            width: '16px',
            height: '16px',
            background: theme.colors.primary,
            borderRadius: '50%',
            cursor: 'pointer',
        },
    },
}; 