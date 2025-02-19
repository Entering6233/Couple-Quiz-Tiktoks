import React from 'react';
import { VideoComponent, AnimationOptions } from '../../types/script';
import { theme } from '../../styles/theme';

interface VideoComponentEditorProps {
    component: VideoComponent;
    onChange: (updated: VideoComponent) => void;
}

export const VideoComponentEditor: React.FC<VideoComponentEditorProps> = ({
    component,
    onChange,
}) => {
    const handleStyleChange = (updated: Partial<VideoComponent['style']>) => {
        onChange({
            ...component,
            style: {
                ...component.style,
                ...updated
            }
        });
    };

    const handleAnimationChange = (updates: Partial<AnimationOptions>) => {
        const currentAnimation = component.style?.animation || {
            type: 'none',
            direction: 'in',
            easing: 'easeInOut',
            duration: 30,
            delay: 0,
            stagger: 0
        };
        handleStyleChange({
            animation: {
                ...currentAnimation,
                ...updates,
            }
        });
    };

    const handleChromakeyChange = (updates: Partial<NonNullable<VideoComponent['style']>['chromakey']>) => {
        const currentChromakey = component.style?.chromakey || {
            enabled: false,
            color: '#00ff00',
            similarity: 0.4,
            smoothness: 0.1
        };
        handleStyleChange({
            chromakey: {
                ...currentChromakey,
                ...updates,
            }
        });
    };

    return (
        <div style={styles.container}>
            {/* Video URL */}
            <div style={styles.section}>
                <label style={styles.label}>Video URL:</label>
                <input
                    type="text"
                    value={component.videoUrl}
                    onChange={(e) => {
                        onChange({
                            ...component,
                            videoUrl: e.target.value
                        });
                    }}
                    style={styles.input}
                    placeholder="Enter video URL (supports video files and GIFs)..."
                />
            </div>

            {/* Size and Position */}
            <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Size & Position</h4>
                <div style={styles.settingsGrid}>
                    <div>
                        <label style={styles.label}>Width (%):</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={component.style?.width || 100}
                            onChange={(e) => handleStyleChange({ width: Number(e.target.value) })}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Height (%):</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={component.style?.height || 100}
                            onChange={(e) => handleStyleChange({ height: Number(e.target.value) })}
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.settingsGrid}>
                    <div>
                        <label style={styles.label}>X Position (%):</label>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={component.style?.position?.x || 0}
                            onChange={(e) => handleStyleChange({
                                position: {
                                    x: Number(e.target.value),
                                    y: component.style?.position?.y || 0
                                }
                            })}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Y Position (%):</label>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={component.style?.position?.y || 0}
                            onChange={(e) => handleStyleChange({
                                position: {
                                    x: component.style?.position?.x || 0,
                                    y: Number(e.target.value)
                                }
                            })}
                            style={styles.input}
                        />
                    </div>
                </div>
            </div>

            {/* Transform */}
            <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Transform</h4>
                <div style={styles.settingsGrid}>
                    <div>
                        <label style={styles.label}>Scale:</label>
                        <input
                            type="number"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={component.style?.scale || 1}
                            onChange={(e) => handleStyleChange({ scale: Number(e.target.value) })}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Rotation (deg):</label>
                        <input
                            type="number"
                            min="-360"
                            max="360"
                            value={component.style?.rotation || 0}
                            onChange={(e) => handleStyleChange({ rotation: Number(e.target.value) })}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Opacity:</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={component.style?.opacity || 1}
                            onChange={(e) => handleStyleChange({ opacity: Number(e.target.value) })}
                            style={styles.input}
                        />
                    </div>
                </div>
            </div>

            {/* Playback Settings */}
            <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Playback Settings</h4>
                <div style={styles.settingsGrid}>
                    <div>
                        <label style={styles.label}>Volume:</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={component.style?.volume || 1}
                            onChange={(e) => handleStyleChange({ volume: Number(e.target.value) })}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Playback Rate:</label>
                        <input
                            type="number"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={component.style?.playbackRate || 1}
                            onChange={(e) => handleStyleChange({ playbackRate: Number(e.target.value) })}
                            style={styles.input}
                        />
                    </div>
                </div>
                <div style={styles.row}>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={component.style?.loop || false}
                            onChange={(e) => handleStyleChange({ loop: e.target.checked })}
                        />
                        Loop Video
                    </label>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={component.style?.muted || false}
                            onChange={(e) => handleStyleChange({ muted: e.target.checked })}
                        />
                        Mute Audio
                    </label>
                </div>
            </div>

            {/* Animation Controls */}
            <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Animation</h4>
                <div style={styles.row}>
                    <select
                        value={component.style?.animation?.type ?? 'none'}
                        onChange={(e) => handleAnimationChange({ type: e.target.value as AnimationOptions['type'] })}
                        style={styles.input}
                    >
                        <option value="none">None</option>
                        <option value="fade">Fade</option>
                        <option value="scale">Scale</option>
                        <option value="rotate">Rotate</option>
                        <option value="slide">Slide</option>
                    </select>
                </div>
                {component.style?.animation?.type !== 'none' && (
                    <>
                        <div style={styles.row}>
                            <select
                                value={component.style?.animation?.direction ?? 'in'}
                                onChange={(e) => handleAnimationChange({ direction: e.target.value as AnimationOptions['direction'] })}
                                style={styles.input}
                            >
                                <option value="in">In</option>
                                <option value="out">Out</option>
                            </select>
                            <select
                                value={component.style?.animation?.easing ?? 'easeInOut'}
                                onChange={(e) => handleAnimationChange({ easing: e.target.value as AnimationOptions['easing'] })}
                                style={styles.input}
                            >
                                <option value="linear">Linear</option>
                                <option value="easeIn">Ease In</option>
                                <option value="easeOut">Ease Out</option>
                                <option value="easeInOut">Ease In Out</option>
                            </select>
                        </div>
                        <div style={styles.row}>
                            <input
                                type="number"
                                value={component.style?.animation?.duration ?? 30}
                                onChange={(e) => handleAnimationChange({ duration: Number(e.target.value) })}
                                placeholder="Duration (frames)"
                                min="1"
                                style={styles.input}
                            />
                            <input
                                type="number"
                                value={component.style?.animation?.delay ?? 0}
                                onChange={(e) => handleAnimationChange({ delay: Number(e.target.value) })}
                                placeholder="Delay (frames)"
                                min="0"
                                style={styles.input}
                            />
                            <input
                                type="number"
                                value={component.style?.animation?.stagger ?? 0}
                                onChange={(e) => handleAnimationChange({ stagger: Number(e.target.value) })}
                                placeholder="Stagger (frames)"
                                min="0"
                                style={styles.input}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Chromakey Settings */}
            <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Chromakey</h4>
                <div style={styles.row}>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={component.style?.chromakey?.enabled || false}
                            onChange={(e) => handleChromakeyChange({ enabled: e.target.checked })}
                        />
                        Enable Chromakey
                    </label>
                </div>
                {component.style?.chromakey?.enabled && (
                    <>
                        <div style={styles.row}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Color to Remove:</label>
                                <input
                                    type="color"
                                    value={component.style.chromakey.color || '#00ff00'}
                                    onChange={(e) => handleChromakeyChange({ color: e.target.value })}
                                    style={styles.input}
                                />
                            </div>
                        </div>
                        <div style={styles.settingsGrid}>
                            <div>
                                <label style={styles.label}>Color Similarity:</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={component.style.chromakey.similarity || 0.4}
                                    onChange={(e) => handleChromakeyChange({ similarity: Number(e.target.value) })}
                                    style={styles.input}
                                />
                            </div>
                            <div>
                                <label style={styles.label}>Edge Smoothness:</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={component.style.chromakey.smoothness || 0.1}
                                    onChange={(e) => handleChromakeyChange({ smoothness: Number(e.target.value) })}
                                    style={styles.input}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: theme.spacing.md,
        height: '100%',
        backgroundColor: 'transparent',
    },
    section: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
    },
    sectionTitle: {
        margin: '0 0 8px 0',
        color: theme.colors.text.primary,
        fontSize: '1rem',
        fontWeight: 600,
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: 500,
        color: theme.colors.text.primary,
    },
    input: {
        padding: '0.5rem',
        borderRadius: theme.borderRadius.sm,
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background.tertiary,
        color: theme.colors.text.primary,
        width: '100%',
        minWidth: 0,
    },
    settingsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing.sm,
    },
    row: {
        display: 'flex',
        gap: theme.spacing.sm,
        alignItems: 'center',
        flexWrap: 'wrap' as const,
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        fontSize: '0.9rem',
        fontWeight: 500,
        color: theme.colors.text.primary,
    },
}; 