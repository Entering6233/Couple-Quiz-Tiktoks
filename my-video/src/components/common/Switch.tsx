import React from 'react';
import { theme } from '../../styles/theme';

interface SwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({
    label,
    checked,
    onChange,
}) => {
    return (
        <div style={styles.container}>
            <label style={styles.label}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    style={styles.input}
                />
                <span style={styles.switch}>
                    <span style={{
                        ...styles.slider,
                        transform: checked ? 'translateX(20px)' : 'translateX(0)',
                        backgroundColor: checked ? theme.colors.primary : theme.colors.background.tertiary,
                    }} />
                </span>
                <span style={styles.text}>{label}</span>
            </label>
        </div>
    );
};

const styles = {
    container: {
        marginBottom: theme.spacing.sm,
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none' as const,
    },
    input: {
        display: 'none',
    },
    switch: {
        position: 'relative' as const,
        display: 'inline-block',
        width: '40px',
        height: '20px',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: '10px',
        marginRight: theme.spacing.sm,
    },
    slider: {
        position: 'absolute' as const,
        top: '2px',
        left: '2px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        transition: 'transform 0.2s, background-color 0.2s',
    },
    text: {
        color: theme.colors.text.primary,
        fontSize: theme.fontSizes.sm,
    },
}; 