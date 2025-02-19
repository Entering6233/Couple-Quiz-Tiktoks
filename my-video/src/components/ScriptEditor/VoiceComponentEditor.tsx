import React, { useState, useEffect, useRef } from 'react';
import { VoiceComponent, CaptionComponent, Component, CaptionStyleOptions, VoiceStyle } from '../../types/script';
import { generateSpeech, generateCaptions } from '../../services/elevenLabs';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { CaptionPositioningScreen } from './CaptionPositioningScreen';
import { getStyledText } from '../../services/textStyle';
import { Script } from '../../types/script';

// Update the global variable to store caption style instead of voice style
let copiedVoiceStyle: CaptionStyleOptions | null = null;

interface VoiceComponentEditorProps {
    component: VoiceComponent;
    onChange: (component: VoiceComponent) => void;
    onDelete: () => void;
    script: Script;
    onScriptUpdate: (components: Component[]) => void;
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    },
    section: {
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
    },
    label: {
        color: theme.colors.text.primary,
        marginBottom: '8px',
        display: 'block',
    },
    input: {
        width: '100%',
        padding: '8px',
        backgroundColor: theme.colors.background.tertiary,
        border: `1px solid ${theme.colors.border}`,
        color: theme.colors.text.primary,
        borderRadius: '4px',
    },
    button: {
        padding: '8px 16px',
        backgroundColor: theme.colors.primary,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '10px',
        '&:disabled': {
            opacity: 0.7,
            cursor: 'not-allowed',
        },
    },
    error: {
        color: theme.colors.error,
        marginTop: '10px',
    },
    deleteButton: {
        padding: '8px 16px',
        backgroundColor: theme.colors.error,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '20px',
    },
    styleButtons: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
    },
    styleButton: {
        padding: '8px 16px',
        backgroundColor: theme.colors.background.tertiary,
        color: theme.colors.text.primary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing.md,
        width: '100%',
    },
    gridItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: theme.spacing.sm,
    },
    textStyleOptions: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        width: '50%',
        maxHeight: '80%',
        overflow: 'auto',
    },
};

const FONTS = {
    system: [
        'Arial',
        'Helvetica',
        'Times New Roman',
        'Georgia',
        'Verdana',
        'Roboto',
        'Open Sans',
        'Montserrat',
    ],
    getCustomFonts: (): string[] => {
        try {
            const savedFonts = localStorage.getItem('customFonts');
            if (savedFonts) {
                const fonts = JSON.parse(savedFonts);
                return fonts.map((font: { name: string }) => font.name);
            }
        } catch (error) {
            console.error('Error loading custom fonts:', error);
        }
        return [];
    },
};

const PREVIEW_HEIGHT = 712; // Match the height from CaptionPositioningScreen

const defaultCaptionStyle: CaptionStyleOptions = {
    fontSize: 24,
    color: '#ffffff',
    backgroundColor: 'transparent',
    position: 'bottom'
};

