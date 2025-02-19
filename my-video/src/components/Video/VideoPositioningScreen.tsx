import React from 'react';
import { VideoComponent } from '../../types/script';
import { theme } from '../../styles/theme';

interface VideoPositioningScreenProps {
    component: VideoComponent;
    onChange: (component: VideoComponent) => void;
}

export const VideoPositioningScreen: React.FC<VideoPositioningScreenProps> = ({ component, onChange }) => {
    const handlePositionChange = (x: number, y: number) => {
        onChange({
            ...component,
            style: {
                ...component.style,
                position: { x, y }
            }
        });
    };

    const handleSizeChange = (width: number, height: number) => {
        onChange({
            ...component,
            style: {
                ...component.style,
                width,
                height
            }
        });
    };

    const handleTimeChange = (startTime: number, duration: number) => {
        onChange({
            ...component,
            style: {
                ...component.style,
                startTime,
                duration
            }
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Position</h3>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>X Position (%)</label>
                    <input
                        type="number"
                        value={component.style?.position?.x || 0}
                        onChange={(e) => handlePositionChange(Number(e.target.value), component.style?.position?.y || 0)}
                        style={styles.input}
                        min={-100}
                        max={100}
                        step={1}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Y Position (%)</label>
                    <input
                        type="number"
                        value={component.style?.position?.y || 0}
                        onChange={(e) => handlePositionChange(component.style?.position?.x || 0, Number(e.target.value))}
                        style={styles.input}
                        min={-100}
                        max={100}
                        step={1}
                    />
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Size</h3>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Width (%)</label>
                    <input
                        type="number"
                        value={component.style?.width || 100}
                        onChange={(e) => handleSizeChange(Number(e.target.value), component.style?.height || 100)}
                        style={styles.input}
                        min={1}
                        max={500}
                        step={1}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Height (%)</label>
                    <input
                        type="number"
                        value={component.style?.height || 100}
                        onChange={(e) => handleSizeChange(component.style?.width || 100, Number(e.target.value))}
                        style={styles.input}
                        min={1}
                        max={500}
                        step={1}
                    />
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Time Control</h3>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Start Time (seconds)</label>
                    <input
                        type="number"
                        value={component.style?.startTime || 0}
                        onChange={(e) => handleTimeChange(Number(e.target.value), component.style?.duration || 0)}
                        style={styles.input}
                        min={0}
                        step={0.1}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Duration (seconds)</label>
                    <input
                        type="number"
                        value={component.style?.duration || 0}
                        onChange={(e) => handleTimeChange(component.style?.startTime || 0, Number(e.target.value))}
                        style={styles.input}
                        min={0.1}
                        step={0.1}
                    />
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '1rem',
        backgroundColor: theme.backgroundLight,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem',
    },
    section: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
    },
    sectionTitle: {
        margin: 0,
        color: theme.textPrimary,
        fontSize: '1rem',
        fontWeight: 600,
    },
    inputGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    label: {
        color: theme.textSecondary,
        fontSize: '0.9rem',
        minWidth: '120px',
    },
    input: {
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        border: `1px solid ${theme.borderColor}`,
        backgroundColor: theme.backgroundDark,
        color: theme.textPrimary,
        width: '80px',
    },
}; 