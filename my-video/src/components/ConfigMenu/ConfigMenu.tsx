import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { ImageSelector } from '../Setup/ImageSelector';
import { Script } from '../../types/script';
import { useConfigStore } from '../../store/configStore';
import { useVideoConfig } from 'remotion';
import { useApiKeys } from '../../store/apiKeysStore';
import { FontManager } from '../Settings/FontManager';
import { BackgroundManager } from '../Settings/BackgroundManager';

interface ConfigMenuProps {
    isOpen: boolean;
    onClose: () => void;
    script: Script;
    onScriptChange: (script: Script) => void;
}

export const ConfigMenu: React.FC<ConfigMenuProps> = ({
    isOpen,
    onClose,
    script,
    onScriptChange,
}) => {
    const [fps, setFps] = useState(script.settings?.fps || 30);
    const { 
        elevenLabsApiKey, 
        pexelsApiKey, 
        setElevenLabsApiKey,
        setPexelsApiKey,
    } = useApiKeys();

    const [localElevenLabsKey, setLocalElevenLabsKey] = useState(elevenLabsApiKey);
    const [localPexelsKey, setLocalPexelsKey] = useState(pexelsApiKey);
    const [showKeys, setShowKeys] = useState(false);
    const [isFontManagerOpen, setIsFontManagerOpen] = useState(false);
    const [showBackgroundManager, setShowBackgroundManager] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load initial config
        fetch('http://localhost:5003/config')
            .then(res => res.json())
            .then(data => {
                setLocalPexelsKey(data.pexels_api_key || '');
            })
            .catch(err => {
                console.error('Failed to load config:', err);
                setError('Failed to load configuration');
            });
    }, []);

    const handleSave = () => {
        setElevenLabsApiKey(localElevenLabsKey);
        setPexelsApiKey(localPexelsKey);
        
        // Also update the image service config
        fetch('http://localhost:5003/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pexels_api_key: localPexelsKey,
            }),
        }).catch(err => {
            console.error('Failed to update image service config:', err);
        });
        
        // Save FPS to script settings
        const updatedScript = {
            ...script,
            settings: {
                ...script.settings,
                fps: fps
            }
        };
        onScriptChange(updatedScript);
        
        onClose();
    };

    const handleBackgroundChange = () => {
        // Create a file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        
        // Handle file selection
        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            console.log('Selected file:', file.name, file.type);

            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('http://localhost:3002/set_background', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload background');
                }

                const { filePath } = await response.json();

                // Update script with new background settings
                const backgroundType = file.type.startsWith('video/') ? 'video' as const : 'image' as const;
                const updatedScript = {
                    ...script,
                    settings: {
                        ...script.settings,
                        background: {
                            type: backgroundType,
                            url: filePath,
                            filePath: file.name,
                            ...(backgroundType === 'video' ? { durationInFrames: 300 } : {})
                        }
                    }
                };

                onScriptChange(updatedScript);
            } catch (error) {
                console.error('Error uploading background:', error);
            }
        };

        // Trigger file selection
        input.click();
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5003/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pexels_api_key: pexelsApiKey,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save configuration');
            }

            // Show success message or update UI as needed
        } catch (err) {
            console.error('Failed to save config:', err);
            setError(err instanceof Error ? err.message : 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <h2 style={{
                        ...commonStyles.heading,
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                        color: theme.colors.text.primary,
                        fontSize: '20px',
                    }}>
                        ⚙️ Settings
                    </h2>
                }
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing.md,
                }}>
                    {/* Video Settings */}
                    <div>
                        <h3 style={commonStyles.heading}>Video Settings</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                color: theme.colors.text.primary,
                                marginBottom: '8px',
                            }}>
                                FPS (1-200):
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="200"
                                value={fps}
                                onChange={(e) => setFps(Math.min(200, Math.max(1, parseInt(e.target.value) || 30)))}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: theme.colors.background.secondary,
                                    border: `1px solid ${theme.colors.border}`,
                                    borderRadius: theme.borderRadius.sm,
                                    color: theme.colors.text.primary,
                                }}
                            />
                            <small style={{ color: theme.colors.text.secondary }}>
                                Higher FPS will result in smoother video but longer render times
                            </small>
                        </div>
                    </div>

                    {/* API Key Settings */}
                    <div>
                        <h3 style={commonStyles.heading}>API Keys</h3>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px',
                        }}>
                            <label style={{ color: theme.colors.text.primary }}>Show API Keys:</label>
                            <input
                                type="checkbox"
                                checked={showKeys}
                                onChange={(e) => setShowKeys(e.target.checked)}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                color: theme.colors.text.primary,
                                marginBottom: '8px',
                            }}>
                                ElevenLabs API Key:
                            </label>
                            <input
                                type={showKeys ? 'text' : 'password'}
                                value={localElevenLabsKey}
                                onChange={(e) => setLocalElevenLabsKey(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: theme.colors.background.secondary,
                                    border: `1px solid ${theme.colors.border}`,
                                    borderRadius: theme.borderRadius.sm,
                                    color: theme.colors.text.primary,
                                }}
                                placeholder="Enter your ElevenLabs API key"
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                color: theme.colors.text.primary,
                                marginBottom: '8px',
                            }}>
                                Pexels API Key:
                            </label>
                            <input
                                type={showKeys ? 'text' : 'password'}
                                value={localPexelsKey}
                                onChange={(e) => setLocalPexelsKey(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: theme.colors.background.secondary,
                                    border: `1px solid ${theme.colors.border}`,
                                    borderRadius: theme.borderRadius.sm,
                                    color: theme.colors.text.primary,
                                }}
                                placeholder="Enter your Pexels API key"
                            />
                        </div>
                    </div>

                    {/* Background Settings */}
                    <div>
                        <h3 style={commonStyles.heading}>Background</h3>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: theme.spacing.sm,
                        }}>
                            <button
                                onClick={() => setShowBackgroundManager(true)}
                                style={commonStyles.button.secondary}
                            >
                                Manage Backgrounds
                            </button>
                            {script.settings.background?.url && (
                                <button
                                    onClick={() => onScriptChange({
                                        ...script,
                                        settings: {
                                            ...script.settings,
                                            background: {
                                                type: 'none',
                                            },
                                        },
                                    })}
                                    style={{
                                        ...commonStyles.button.secondary,
                                        color: theme.colors.error,
                                    }}
                                >
                                    Reset to Default
                                </button>
                            )}
                            {script.settings.background?.type === 'video' && (
                                <div style={{
                                    color: theme.colors.text.secondary,
                                    fontSize: '0.9em',
                                    marginTop: theme.spacing.sm,
                                }}>
                                    Note: Video will loop if timeline exceeds video length
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Font Manager Button */}
                    <div>
                        <button
                            onClick={() => setIsFontManagerOpen(true)}
                            style={{
                                ...commonStyles.button,
                                width: '100%',
                                padding: theme.spacing.md,
                                backgroundColor: theme.colors.primary,
                                color: theme.colors.text.primary,
                            }}
                        >
                            Manage Custom Fonts
                        </button>
                    </div>

                    {/* Save Button */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: theme.spacing.sm,
                        marginTop: theme.spacing.md,
                    }}>
                        <button
                            onClick={onClose}
                            style={commonStyles.button.secondary}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            style={commonStyles.button.primary}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Background Manager Modal */}
            {showBackgroundManager && (
                <Modal
                    isOpen={showBackgroundManager}
                    onClose={() => setShowBackgroundManager(false)}
                    title="Background Manager"
                >
                    <BackgroundManager
                        onSelectBackground={(background) => {
                            onScriptChange({
                                ...script,
                                settings: {
                                    ...script.settings,
                                    background: background
                                }
                            });
                            setShowBackgroundManager(false);
                        }}
                    />
                </Modal>
            )}

            {/* Font Manager Modal */}
            {isFontManagerOpen && (
                <FontManager onClose={() => setIsFontManagerOpen(false)} />
            )}
        </>
    );
}; 