export const VoiceComponentEditor: React.FC<VoiceComponentEditorProps> = ({
    component,
    onChange,
    onDelete,
    script,
    onScriptUpdate
}) => {
    const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showPositioningScreen, setShowPositioningScreen] = useState(false);

    const handleGenerateVoice = async () => {
        try {
            setIsGeneratingVoice(true);
            setError(null);

            const { audioUrl } = await generateSpeech({
                text: component.text,
                voiceId: component.voiceSettings?.voiceId || 'GhJYgP4Lrji0pwS3kQwv',
                settings: {
                    stability: component.voiceSettings?.stability || 0.75,
                    similarity_boost: component.voiceSettings?.similarity_boost || 0.75
                }
            });

            onChange({
                ...component,
                audioUrl,
            });
        } catch (err) {
            console.error('Voice generation error:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate voice');
        } finally {
            setIsGeneratingVoice(false);
        }
    };

    const handleAudioLoad = () => {
        if (audioRef.current) {
            const durationInFrames = Math.ceil(audioRef.current.duration * 30);
            onChange({
                ...component,
                durationInFrames,
            });
        }
    };

    const handleCopyStyle = () => {
        // Copy the caption style settings
        copiedVoiceStyle = {
            ...(component.captionStyle || defaultCaptionStyle)
        };
        console.log('📋 Copying caption style:', {
            originalStyle: component.captionStyle,
            copiedStyle: copiedVoiceStyle
        });
    };

    const handlePasteStyle = () => {
        if (copiedVoiceStyle) {
            console.log('📝 Pasting caption style:', {
                previousStyle: component.captionStyle,
                newStyle: copiedVoiceStyle
            });
            
            // Apply the copied style to the component
            onChange({
                ...component,
                captionStyle: {
                    ...defaultCaptionStyle,
                    ...copiedVoiceStyle
                },
                showCaptions: true // Ensure captions are visible when pasting style
            });
            
            console.log('✅ Updated component with new style:', {
                updatedStyle: {
                    ...defaultCaptionStyle,
                    ...copiedVoiceStyle
                }
            });
        } else {
            console.warn('⚠️ No style has been copied yet');
        }
    };

    const handleCopyStyleToAllCaptions = () => {
        // Implementation of handleCopyStyleToAllCaptions function
    };

    const handleStyleChange = (updates: Partial<CaptionStyleOptions>) => {
        onChange({
            ...component,
            captionStyle: {
                ...defaultCaptionStyle,
                ...component.captionStyle,
                ...updates
            }
        });
    };

    const handlePositionChange = (position: { x: number; y: number }) => {
        onChange({
            ...component,
            captionStyle: {
                ...defaultCaptionStyle,
                ...component.captionStyle,
                position: position.y < PREVIEW_HEIGHT / 2 ? 'top' : 'bottom',
                customPosition: position
            }
        });
    };

    // Add the copy/paste style buttons to the Text Styling section
    const copyPasteButtons = (
        <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: theme.spacing.md,
        }}>
            <button
                onClick={handleCopyStyle}
                style={{
                    ...styles.button,
                    backgroundColor: theme.colors.background.tertiary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}
                title="Copy the current component's style settings"
            >
                📋 Copy Component Style
            </button>
            <button
                onClick={handlePasteStyle}
                style={{
                    ...styles.button,
                    backgroundColor: theme.colors.background.tertiary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: copiedVoiceStyle ? 1 : 0.5,
                    cursor: copiedVoiceStyle ? 'pointer' : 'not-allowed',
                }}
                disabled={!copiedVoiceStyle}
                title={copiedVoiceStyle ? "Paste the copied style settings" : "No style settings copied yet"}
            >
                📝 Paste Component Style
            </button>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.section}>
                <h4 style={{ marginTop: 0 }}>Voice Generation</h4>
                
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: theme.spacing.md,
                }}>
                    <button
                        onClick={handleGenerateVoice}
                        disabled={isGeneratingVoice || !component.text.trim()}
                        style={styles.button}
                    >
                        {isGeneratingVoice ? 'Generating Voice...' : 'Generate Voice'}
                    </button>
                </div>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                {component.audioUrl && (
                    <div style={{ marginTop: '20px' }}>
                        <audio
                            controls
                            src={component.audioUrl}
                            style={{ width: '100%' }}
                            ref={audioRef}
                            onLoadedMetadata={handleAudioLoad}
                        />
                    </div>
                )}
            </div>

            <div style={styles.section}>
                <h4 style={{ marginTop: 0 }}>Text Styling</h4>
                
                {copyPasteButtons}

                <div style={styles.grid}>
                    <div style={styles.gridItem}>
                        <label style={styles.label}>Show Text:</label>
                        <input
                            type="checkbox"
                            checked={component.showCaptions}
                            onChange={(e) => onChange({
                                ...component,
                                showCaptions: e.target.checked,
                            })}
                            style={{
                                ...styles.input,
                                width: 'auto',
                            }}
                        />
                    </div>

                    <div style={styles.gridItem}>
                        <label style={styles.label}>Font Size:</label>
                        <input
                            type="number"
                            value={component.captionStyle?.fontSize || 24}
                            onChange={(e) => handleStyleChange({
                                fontSize: parseInt(e.target.value),
                            })}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.gridItem}>
                        <label style={styles.label}>Font Family:</label>
                        <select
                            value={component.captionStyle?.fontFamily || 'Arial'}
                            onChange={(e) => handleStyleChange({
                                fontFamily: e.target.value,
                            })}
                            style={styles.input}
                        >
                            {FONTS.system.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                            {FONTS.getCustomFonts().map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.gridItem}>
                        <label style={styles.label}>Font Weight:</label>
                        <select
                            value={component.captionStyle?.fontWeight || 'normal'}
                            onChange={(e) => handleStyleChange({
                                fontWeight: e.target.value,
                            })}
                            style={styles.input}
                        >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="900">Extra Bold</option>
                        </select>
                    </div>

                    <div style={styles.gridItem}>
                        <label style={styles.label}>Text Color:</label>
                        <input
                            type="color"
                            value={component.captionStyle?.color || '#ffffff'}
                            onChange={(e) => handleStyleChange({
                                color: e.target.value,
                            })}
                            style={{
                                ...styles.input,
                                padding: '2px',
                                height: '36px',
                            }}
                        />
                    </div>

                    <div style={styles.gridItem}>
                        <button
                            onClick={() => setShowPositioningScreen(true)}
                            style={{
                                ...styles.button,
                                marginTop: '24px',
                            }}
                        >
                            Position Text
                        </button>
                    </div>

                    <div style={{
                        ...styles.gridItem,
                        gridColumn: '1 / -1',
                    }}>
                        <label style={styles.label}>Text Style:</label>
                        <div style={styles.textStyleOptions}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                            }}>
                                <input
                                    type="radio"
                                    name="textStyle"
                                    value="normal"
                                    checked={!component.captionStyle?.textStyle || component.captionStyle.textStyle === 'normal'}
                                    onChange={() => handleStyleChange({
                                        textStyle: 'normal',
                                        textStroke: undefined,
                                        textShadow: undefined,
                                        WebkitTextStroke: undefined
                                    })}
                                />
                                Normal Text
                            </label>

                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                            }}>
                                <input
                                    type="radio"
                                    name="textStyle"
                                    value="bordered"
                                    checked={component.captionStyle?.textStyle === 'bordered'}
                                    onChange={async () => {
                                        const styledTextConfig = await getStyledText(
                                            'Sample Text',
                                            component.captionStyle?.fontSize || 24,
                                            '#FFFFFF',
                                            '#000000'
                                        );

                                        handleStyleChange({
                                            textStyle: 'bordered',
                                            color: '#FFFFFF',
                                            backgroundColor: 'transparent',
                                            textStroke: '4px #000000',
                                            textShadow: styledTextConfig.textShadow,
                                            fontWeight: '900',
                                            WebkitTextStroke: styledTextConfig.WebkitTextStroke
                                        });
                                    }}
                                />
                                White Text with Black Border
                            </label>
                        </div>
                    </div>

                    {component.captionStyle?.textStyle === 'bordered' && (
                        <div style={{
                            ...styles.gridItem,
                            gridColumn: '1 / -1',
                        }}>
                            <label style={styles.label}>Border Width:</label>
                            <input
                                type="number"
                                value={parseInt(component.captionStyle?.textStroke?.split('px')[0] || '4')}
                                onChange={async (e) => {
                                    const width = e.target.value + 'px';
                                    const styledTextConfig = await getStyledText(
                                        'Sample Text',
                                        component.captionStyle?.fontSize || 24,
                                        component.captionStyle?.color || '#FFFFFF',
                                        '#000000',
                                        parseInt(e.target.value)
                                    );

                                    handleStyleChange({
                                        textStroke: `${width} #000000`,
                                        textShadow: styledTextConfig.textShadow,
                                        WebkitTextStroke: styledTextConfig.WebkitTextStroke
                                    });
                                }}
                                style={{
                                    ...styles.input,
                                    maxWidth: '200px',
                                }}
                                min="1"
                                max="10"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Positioning Screen Modal */}
            {showPositioningScreen && (
                <div style={{
                    position: 'fixed' as const,
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: theme.colors.background.secondary,
                        padding: theme.spacing.lg,
                        borderRadius: theme.borderRadius.md,
                        maxWidth: '90%',
                        maxHeight: '90%',
                        overflow: 'auto',
                        position: 'relative' as const,
                    }}>
                        <CaptionPositioningScreen
                            style={component.captionStyle || defaultCaptionStyle}
                            onPositionChange={handlePositionChange}
                            onClose={() => setShowPositioningScreen(false)}
                        />
                        <button
                            onClick={() => setShowPositioningScreen(false)}
                            style={{
                                ...styles.button,
                                marginTop: theme.spacing.md,
                            }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            <div style={styles.section}>
                <button
                    onClick={handleCopyStyleToAllCaptions}
                    style={{
                        padding: theme.spacing.sm,
                        backgroundColor: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: theme.borderRadius.sm,
                        cursor: 'pointer',
                        marginBottom: theme.spacing.md,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: theme.spacing.sm,
                        width: '100%',
                    }}
                >
                    <span>Copy Caption Style to All Voice Components</span>
                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>
                        (Font, Size, Color, etc.)
                    </span>
                </button>

                <button
                    onClick={onDelete}
                    style={styles.deleteButton}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}; 