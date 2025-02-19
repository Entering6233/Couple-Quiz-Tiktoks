import React from 'react';
import { ComparisonComponent, AnimationOptions } from '../../types/script';
import { ImageSelector } from '../ImageSelector';
import { theme } from '../../styles/theme';

interface ComparisonComponentEditorProps {
    component: ComparisonComponent;
    onChange: (updated: ComparisonComponent) => void;
}

export const ComparisonComponentEditor: React.FC<ComparisonComponentEditorProps> = ({
    component,
    onChange,
}) => {
    const handleStyleChange = (updated: Partial<ComparisonComponent['style']>) => {
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

    const handleBorderChange = (updates: Partial<NonNullable<ComparisonComponent['style']>['imageBorder']>) => {
        const currentBorder = component.style?.imageBorder || { enabled: false, color: '#000000', width: 1 };
        handleStyleChange({
            imageBorder: {
                ...currentBorder,
                ...updates,
            }
        });
    };

    const handleShadowChange = (updates: Partial<NonNullable<ComparisonComponent['style']>['imageDropShadow']>) => {
        const currentShadow = component.style?.imageDropShadow || { enabled: false, color: '#000000', blur: 10, spread: 0, x: 0, y: 4 };
        handleStyleChange({
            imageDropShadow: {
                ...currentShadow,
                ...updates,
            }
        });
    };

    const handlePositionChange = (updates: Partial<{ x: number; y: number }>) => {
        const currentPosition = component.style?.imagePosition || { x: 0, y: 0 };
        handleStyleChange({
            imagePosition: {
                ...currentPosition,
                ...updates
            }
        });
    };

    return (
        <div style={styles.container}>
            {/* Question */}
            <div style={styles.section}>
                <label style={styles.label}>
                    Question:
                </label>
                <input
                    type="text"
                    value={component.question}
                    onChange={(e) => {
                        onChange({
                            ...component,
                            question: e.target.value || '',
                        });
                    }}
                    style={styles.input}
                    placeholder="Enter your question..."
                />
            </div>

            {/* Settings */}
            <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Settings</h4>
                <div style={styles.settingsGrid}>
                    <div>
                        <label style={styles.label}>Orientation:</label>
                        <select
                            value={component.orientation || 'horizontal'}
                            onChange={(e) => {
                                onChange({
                                    ...component,
                                    orientation: e.target.value as 'horizontal' | 'vertical'
                                });
                            }}
                            style={styles.input}
                        >
                            <option value="horizontal">Side by Side</option>
                            <option value="vertical">Top and Bottom</option>
                        </select>
                    </div>

                    <div>
                        <label style={styles.label}>Duration (frames):</label>
                        <input
                            type="number"
                            min="1"
                            value={component.durationInFrames || 150}
                            onChange={(e) => {
                                onChange({
                                    ...component,
                                    durationInFrames: parseInt(e.target.value)
                                });
                            }}
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={{ marginTop: theme.spacing.md }}>
                    <label style={{
                        ...styles.label,
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                    }}>
                        <input
                            type="checkbox"
                            checked={component.style?.showText !== false}
                            onChange={(e) => {
                                onChange({
                                    ...component,
                                    style: {
                                        ...component.style,
                                        showText: e.target.checked
                                    }
                                });
                            }}
                        />
                        Show Text Labels
                    </label>
                </div>

                {component.style?.showText !== false && (
                    <div style={{ marginTop: theme.spacing.md }}>
                        <div style={styles.settingsGrid}>
                            <div>
                                <label style={styles.label}>Font Size:</label>
                                <input
                                    type="number"
                                    value={component.style?.fontSize || 32}
                                    onChange={(e) => {
                                        onChange({
                                            ...component,
                                            style: {
                                                ...component.style,
                                                fontSize: parseInt(e.target.value)
                                            }
                                        });
                                    }}
                                    style={styles.input}
                                />
                            </div>

                            <div>
                                <label style={styles.label}>Text Color:</label>
                                <input
                                    type="color"
                                    value={component.style?.textColor || '#ffffff'}
                                    onChange={(e) => {
                                        onChange({
                                            ...component,
                                            style: {
                                                ...component.style,
                                                textColor: e.target.value
                                            }
                                        });
                                    }}
                                    style={styles.input}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Style Settings */}
            <div style={{ marginTop: theme.spacing.md }}>
                <h4 style={styles.sectionTitle}>Image Styles</h4>
                
                {/* Border Settings */}
                <div style={{ marginBottom: theme.spacing.md }}>
                    <div style={styles.row}>
                        <input
                            type="checkbox"
                            checked={component.style?.imageBorder?.enabled ?? false}
                            onChange={(e) => handleBorderChange({ enabled: e.target.checked })}
                            style={styles.checkbox}
                        />
                        <label style={styles.label}>Enable Border</label>
                    </div>
                    {component.style?.imageBorder?.enabled && (
                        <div style={styles.row}>
                            <input
                                type="color"
                                value={component.style.imageBorder.color ?? '#000000'}
                                onChange={(e) => handleBorderChange({ color: e.target.value })}
                                style={styles.input}
                            />
                            <input
                                type="number"
                                value={component.style.imageBorder.width ?? 1}
                                onChange={(e) => handleBorderChange({ width: Number(e.target.value) })}
                                placeholder="Width"
                                min="1"
                                max="20"
                                style={styles.input}
                            />
                        </div>
                    )}
                </div>

                {/* Drop Shadow Settings */}
                <div style={{ marginBottom: theme.spacing.md }}>
                    <div style={styles.row}>
                        <input
                            type="checkbox"
                            checked={component.style?.imageDropShadow?.enabled ?? false}
                            onChange={(e) => handleShadowChange({ enabled: e.target.checked })}
                            style={styles.checkbox}
                        />
                        <label style={styles.label}>Enable Drop Shadow</label>
                    </div>
                    {component.style?.imageDropShadow?.enabled && (
                        <>
                            <div style={styles.row}>
                                <input
                                    type="color"
                                    value={component.style.imageDropShadow.color ?? '#000000'}
                                    onChange={(e) => handleShadowChange({ color: e.target.value })}
                                    style={styles.input}
                                />
                                <input
                                    type="number"
                                    value={component.style.imageDropShadow.blur ?? 10}
                                    onChange={(e) => handleShadowChange({ blur: Number(e.target.value) })}
                                    placeholder="Blur"
                                    min="0"
                                    max="50"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.row}>
                                <input
                                    type="number"
                                    value={component.style.imageDropShadow.x ?? 0}
                                    onChange={(e) => handleShadowChange({ x: Number(e.target.value) })}
                                    placeholder="X Offset"
                                    style={styles.input}
                                />
                                <input
                                    type="number"
                                    value={component.style.imageDropShadow.y ?? 0}
                                    onChange={(e) => handleShadowChange({ y: Number(e.target.value) })}
                                    placeholder="Y Offset"
                                    style={styles.input}
                                />
                                <input
                                    type="number"
                                    value={component.style.imageDropShadow.spread ?? 0}
                                    onChange={(e) => handleShadowChange({ spread: Number(e.target.value) })}
                                    placeholder="Spread"
                                    style={styles.input}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Layout Settings */}
                <div style={{ marginBottom: theme.spacing.md }}>
                    <h4 style={styles.sectionTitle}>Layout</h4>
                    <div style={styles.settingsGrid}>
                        <div>
                            <label style={styles.label}>Image Size (%):</label>
                            <input
                                type="number"
                                min="10"
                                max="500"
                                value={component.style?.imageSize || 100}
                                onChange={(e) => {
                                    const size = Math.max(10, Math.min(500, parseInt(e.target.value) || 100));
                                    handleStyleChange({
                                        imageSize: size
                                    });
                                }}
                                style={styles.input}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>Gap Between Images (px):</label>
                            <input
                                type="number"
                                min="0"
                                max="200"
                                value={component.style?.imageGap || 20}
                                onChange={(e) => {
                                    const gap = Math.max(0, Math.min(200, parseInt(e.target.value) || 20));
                                    handleStyleChange({
                                        imageGap: gap
                                    });
                                }}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <input
                            type="checkbox"
                            checked={component.style?.forceSameSize ?? true}
                            onChange={(e) => handleStyleChange({ forceSameSize: e.target.checked })}
                            style={styles.checkbox}
                        />
                        <label style={styles.label}>Force Images to Same Size</label>
                    </div>

                    <div style={styles.settingsGrid}>
                        <div>
                            <label style={styles.label}>Horizontal Position (%):</label>
                            <input
                                type="range"
                                min="-100"
                                max="100"
                                value={component.style?.imagePosition?.x || 0}
                                onChange={(e) => {
                                    handlePositionChange({ x: parseInt(e.target.value) });
                                }}
                                style={styles.input}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>Vertical Position (%):</label>
                            <input
                                type="range"
                                min="-100"
                                max="100"
                                value={component.style?.imagePosition?.y || 0}
                                onChange={(e) => {
                                    handlePositionChange({ y: parseInt(e.target.value) });
                                }}
                                style={styles.input}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Animation Controls */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Animation Settings</h3>
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

            {/* Options */}
            <div style={{
                ...styles.optionsGrid,
                gridTemplateColumns: component.orientation === 'horizontal' ? '1fr 1fr' : '1fr',
            }}>
                {/* First Option */}
                <div style={styles.optionSection}>
                    <h4 style={styles.sectionTitle}>
                        {component.orientation === 'horizontal' ? 'Left Option' : 'Top Option'}
                    </h4>
                    <input
                        type="text"
                        value={component.leftOption.text}
                        onChange={(e) => {
                            onChange({
                                ...component,
                                leftOption: {
                                    ...component.leftOption,
                                    text: e.target.value || '',
                                }
                            });
                        }}
                        style={styles.input}
                        placeholder="Enter text..."
                    />
                    <ImageSelector
                        onSelect={(url) => {
                            onChange({
                                ...component,
                                leftOption: {
                                    ...component.leftOption,
                                    imageUrl: url,
                                }
                            });
                        }}
                        searchTerm={component.leftOption.text || 'image'}
                    />
                </div>

                {/* Second Option */}
                <div style={styles.optionSection}>
                    <h4 style={styles.sectionTitle}>
                        {component.orientation === 'horizontal' ? 'Right Option' : 'Bottom Option'}
                    </h4>
                    <input
                        type="text"
                        value={component.rightOption.text}
                        onChange={(e) => {
                            onChange({
                                ...component,
                                rightOption: {
                                    ...component.rightOption,
                                    text: e.target.value || '',
                                }
                            });
                        }}
                        style={styles.input}
                        placeholder="Enter text..."
                    />
                    <ImageSelector
                        onSelect={(url) => {
                            onChange({
                                ...component,
                                rightOption: {
                                    ...component.rightOption,
                                    imageUrl: url,
                                }
                            });
                        }}
                        searchTerm={component.rightOption.text || 'image'}
                    />
                </div>
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
    optionsGrid: {
        display: 'grid',
        gap: theme.spacing.md,
    },
    optionSection: {
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
    },
    row: {
        display: 'flex',
        gap: theme.spacing.sm,
        alignItems: 'center',
        flexWrap: 'wrap' as const,
    },
    preview: {
        width: '100%',
        maxHeight: '200px',
        objectFit: 'contain' as const,
        backgroundColor: theme.colors.background.tertiary,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
    },
    checkbox: {
        margin: 0,
    },
}; 