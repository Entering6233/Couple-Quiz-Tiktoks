import React, { useRef, useState, useEffect } from 'react';
import { AudioComponent } from '../../types/script';
import { theme } from '../../styles/theme';

interface AudioEffect {
    name: string;
    url: string;
}

interface AudioComponentEditorProps {
    component: AudioComponent;
    onChange: (component: AudioComponent) => void;
    onDelete: () => void;
}

export const AudioComponentEditor: React.FC<AudioComponentEditorProps> = ({
    component,
    onChange,
    onDelete,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [effects, setEffects] = useState<AudioEffect[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch available effects on mount
    useEffect(() => {
        fetchEffects();
    }, []);

    const fetchEffects = async () => {
        try {
            console.log('Fetching available audio effects...');
            const response = await fetch('http://localhost:3005/effects/dictionary');
            if (!response.ok) throw new Error('Failed to fetch effects');
            const data = await response.json();
            console.log('Available effects:', data);
            setEffects(Object.entries(data).map(([name, url]) => ({ name, url: url as string })));
        } catch (error) {
            console.error('Error fetching effects:', error);
        }
    };

    const handleStyleChange = (key: string, value: number | boolean | undefined) => {
        onChange({
            ...component,
            style: {
                ...component.style,
                [key]: value,
            },
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            console.log('Uploading audio file:', file.name);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:3005/effects/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload audio file');
            const data = await response.json();
            console.log('Upload successful:', data);

            onChange({
                ...component,
                audioUrl: data.url,
            });

            // Refresh effects list after upload
            await fetchEffects();
        } catch (error) {
            console.error('Error uploading audio file:', error);
            alert('Failed to upload audio file. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEffectSelect = (effect: AudioEffect) => {
        console.log('Selected effect:', effect);
        onChange({
            ...component,
            audioUrl: effect.url,
        });
    };

    const handleEffectDelete = async (effectName: string) => {
        try {
            console.log('Deleting effect:', effectName);
            const response = await fetch('http://localhost:3005/effects/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: effectName }),
            });

            if (!response.ok) throw new Error('Failed to delete effect');
            console.log('Effect deleted successfully');
            
            // Refresh effects list after deletion
            await fetchEffects();
        } catch (error) {
            console.error('Error deleting effect:', error);
            alert('Failed to delete effect. Please try again.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.tertiary,
                borderRadius: theme.borderRadius.md,
            }}>
                <h3 style={{
                    margin: 0,
                    marginBottom: theme.spacing.sm,
                    fontSize: theme.fontSizes.lg,
                    color: theme.colors.text.primary,
                }}>Audio Settings</h3>

                {/* Audio Source Selection */}
                <div style={{ marginBottom: theme.spacing.md }}>
                    <label style={{
                        display: 'block',
                        marginBottom: theme.spacing.xs,
                        color: theme.colors.text.secondary,
                    }}>
                        Audio Source
                    </label>
                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                padding: theme.spacing.sm,
                                backgroundColor: theme.colors.primary,
                                color: theme.colors.text.primary,
                                border: 'none',
                                borderRadius: theme.borderRadius.sm,
                                cursor: 'pointer',
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Uploading...' : 'Upload Audio File'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Available Effects */}
                    {effects.length > 0 && (
                        <div style={{ 
                            marginTop: theme.spacing.md,
                            padding: theme.spacing.sm,
                            backgroundColor: theme.colors.background.secondary,
                            borderRadius: theme.borderRadius.sm,
                        }}>
                            <h4 style={{
                                margin: 0,
                                marginBottom: theme.spacing.sm,
                                color: theme.colors.text.primary,
                            }}>Available Effects</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                                {effects.map((effect) => (
                                    <div key={effect.name} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: theme.spacing.xs,
                                        backgroundColor: component.audioUrl === effect.url ? theme.colors.primary : 'transparent',
                                        borderRadius: theme.borderRadius.sm,
                                        cursor: 'pointer',
                                    }}>
                                        <span
                                            onClick={() => handleEffectSelect(effect)}
                                            style={{
                                                flex: 1,
                                                color: theme.colors.text.primary,
                                            }}
                                        >
                                            {effect.name}
                                        </span>
                                        <button
                                            onClick={() => handleEffectDelete(effect.name)}
                                            style={{
                                                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                                                backgroundColor: theme.colors.warning,
                                                color: theme.colors.text.primary,
                                                border: 'none',
                                                borderRadius: theme.borderRadius.sm,
                                                cursor: 'pointer',
                                                fontSize: '0.8em',
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* URL Input */}
                    <input
                        type="text"
                        value={component.audioUrl}
                        onChange={(e) => onChange({ ...component, audioUrl: e.target.value })}
                        placeholder="Or enter audio URL"
                        style={{
                            width: '100%',
                            marginTop: theme.spacing.sm,
                            padding: theme.spacing.sm,
                            borderRadius: theme.borderRadius.sm,
                            border: `1px solid ${theme.colors.border}`,
                            backgroundColor: theme.colors.background.secondary,
                            color: theme.colors.text.primary,
                        }}
                    />
                </div>

                {/* Volume Control */}
                <div style={{ marginBottom: theme.spacing.md }}>
                    <label style={{
                        display: 'block',
                        marginBottom: theme.spacing.xs,
                        color: theme.colors.text.secondary,
                    }}>
                        Volume
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={component.style?.volume ?? 1}
                        onChange={(e) => handleStyleChange('volume', parseFloat(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Start Time */}
                <div style={{ marginBottom: theme.spacing.md }}>
                    <label style={{
                        display: 'block',
                        marginBottom: theme.spacing.xs,
                        color: theme.colors.text.secondary,
                    }}>
                        Start Time (seconds)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={component.style?.startTime ?? 0}
                        onChange={(e) => handleStyleChange('startTime', parseFloat(e.target.value))}
                        style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            borderRadius: theme.borderRadius.sm,
                            border: `1px solid ${theme.colors.border}`,
                            backgroundColor: theme.colors.background.secondary,
                            color: theme.colors.text.primary,
                        }}
                    />
                </div>

                {/* Duration */}
                <div style={{ marginBottom: theme.spacing.md }}>
                    <label style={{
                        display: 'block',
                        marginBottom: theme.spacing.xs,
                        color: theme.colors.text.secondary,
                    }}>
                        Duration (seconds, leave empty for full duration)
                    </label>
                    <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={component.style?.duration ?? ''}
                            onChange={(e) => handleStyleChange('duration', e.target.value ? parseFloat(e.target.value) : undefined)}
                            style={{
                                flex: 1,
                                padding: theme.spacing.sm,
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.border}`,
                                backgroundColor: theme.colors.background.secondary,
                                color: theme.colors.text.primary,
                            }}
                        />
                        <button
                            onClick={async () => {
                                try {
                                    const audio = new Audio(typeof component.audioUrl === 'string' ? component.audioUrl : component.audioUrl.url);
                                    await new Promise<void>((resolve) => {
                                        audio.addEventListener('loadedmetadata', () => {
                                            const durationInFrames = Math.ceil(audio.duration * 30); // 30 fps
                                            onChange({
                                                ...component,
                                                durationInFrames
                                            });
                                            resolve();
                                        });
                                    });
                                } catch (error) {
                                    console.error('Failed to recalculate audio duration:', error);
                                }
                            }}
                            style={{
                                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                backgroundColor: theme.colors.primary,
                                color: 'white',
                                border: 'none',
                                borderRadius: theme.borderRadius.sm,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Recalculate Duration
                        </button>
                    </div>
                </div>

                {/* Loop Toggle */}
                <div style={{ marginBottom: theme.spacing.md }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                        color: theme.colors.text.secondary,
                        cursor: 'pointer',
                    }}>
                        <input
                            type="checkbox"
                            checked={component.style?.loop ?? false}
                            onChange={(e) => handleStyleChange('loop', e.target.checked)}
                        />
                        Loop Audio
                    </label>
                </div>
            </div>

            {/* Delete Button */}
            <button
                onClick={onDelete}
                style={{
                    padding: theme.spacing.sm,
                    backgroundColor: theme.colors.warning,
                    color: theme.colors.text.primary,
                    border: 'none',
                    borderRadius: theme.borderRadius.sm,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                Delete
            </button>

            {/* Audio Preview */}
            {component.audioUrl && (
                <div style={{
                    marginTop: theme.spacing.md,
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.background.tertiary,
                    borderRadius: theme.borderRadius.md,
                }}>
                    <h4 style={{
                        margin: 0,
                        marginBottom: theme.spacing.sm,
                        color: theme.colors.text.primary,
                    }}>Preview</h4>
                    <audio
                        controls
                        src={component.audioUrl}
                        style={{ width: '100%' }}
                    />
                </div>
            )}
        </div>
    );
}; 