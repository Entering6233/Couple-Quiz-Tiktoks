import React, { useState, useEffect } from 'react';
import { TextComponent } from '../../types/script';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { PositioningScreen } from './PositioningScreen';
import { TextStyle, AnimationOptions } from '../../types/script';

interface TextComponentEditorProps {
    component: TextComponent;
    onChange: (updated: TextComponent) => void;
}

// Predefined fonts list
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

// Add styled text cache
const styledTextCache = new Map<string, string>();

const getStyledText = async (text: string, fontSize: number, color: string = 'white', strokeColor: string = 'black') => {
    const cacheKey = `${text}-${fontSize}-${color}-${strokeColor}`;
    if (styledTextCache.has(cacheKey)) {
        return styledTextCache.get(cacheKey);
    }

    try {
        const response = await fetch('http://localhost:8756/style-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                fontSize,
                fillColor: color,
                strokeColor,
            }),
        });

        const data = await response.json();
        if (data.success) {
            styledTextCache.set(cacheKey, data.image);
            return data.image;
        }
        throw new Error(data.error || 'Failed to style text');
    } catch (error) {
        console.error('Error styling text:', error);
        return null;
    }
};

const styles = {
    section: {
        backgroundColor: theme.colors.background.tertiary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        margin: 0,
        marginBottom: theme.spacing.sm,
    },
    input: {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '8px',
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background.tertiary,
        color: theme.colors.text.primary,
        fontSize: '14px',
        '&:focus': {
            outline: 'none',
            borderColor: theme.colors.primary,
        },
    },
    textarea: {
        ...commonStyles.input,
        minHeight: '120px',
        resize: 'vertical' as const,
        whiteSpace: 'pre-wrap',
        lineHeight: '1.5',
        padding: '12px 16px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
    },
    previewArea: {
        width: '1920px',
        height: '1080px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        position: 'relative' as const,
        transform: 'scale(0.25)',
        transformOrigin: 'top left',
        cursor: 'pointer',
    },
    animationTimingGrid: {
        marginTop: '12px',
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: '1fr 1fr',
    },
    animationInput: {
        width: '100%',
        padding: '8px 12px',
        borderRadius: '6px',
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background.tertiary,
        color: theme.colors.text.primary,
        fontSize: '14px',
        fontFamily: 'monospace',
    },
    animationLabel: {
        fontWeight: 'bold',
        marginBottom: '6px',
        color: theme.colors.text.primary,
        fontSize: '12px',
    },
};

const ANIMATION_TYPES = [
    { value: 'none', label: 'None' },
    { value: 'slide-left', label: 'Slide Left' },
    { value: 'slide-right', label: 'Slide Right' },
    { value: 'fade', label: 'Fade' },
    { value: 'fadeScale', label: 'Fade & Scale' },
    { value: 'fadeSlide', label: 'Fade & Slide' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'flip', label: 'Flip' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'rotate', label: 'Rotate' },
    { value: 'slideRotate', label: 'Slide & Rotate' },
    { value: 'elastic', label: 'Elastic' }
];

const ANIMATION_FEELS = [
    { value: 'bouncy', label: 'Bouncy' },
    { value: 'smooth', label: 'Smooth' },
    { value: 'snappy', label: 'Snappy' },
    { value: 'gentle', label: 'Gentle' }
];

const SLIDE_DIRECTIONS = [
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'up', label: 'Up' },
    { value: 'down', label: 'Down' }
];

const updateAnimation = (component: TextComponent, style: TextStyle, newAnimation: AnimationOptions) => {
    return {
        ...component,
        style: {
            ...style,
            animation: {
                ...style.animation,
                ...newAnimation,
            },
        },
    };
};

