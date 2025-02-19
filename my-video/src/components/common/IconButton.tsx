import React, { useState } from 'react';
import { theme } from '../../styles/theme';

interface IconButtonProps {
    icon: string;
    onClick: () => void;
    tooltip?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'ghost';
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    onClick,
    tooltip,
    disabled = false,
    size = 'md',
    variant = 'ghost',
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const sizeMap = {
        sm: {
            padding: theme.spacing.xs,
            fontSize: theme.fontSizes.sm,
        },
        md: {
            padding: theme.spacing.sm,
            fontSize: theme.fontSizes.md,
        },
        lg: {
            padding: theme.spacing.md,
            fontSize: theme.fontSizes.lg,
        },
    };

    const variantMap = {
        primary: {
            backgroundColor: theme.colors.primary,
            color: theme.colors.text.primary,
            hoverBg: theme.colors.accent.red,
        },
        secondary: {
            backgroundColor: theme.colors.background.tertiary,
            color: theme.colors.text.primary,
            hoverBg: theme.colors.background.secondary,
        },
        ghost: {
            backgroundColor: 'transparent',
            color: theme.colors.text.primary,
            hoverBg: theme.colors.background.tertiary,
        },
    };

    const currentVariant = variantMap[variant];

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={tooltip}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                border: 'none',
                borderRadius: theme.borderRadius.md,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: theme.transitions.fast,
                backgroundColor: isHovered && !disabled ? currentVariant.hoverBg : currentVariant.backgroundColor,
                color: currentVariant.color,
                ...sizeMap[size],
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: sizeMap[size].fontSize,
                minHeight: sizeMap[size].fontSize,
                padding: sizeMap[size].padding,
                outline: 'none',
                boxShadow: isHovered && !disabled ? theme.shadows.sm : 'none',
            }}
        >
            {icon}
        </button>
    );
}; 