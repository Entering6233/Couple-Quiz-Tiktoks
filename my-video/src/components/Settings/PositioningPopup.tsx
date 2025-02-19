import React from 'react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

interface PositioningPopupProps {
    onClose: () => void;
    children: React.ReactNode;
}

const styles = {
    overlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
    },
    modal: {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.lg,
        width: '90vw',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column' as const,
        zIndex: 10000,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        margin: 0,
        color: theme.colors.text.primary,
        fontSize: theme.fontSizes.xl,
    },
    closeButton: {
        ...commonStyles.button,
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    },
    content: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: theme.colors.background.tertiary,
        borderRadius: theme.borderRadius.md,
        position: 'relative' as const,
    },
    canvas: {
        width: '100%',
        height: '100%',
        position: 'relative' as const,
        overflow: 'hidden',
        transform: 'scale(2)',
        transformOrigin: 'top left',
    },
};

export const PositioningPopup: React.FC<PositioningPopupProps> = ({ onClose, children }) => {
    return (
        <>
            <div style={styles.overlay} onClick={onClose} />
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Precise Positioning</h2>
                    <button style={styles.closeButton} onClick={onClose}>
                        Close
                    </button>
                </div>
                <div style={styles.content}>
                    <div style={styles.canvas}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}; 