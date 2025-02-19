import React, { useState } from 'react';
import { ScriptComponent } from '../../types/script';
import { generateSpeech } from '../../services/elevenLabs';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

interface VoiceOverEditorProps {
    component: ScriptComponent;
    onChange: (updated: ScriptComponent) => void;
}

type VoiceStatus = 'none' | 'generating' | 'success' | 'error';

const styles = {
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
};

export const VoiceOverEditor: React.FC<VoiceOverEditorProps> = ({
    component,
    onChange,
}) => {
    const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>(
        component.voiceOver?.audioUrl ? 'success' : 'none'
    );
    const [errorMessage, setErrorMessage] = useState<string>('');

    const getComponentText = (comp: ScriptComponent): string => {
        switch (comp.type) {
            case 'comparison':
                return comp.question;
            case 'text':
            case 'title':
                return comp.text;
            default:
                return '';
        }
    };

    const handleVoiceGeneration = async () => {
        try {
            const text = getComponentText(component);
            if (!text) {
                setErrorMessage('No text available for voice generation');
                return;
            }

            setVoiceStatus('generating');
            setErrorMessage('');
            
            const { audioUrl, wordTimings } = await generateSpeech({
                text,
                voiceId: component.voiceOver?.voiceId || 'default',
                settings: {
                    stability: 0.75,
                    similarity_boost: 0.75,
                },
            });

            onChange({
                ...component,
                voiceOver: {
                    text,
                    audioUrl,
                    wordTimings,
                    voiceId: component.voiceOver?.voiceId || 'default',
                    settings: {
                        stability: 0.75,
                        similarity_boost: 0.75,
                    },
                },
            });
            setVoiceStatus('success');
        } catch (error) {
            console.error('Voice generation failed:', error);
            setVoiceStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Voice generation failed');
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
        <div style={styles.section}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md,
                marginBottom: theme.spacing.md,
            }}>
                <h3 style={{ margin: 0 }}>Voice Over</h3>
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
                    <span style={{ color: '#4caf50' }}>✓ Voice generated successfully</span>
                )}
                {voiceStatus === 'error' && (
                    <span style={{ color: '#f44336' }}>⚠️ {errorMessage}</span>
                )}
            </div>

            {/* Caption Settings */}
            <div style={{ marginBottom: theme.spacing.md }}>
                <label style={{
                    ...styles.label,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                }}>
                    <input
                        type="checkbox"
                        checked={component.captions?.enabled ?? false}
                        onChange={(e) => onChange({
                            ...component,
                            captions: e.target.checked ? {
                                enabled: true,
                                displayMode: 'sync',
                                style: {
                                    fontSize: 24,
                                    color: 'white',
                                    textAlign: 'center',
                                },
                            } : undefined,
                        })}
                    />
                    Enable Captions
                </label>
            </div>

            {/* Audio Preview */}
            {component.voiceOver?.audioUrl && (
                <div style={{
                    marginTop: theme.spacing.md,
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.background.tertiary,
                    borderRadius: theme.borderRadius.md,
                }}>
                    <label style={styles.label}>Preview Audio:</label>
                    <audio
                        controls
                        src={component.voiceOver.audioUrl}
                        style={{ width: '100%' }}
                    />
                </div>
            )}
        </div>
    );
}; 