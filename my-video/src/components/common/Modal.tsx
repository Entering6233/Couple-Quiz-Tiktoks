import React, { useEffect } from 'react';
import { theme } from '../../styles/theme';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = (props) => {
    const { isOpen, onClose, title, children } = props;

    // Add detailed logging for Modal render and props
    useEffect(() => {
        console.log('Modal - Mount/Update:', {
            isOpen,
            hasTitle: !!title,
            hasChildren: !!children,
            childrenType: children ? typeof children : null
        });
    }, [isOpen, title, children]);

    if (!isOpen) {
        console.log('Modal - Not rendering (closed)');
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: '48px', // Header height
            left: 0,
            width: '75%', // Match the timeline section width
            height: 'calc(100vh - 48px)',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: theme.spacing.xl,
        }}>
            <div style={{
                backgroundColor: theme.colors.background.primary,
                borderRadius: theme.borderRadius.lg,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                marginLeft: theme.spacing.xl,
            }}>
                {/* Header */}
                <div style={{
                    padding: theme.spacing.lg,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.background.secondary,
                    position: 'relative',
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: theme.spacing.md,
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: theme.colors.text.secondary,
                            fontSize: '24px',
                            cursor: 'pointer',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: theme.borderRadius.sm,
                            transition: 'all 0.2s ease',
                            ':hover': {
                                backgroundColor: theme.colors.background.tertiary,
                                color: theme.colors.text.primary,
                            }
                        }}
                    >
                        ×
                    </button>
                    <div style={{ paddingRight: '32px' }}>
                        {title}
                    </div>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: theme.spacing.lg,
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
}; 