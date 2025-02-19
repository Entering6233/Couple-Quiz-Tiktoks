import React, { useState, useRef } from 'react';
import { VoiceComponent } from '../../types/script';
import { generateSpeech } from '../../services/elevenLabs';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { DraggablePreview } from './DraggablePreview';

interface VoiceComponentEditorProps {
    component: VoiceComponent;
    onChange: (updated: VoiceComponent) => void;
}

type VoiceStatus = 'none' | 'generating' | 'success' | 'error';

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
        ...commonStyles.label,
        color: theme.colors.text.primary,
        display: 'block',
        marginBottom: theme.spacing.xs,
    },
    input: {
        ...commonStyles.input,
        backgroundColor: theme.colors.background.tertiary,
        border: `1px solid ${theme.colors.border}`,
        color: theme.colors.text.primary,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        width: '100%',
    },
    button: {
        ...commonStyles.button.primary,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    },
};

export const VoiceComponentEditor: React.FC<VoiceComponentEditorProps> = ({
    component,
    onChange,
}) => {
    const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>(
        component.audioUrl ? 'success' : 'none'
    );
    const [errorMessage, setErrorMessage] = useState<string>('');
    const audioRef = useRef<HTMLAudioElement>(null);
    const style = component.style || {};

    const handleVoiceGeneration = async () => {
        try {
            if (!component.text) {
                setErrorMessage('Please enter text for voice generation');
                return;
            }

            setVoiceStatus('generating');
            setErrorMessage('');
            
            const { audioUrl, wordTimings } = await generateSpeech({
                text: component.text,
                voiceId: component.voiceSettings?.voiceId || 'GhJYgP4Lrji0pwS3kQwv',
                settings: {
                    stability: component.voiceSettings?.stability || 0.75,
                    similarity_boost: component.voiceSettings?.similarity_boost || 0.75,
                },
            });

            // Create a temporary audio element to get duration
            const tempAudio = new Audio(audioUrl);
            await new Promise((resolve) => {
                tempAudio.addEventListener('loadedmetadata', () => {
                    // Convert audio duration to frames (assuming 30fps)
                    const durationInFrames = Math.ceil(tempAudio.duration * 30);
                    
                    onChange({
                        ...component,
                        audioUrl,
                        wordTimings,
                        durationInFrames, // Update the duration based on audio length
                    });
                    resolve(null);
                });
            });

            setVoiceStatus('success');
        } catch (error) {
            console.error('Voice generation failed:', error);
            setVoiceStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Voice generation failed');
        }
    };

    // Handle audio load to update duration if needed
    const handleAudioLoad = () => {
        if (audioRef.current && component.audioUrl) {
            const durationInFrames = Math.ceil(audioRef.current.duration * 30);
            if (durationInFrames !== component.durationInFrames) {
                onChange({
                    ...component,
                    durationInFrames,
                });
            }
        }
    };

    const getStatusColor = () => {
        switch (voiceStatus) {
            case 'generating': return '#ffd700';
            case 'success': return '#4caf50';
            case 'error': return '#f44336';
            default: return '#007bff';
        }
    };

    return (
        <div style={styles.container}>
            {/* Voice Generation Section */}
            <div style={styles.section}>
                <h4 style={{ marginTop: 0 }}>Voice Generation</h4>
                <div style={{ marginBottom: theme.spacing.md }}>
                    <label style={styles.label}>Voice Text:</label>
                    <textarea
                        value={component.text}
                        onChange={(e) => onChange({
                            ...component,
                            text: e.target.value,
                        })}
                        style={{
                            ...styles.input,
                            minHeight: '100px',
                        }}
                        placeholder="Enter text for voice generation..."
                    />
                </div>

                <div style={styles.grid}>
                    <div>
                        <label style={styles.label}>Voice:</label>
                        <select
                            value={component.voiceSettings?.voiceId}
                            onChange={(e) => onChange({
                                ...component,
                                voiceSettings: {
                                    ...component.voiceSettings,
                                    voiceId: e.target.value,
                                },
                            })}
                            style={styles.input}
                        >
                            <option value="GhJYgP4Lrji0pwS3kQwv">Josh (Default)</option>
                            <option value="21m00Tcm4TlvDq8ikWAM">Rachel</option>
                            <option value="AZnzlk1XvdvUeBnXmlld">Domi</option>
                            <option value="EXAVITQu4vr4xnSDxMaL">Bella</option>
                            <option value="MF3mGyEYCl7XYWbV9V6O">Elli</option>
                        </select>
                    </div>

                    <div>
                        <label style={styles.label}>Stability:</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={((component.voiceSettings?.stability || 0.75) * 100)}
                            onChange={(e) => onChange({
                                ...component,
                                voiceSettings: {
                                    ...component.voiceSettings,
                                    stability: parseInt(e.target.value) / 100,
                                },
                            })}
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Similarity Boost:</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={((component.voiceSettings?.similarity_boost || 0.75) * 100)}
                            onChange={(e) => onChange({
                                ...component,
                                voiceSettings: {
                                    ...component.voiceSettings,
                                    similarity_boost: parseInt(e.target.value) / 100,
                                },
                            })}
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={{ marginTop: theme.spacing.md }}>
                    <button
                        onClick={handleVoiceGeneration}
                        disabled={voiceStatus === 'generating'}
                        style={{
                            ...styles.button,
                            backgroundColor: getStatusColor(),
                        }}
                    >
                        {voiceStatus === 'generating' && (
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid white',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }}>
                                <style>
                                    {`
                                        @keyframes spin {
                                            0% { transform: rotate(0deg); }
                                            100% { transform: rotate(360deg); }
                                        }
                                    `}
                                </style>
                            </div>
                        )}
                        {voiceStatus === 'generating' ? 'Generating...' : 
                         voiceStatus === 'success' ? 'Regenerate Voice' : 
                         voiceStatus === 'error' ? 'Try Again' : 
                         'Generate Voice'}
                    </button>
                    {voiceStatus === 'success' && (
                        <span style={{ color: '#4caf50', marginLeft: '10px' }}>✓ Voice generated successfully</span>
                    )}
                    {voiceStatus === 'error' && (
                        <span style={{ color: '#f44336', marginLeft: '10px' }}>⚠️ {errorMessage}</span>
                    )}
                </div>

                {/* Audio Preview with ref and onLoadedMetadata */}
                {component.audioUrl && (
                    <div style={{ marginTop: theme.spacing.md }}>
                        <label style={styles.label}>Preview Audio:</label>
                        <audio
                            ref={audioRef}
                            controls
                            src={component.audioUrl}
                            onLoadedMetadata={handleAudioLoad}
                            style={{ width: '100%' }}
                        />
                        <div style={{ 
                            marginTop: theme.spacing.sm,
                            fontSize: '0.9em',
                            color: theme.colors.text.secondary 
                        }}>
                            Duration: {Math.ceil(audioRef.current?.duration || 0)}s 
                            ({component.durationInFrames} frames)
                        </div>
                    </div>
                )}
            </div>

            {/* Caption Settings */}
            <div style={styles.section}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: theme.spacing.md,
                    marginBottom: theme.spacing.md 
                }}>
                    <h4 style={{ margin: 0 }}>Caption Settings</h4>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                    }}>
                        <input
                            type="checkbox"
                            checked={component.showCaptions}
                            onChange={(e) => onChange({
                                ...component,
                                showCaptions: e.target.checked,
                            })}
                        />
                        Show Captions
                    </label>
                </div>

                {component.showCaptions && (
                    <>
                        {/* Text Styling */}
                        <div style={styles.grid}>
                            <div>
                                <label style={styles.label}>Font Size:</label>
                                <input
                                    type="number"
                                    value={style.fontSize || 24}
                                    onChange={(e) => onChange({
                                        ...component,
                                        style: {
                                            ...style,
                                            fontSize: parseInt(e.target.value),
                                        },
                                    })}
                                    style={styles.input}
                                    min="12"
                                    max="72"
                                />
                            </div>

                            <div>
                                <label style={styles.label}>Font Family:</label>
                                <select
                                    value={style.fontFamily || 'Arial'}
                                    onChange={(e) => onChange({
                                        ...component,
                                        style: {
                                            ...style,
                                            fontFamily: e.target.value,
                                        },
                                    })}
                                    style={styles.input}
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Verdana">Verdana</option>
                                </select>
                            </div>

                            <div>
                                <label style={styles.label}>Text Color:</label>
                                <input
                                    type="color"
                                    value={style.color || '#ffffff'}
                                    onChange={(e) => onChange({
                                        ...component,
                                        style: {
                                            ...style,
                                            color: e.target.value,
                                        },
                                    })}
                                    style={styles.input}
                                />
                            </div>

                            <div>
                                <label style={styles.label}>Background Color:</label>
                                <input
                                    type="color"
                                    value={component.captionStyle?.backgroundColor || '#000000'}
                                    onChange={(e) => onChange({
                                        ...component,
                                        captionStyle: {
                                            ...component.captionStyle,
                                            backgroundColor: e.target.value,
                                        },
                                    })}
                                    style={styles.input}
                                />
                            </div>

                            <div>
                                <label style={styles.label}>Font Weight:</label>
                                <select
                                    value={style.fontWeight || 'normal'}
                                    onChange={(e) => onChange({
                                        ...component,
                                        style: {
                                            ...style,
                                            fontWeight: e.target.value,
                                        },
                                    })}
                                    style={styles.input}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="bold">Bold</option>
                                    <option value="lighter">Light</option>
                                </select>
                            </div>

                            <div>
                                <label style={styles.label}>Text Alignment:</label>
                                <select
                                    value={style.textAlign || 'center'}
                                    onChange={(e) => onChange({
                                        ...component,
                                        style: {
                                            ...style,
                                            textAlign: e.target.value as 'left' | 'center' | 'right',
                                        },
                                    })}
                                    style={styles.input}
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                        </div>

                        {/* Position Preview */}
                        <div style={{ marginTop: theme.spacing.lg }}>
                            <h4 style={{ marginBottom: '10px' }}>Position & Preview</h4>
                            <DraggablePreview
                                text={component.text}
                                style={style}
                                onChange={(updates) => onChange({
                                    ...component,
                                    style: {
                                        ...style,
                                        ...updates,
                                    },
                                })}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}; 