export const TextComponentEditor: React.FC<TextComponentEditorProps> = ({
    component,
    onChange,
}) => {
    const style = component.style || {};
    const [customFonts, setCustomFonts] = useState<string[]>([]);
    const [isPositioningPopupOpen, setIsPositioningPopupOpen] = useState(false);
    const [styledTextPreview, setStyledTextPreview] = useState<string | null>(null);

    useEffect(() => {
        const updateCustomFonts = () => {
            setCustomFonts(FONTS.getCustomFonts());
        };

        updateCustomFonts();
        window.addEventListener('storage', updateCustomFonts);
        return () => window.removeEventListener('storage', updateCustomFonts);
    }, []);

    // Update styled text preview when text or style changes
    useEffect(() => {
        if (style.textStyle === 'bordered' && component.text) {
            getStyledText(
                component.text,
                style.fontSize || 80,
                style.color || 'white',
                '#000000'
            ).then(setStyledTextPreview);
        } else {
            setStyledTextPreview(null);
        }
    }, [component.text, style.textStyle, style.fontSize, style.color]);

    const handleTextChange = (text: string) => {
        if (text && style.wordsPerLine && style.wordsPerLine > 0) {
            const cleanText = text.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
            const words = cleanText.split(' ');
            const lines = [];
            
            for (let i = 0; i < words.length; i += style.wordsPerLine) {
                const line = words.slice(i, i + style.wordsPerLine).join(' ');
                if (line) lines.push(line);
            }
            
            text = lines.join('\n');
        }

        onChange({
            ...component,
            text,
        });
    };

    const handlePositionChange = (position: { x: number; y: number }) => {
        onChange({
            ...component,
            style: {
                ...style,
                position,
            },
        });
    };

    return (
        <>
            {/* Basic Settings */}
            <div style={styles.grid}>
                <div>
                    <label style={styles.sectionTitle}>Duration (seconds)</label>
                    <input
                        type="number"
                        value={component.durationInFrames / 30}
                        onChange={(e) => onChange({
                            ...component,
                            durationInFrames: Math.max(1, parseFloat(e.target.value)) * 30,
                        })}
                        style={styles.input}
                        min="0.1"
                        step="0.1"
                    />
                </div>
                <div>
                    <label style={styles.sectionTitle}>Style</label>
                    <select
                        value={style.textStyle || (style.blockStyle?.enabled ? 
                            (style.backgroundColor === '#FFFFFF' ? 'white-block' : 'black-block') 
                            : 'normal')}
                        onChange={(e) => {
                            console.log('%c🎨 Setting Style', 'color: #00ff00; font-weight: bold; font-size: 14px');
                            
                            let newStyle;
                            switch (e.target.value) {
                                case 'white-block':
                                    newStyle = {
                                        ...style,
                                        textStyle: undefined,
                                        blockStyle: { enabled: true },
                                        backgroundColor: '#FFFFFF',
                                        color: '#000000',
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold',
                                        padding: '20px 40px',
                                        borderRadius: '15px',
                                        textAlign: 'center',
                                        textStroke: undefined,
                                        textShadow: undefined
                                    };
                                    break;
                                case 'black-block':
                                    newStyle = {
                                        ...style,
                                        textStyle: undefined,
                                        blockStyle: { enabled: true },
                                        backgroundColor: '#000000',
                                        color: '#FFFFFF',
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold',
                                        padding: '20px 40px',
                                        borderRadius: '15px',
                                        textAlign: 'center',
                                        textStroke: undefined,
                                        textShadow: undefined
                                    };
                                    break;
                                case 'bordered':
                                    const baseFontSize = style.fontSize || 80;
                                    // Match the Python implementation's stroke width
                                    const baseStrokeWidth = Math.max(4, Math.round(baseFontSize * 0.05)); // 5% of font size, minimum 4px
                                    
                                    // Create multiple text-shadows to simulate the PIL drawing approach
                                    const shadowOffsets = [];
                                    for (let dx = -baseStrokeWidth; dx <= baseStrokeWidth; dx++) {
                                        for (let dy = -baseStrokeWidth; dy <= baseStrokeWidth; dy++) {
                                            if (Math.abs(dx) + Math.abs(dy) <= baseStrokeWidth) {
                                                shadowOffsets.push(`${dx}px ${dy}px 0 #000000`);
                                            }
                                        }
                                    }

                                    newStyle = {
                                        ...style,
                                        textStyle: 'bordered' as const,
                                        blockStyle: { enabled: false },
                                        color: '#FFFFFF',
                                        backgroundColor: 'transparent',
                                        strokeWidth: baseStrokeWidth,
                                        // Use text-shadow for the border effect
                                        textShadow: shadowOffsets.join(', '),
                                        fontFamily: 'tiktok',
                                        fontWeight: '900',
                                        fontSize: baseFontSize,
                                        letterSpacing: `${Math.round(baseFontSize * 0.05)}px`,
                                        padding: undefined,
                                        borderRadius: undefined,
                                        textTransform: undefined,
                                        textAlign: 'center' as const
                                    };
                                    break;
                                default: // normal
                                    newStyle = {
                                        ...style,
                                        textStyle: 'normal' as const,
                                        blockStyle: { enabled: false },
                                        color: '#FFFFFF',
                                        backgroundColor: 'transparent',
                                        textStroke: undefined,
                                        textShadow: undefined,
                                        fontWeight: 'normal',
                                        padding: undefined,
                                        borderRadius: undefined,
                                        textTransform: undefined
                                    };
                            }

                            console.log('%c🎨 New Style:', 'color: #00ffff', newStyle);
                            onChange({
                                ...component,
                                style: newStyle
                            });
                        }}
                        style={styles.input}
                    >
                        <option value="normal">Normal Text</option>
                        <option value="bordered">White Text with Black Border</option>
                        <option value="white-block">White Block with Black Text</option>
                        <option value="black-block">Black Block with White Text</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div style={{ marginTop: theme.spacing.lg }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: theme.spacing.sm,
                }}>
                    <h3 style={styles.sectionTitle}>Content</h3>
                    <button style={{
                        backgroundColor: 'rgb(255, 75, 75)',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                    }}>Delete</button>
                </div>
                <textarea
                    value={component.text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    style={styles.textarea}
                    placeholder="Enter your text..."
                />
                {/* Add preview for bordered style */}
                {style.textStyle === 'bordered' && styledTextPreview && (
                    <div style={{
                        marginTop: theme.spacing.md,
                        padding: theme.spacing.md,
                        backgroundColor: '#1a1a1a',
                        borderRadius: theme.borderRadius.md,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <img 
                            src={styledTextPreview} 
                            alt="Text Preview"
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Font Settings */}
            <div style={{ marginTop: theme.spacing.lg }}>
                <h3 style={styles.sectionTitle}>Font Settings</h3>
                <div style={styles.grid}>
                    <div>
                        <label style={styles.sectionTitle}>Font Family</label>
                        <select
                            value={style.fontFamily}
                            onChange={(e) => {
                                const newStyle = {
                                    ...style,
                                    fontFamily: e.target.value,
                                };
                                
                                // Update stroke width if using bordered style
                                if (style.textStyle === 'bordered') {
                                    const fontSize = style.fontSize || 80;
                                    const strokeWidth = Math.max(4, Math.round(fontSize * 0.05));
                                    
                                    // Create multiple text-shadows
                                    const shadowOffsets = [];
                                    for (let dx = -strokeWidth; dx <= strokeWidth; dx++) {
                                        for (let dy = -strokeWidth; dy <= strokeWidth; dy++) {
                                            if (Math.abs(dx) + Math.abs(dy) <= strokeWidth) {
                                                shadowOffsets.push(`${dx}px ${dy}px 0 ${style.textStroke?.split(' ')[1] || '#000000'}`);
                                            }
                                        }
                                    }

                                    newStyle.strokeWidth = strokeWidth;
                                    newStyle.textShadow = shadowOffsets.join(', ');
                                    newStyle.letterSpacing = `${Math.round(fontSize * 0.05)}px`;
                                }

                                onChange({
                                    ...component,
                                    style: newStyle,
                                });
                            }}
                            style={styles.input}
                        >
                            <optgroup label="System Fonts">
                                {FONTS.system.map(font => (
                                    <option key={font} value={font}>{font}</option>
                                ))}
                            </optgroup>
                            {customFonts.length > 0 && (
                                <optgroup label="Custom Fonts">
                                    {customFonts.map(font => (
                                        <option key={font} value={font}>{font}</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>
                    <div>
                        <label style={styles.sectionTitle}>Font Size (px)</label>
                        <input
                            type="number"
                            value={style.fontSize}
                            onChange={(e) => {
                                const fontSize = parseInt(e.target.value);
                                const newStyle = {
                                    ...style,
                                    fontSize,
                                };

                                // Update the component with new style
                                onChange({
                                    ...component,
                                    style: newStyle,
                                });
                            }}
                            style={styles.input}
                            min="12"
                            max="200"
                            step="1"
                        />
                    </div>
                    <div>
                        <label style={styles.sectionTitle}>Font Weight</label>
                        <select
                            value={style.fontWeight}
                            onChange={(e) => onChange({
                                ...component,
                                style: {
                                    ...style,
                                    fontWeight: e.target.value,
                                },
                            })}
                            style={styles.input}
                        >
                            <option value="300">Light</option>
                            <option value="400">Regular</option>
                            <option value="500">Medium</option>
                            <option value="600">Semi Bold</option>
                            <option value="700">Bold</option>
                            <option value="800">Extra Bold</option>
                        </select>
                    </div>
                    <div>
                        <label style={styles.sectionTitle}>Line Height</label>
                        <select
                            value={style.lineHeight || '1.5'}
                            onChange={(e) => onChange({
                                ...component,
                                style: {
                                    ...style,
                                    lineHeight: e.target.value,
                                },
                            })}
                            style={styles.input}
                        >
                            <option value="1">Tight</option>
                            <option value="1.2">Compact</option>
                            <option value="1.5">Normal</option>
                            <option value="1.8">Relaxed</option>
                            <option value="2">Spacious</option>
                        </select>
                    </div>
                    <div>
                        <label style={styles.sectionTitle}>Letter Spacing (px)</label>
                        <input
                            type="number"
                            value={parseInt(style.letterSpacing || '0')}
                            onChange={(e) => onChange({
                                ...component,
                                style: {
                                    ...style,
                                    letterSpacing: `${e.target.value}px`,
                                },
                            })}
                            style={styles.input}
                            min="0"
                            max="20"
                            step="1"
                        />
                    </div>
                </div>
            </div>

            {/* Style Settings */}
            <div style={{ marginTop: theme.spacing.lg }}>
                <h3 style={styles.sectionTitle}>Style Settings</h3>
                <div style={styles.grid}>
                    <div>
                        <label style={styles.sectionTitle}>Text Color</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="color"
                                value={style.color || '#FFFFFF'}
                                onChange={(e) => onChange({
                                    ...component,
                                    style: {
                                        ...style,
                                        color: e.target.value,
                                    },
                                })}
                                style={{ ...styles.input, width: '50px', padding: '2px' }}
                            />
                            <input
                                type="text"
                                value={style.color || '#FFFFFF'}
                                onChange={(e) => onChange({
                                    ...component,
                                    style: {
                                        ...style,
                                        color: e.target.value,
                                    },
                                })}
                                style={{ ...styles.input, flex: 1 }}
                                placeholder="#FFFFFF"
                            />
                        </div>
                    </div>
                    <div>
                        <label style={styles.sectionTitle}>Text Alignment</label>
                        <select
                            value={style.textAlign || 'center'}
                            onChange={(e) => onChange({
                                ...component,
                                style: {
                                    ...style,
                                    textAlign: e.target.value as 'left' | 'center' | 'right' | 'justify',
                                },
                            })}
                            style={styles.input}
                        >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justify">Justify</option>
                        </select>
                    </div>
                    {style.textStyle === 'bordered' && (
                        <>
                            <div>
                                <label style={styles.sectionTitle}>Border Width</label>
                                <input
                                    type="number"
                                    value={parseInt(style.textStroke?.split('px')[0] || '4')}
                                    onChange={(e) => {
                                        const width = parseInt(e.target.value);
                                        console.log('%c📏 Setting Border Width', 'color: #00ff00; font-weight: bold; font-size: 14px');
                                        
                                        const newStyle = {
                                            ...style,
                                            textStroke: `${width}px #000000`,
                                            WebkitTextStroke: `${width}px #000000`,
                                            textShadow: `-${width}px -${width}px 0 #000000, ${width}px -${width}px 0 #000000, -${width}px ${width}px 0 #000000, ${width}px ${width}px 0 #000000`
                                        };
                                        
                                        console.log('%c🎨 Final Style:', 'color: #00ffff', newStyle);
                                        onChange({
                                            ...component,
                                            style: newStyle
                                        });
                                    }}
                                    style={styles.input}
                                    min="1"
                                    max="10"
                                />
                            </div>
                            <div>
                                <label style={styles.sectionTitle}>Border Color</label>
                                <input
                                    type="color"
                                    value={style.textStroke?.split(' ')[1] || '#000000'}
                                    onChange={(e) => {
                                        const color = e.target.value;
                                        const width = parseInt(style.textStroke?.split('px')[0] || '4');
                                        
                                        console.log('%c🎨 Setting Border Color', 'color: #00ff00; font-weight: bold; font-size: 14px');
                                        
                                        const newStyle = {
                                            ...style,
                                            textStroke: `${width}px ${color}`,
                                            WebkitTextStroke: `${width}px ${color}`,
                                            textShadow: `-${width}px -${width}px 0 ${color}, ${width}px -${width}px 0 ${color}, -${width}px ${width}px 0 ${color}, ${width}px ${width}px 0 ${color}`
                                        };
                                        
                                        console.log('%c🎨 Final Style:', 'color: #00ffff', newStyle);
                                        onChange({
                                            ...component,
                                            style: newStyle
                                        });
                                    }}
                                    style={styles.input}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Stroke Width Control - Only show for bordered style */}
            {style.textStyle === 'bordered' && (
                <div style={{ marginTop: theme.spacing.md }}>
                    <label style={styles.sectionTitle}>Border Thickness</label>
                    <input
                        type="number"
                        value={style.strokeWidth || 4}
                        onChange={(e) => {
                            const strokeWidth = Math.max(1, Math.min(20, parseInt(e.target.value)));
                            const newStyle = {
                                ...style,
                                strokeWidth,
                                textStroke: `${strokeWidth}px #000000`,
                                WebkitTextStroke: `${strokeWidth}px #000000`,
                                textShadow: `-${strokeWidth}px -${strokeWidth}px 0 #000000, ${strokeWidth}px -${strokeWidth}px 0 #000000, -${strokeWidth}px ${strokeWidth}px 0 #000000, ${strokeWidth}px ${strokeWidth}px 0 #000000`,
                            };
                            onChange({
                                ...component,
                                style: newStyle
                            });
                        }}
                        style={styles.input}
                        min="1"
                        max="20"
                        step="1"
                    />
                </div>
            )}

            {/* Animation Settings */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Animation</h3>
                
                {/* Entrance Animation */}
                <div style={{ marginBottom: theme.spacing.md }}>
                    <h4 style={styles.sectionTitle}>Entrance Animation</h4>
                    <div style={styles.grid}>
                        <div>
                            <label style={styles.animationLabel}>Type</label>
                            <select
                                value={style.animation?.entrance?.type || 'none'}
                                onChange={(e) => {
                                    const type = e.target.value;
                                    onChange(updateAnimation(component, style, {
                                        entrance: {
                                            ...style.animation?.entrance,
                                            type,
                                        },
                                    }));
                                }}
                                style={styles.animationInput}
                            >
                                {ANIMATION_TYPES.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {style.animation?.entrance?.type !== 'none' && (
                            <>
                                <div>
                                    <label style={styles.animationLabel}>Feel</label>
                                    <select
                                        value={style.animation?.entrance?.feel || 'smooth'}
                                        onChange={(e) => {
                                            onChange(updateAnimation(component, style, {
                                                entrance: {
                                                    ...style.animation?.entrance,
                                                    feel: e.target.value,
                                                },
                                            }));
                                        }}
                                        style={styles.animationInput}
                                    >
                                        {ANIMATION_FEELS.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={styles.animationLabel}>Duration (frames)</label>
                                    <input
                                        type="number"
                                        value={style.animation?.entrance?.duration || 30}
                                        onChange={(e) => {
                                            onChange(updateAnimation(component, style, {
                                                entrance: {
                                                    ...style.animation?.entrance,
                                                    duration: Math.max(1, parseInt(e.target.value)),
                                                },
                                            }));
                                        }}
                                        style={styles.animationInput}
                                        min="1"
                                        step="1"
                                    />
                                </div>

                                <div>
                                    <label style={styles.animationLabel}>Delay (frames)</label>
                                    <input
                                        type="number"
                                        value={style.animation?.entrance?.delay || 0}
                                        onChange={(e) => {
                                            onChange(updateAnimation(component, style, {
                                                entrance: {
                                                    ...style.animation?.entrance,
                                                    delay: Math.max(0, parseInt(e.target.value)),
                                                },
                                            }));
                                        }}
                                        style={styles.animationInput}
                                        min="0"
                                        step="1"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Exit Animation */}
                <div style={{ marginTop: theme.spacing.md }}>
                    <h4 style={styles.sectionTitle}>Exit Animation</h4>
                    <div style={styles.grid}>
                        <div>
                            <label style={styles.animationLabel}>Type</label>
                            <select
                                value={style.animation?.exit?.type || 'none'}
                                onChange={(e) => {
                                    const type = e.target.value;
                                    onChange(updateAnimation(component, style, {
                                        exit: {
                                            ...style.animation?.exit,
                                            type,
                                        },
                                    }));
                                }}
                                style={styles.animationInput}
                            >
                                {ANIMATION_TYPES.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {style.animation?.exit?.type !== 'none' && (
                            <>
                                <div>
                                    <label style={styles.animationLabel}>Feel</label>
                                    <select
                                        value={style.animation?.exit?.feel || 'smooth'}
                                        onChange={(e) => {
                                            onChange(updateAnimation(component, style, {
                                                exit: {
                                                    ...style.animation?.exit,
                                                    feel: e.target.value,
                                                },
                                            }));
                                        }}
                                        style={styles.animationInput}
                                    >
                                        {ANIMATION_FEELS.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={styles.animationLabel}>Duration (frames)</label>
                                    <input
                                        type="number"
                                        value={style.animation?.exit?.duration || 30}
                                        onChange={(e) => {
                                            onChange(updateAnimation(component, style, {
                                                exit: {
                                                    ...style.animation?.exit,
                                                    duration: Math.max(1, parseInt(e.target.value)),
                                                },
                                            }));
                                        }}
                                        style={styles.animationInput}
                                        min="1"
                                        step="1"
                                    />
                                </div>

                                <div>
                                    <label style={styles.animationLabel}>Delay (frames)</label>
                                    <input
                                        type="number"
                                        value={style.animation?.exit?.delay || 0}
                                        onChange={(e) => {
                                            onChange(updateAnimation(component, style, {
                                                exit: {
                                                    ...style.animation?.exit,
                                                    delay: Math.max(0, parseInt(e.target.value)),
                                                },
                                            }));
                                        }}
                                        style={styles.animationInput}
                                        min="0"
                                        step="1"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Position */}
            <div style={{ marginTop: theme.spacing.lg }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: theme.spacing.sm,
                }}>
                    <h3 style={styles.sectionTitle}>Position</h3>
                    <button
                        onClick={() => setIsPositioningPopupOpen(true)}
                        style={{
                            backgroundColor: theme.colors.primary,
                            color: theme.colors.text.primary,
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                        }}
                    >
                        Open Large Preview
                    </button>
                </div>
                <div style={{
                    width: '200px',
                    height: '356px',
                    backgroundColor: '#1a1a1a',
                    position: 'relative',
                    borderRadius: theme.borderRadius.sm,
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left) * 5.4;
                    const y = (e.clientY - rect.top) * 5.4;
                    handlePositionChange({ x, y });
                }}>
                    {/* Grid lines */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(to right, #333 1px, transparent 1px),
                            linear-gradient(to bottom, #333 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px',
                        opacity: 0.5,
                        pointerEvents: 'none',
                    }} />

                    {/* Center dot */}
                    <div style={{
                        position: 'absolute',
                        left: (style.position?.x || 0) / 5.4,
                        top: (style.position?.y || 0) / 5.4,
                        width: 6,
                        height: 6,
                        backgroundColor: theme.colors.primary,
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
                    }} />
                </div>
            </div>

            {/* Positioning Popup */}
            {isPositioningPopupOpen && (
                <PositioningScreen
                    component={component}
                    onPositionChange={handlePositionChange}
                    onClose={() => setIsPositioningPopupOpen(false)}
                />
            )}
        </>
    );
}; 
