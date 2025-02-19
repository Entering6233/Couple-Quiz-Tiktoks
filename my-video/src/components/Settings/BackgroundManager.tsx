import React, { useState, useEffect } from 'react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

interface BackgroundHistory {
    name: string;
    url: string;
    addedAt: string;
    type: 'image' | 'video' | 'none';
}

interface BackgroundManagerProps {
    onSelectBackground: (background: { 
        type: 'image' | 'video' | 'none'; 
        url?: string; 
        filePath?: string;
        durationInFrames?: number;
    }) => void;
}

export const BackgroundManager: React.FC<BackgroundManagerProps> = ({ onSelectBackground }) => {
    const [backgrounds, setBackgrounds] = useState<BackgroundHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBackgrounds = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3002/backgrounds/history');
            if (!response.ok) throw new Error('Failed to load backgrounds');
            const data = await response.json();
            setBackgrounds(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load backgrounds');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBackgrounds();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const response = await fetch('http://localhost:3002/set_background', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload background');
            
            const data = await response.json();
            await loadBackgrounds(); // Refresh the list
            
            // Select the newly uploaded background
            onSelectBackground({
                type: 'image',
                url: data.url,
                filePath: data.filePath
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload background');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBackground = async (name: string) => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3002/remove_background', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) throw new Error('Failed to remove background');
            await loadBackgrounds(); // Refresh the list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove background');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>Background Manager</h3>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="background-upload"
                />
                <label htmlFor="background-upload" style={styles.uploadButton}>
                    Upload New Background
                </label>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.grid}>
                {/* No Background Option */}
                <div 
                    style={styles.backgroundItem}
                    onClick={() => onSelectBackground({ type: 'none', url: '', filePath: '' })}
                >
                    <div style={styles.noBackgroundPreview}>
                        No Background
                    </div>
                    <div style={styles.backgroundName}>None</div>
                </div>

                {backgrounds.map((bg) => (
                    <div key={bg.name} style={styles.backgroundItem}>
                        <div 
                            style={styles.imagePreview}
                            onClick={() => onSelectBackground({
                                type: 'image',
                                url: bg.url,
                                filePath: bg.name
                            })}
                        >
                            <img src={bg.url} alt={bg.name} style={styles.previewImage} />
                        </div>
                        <div style={styles.backgroundInfo}>
                            <div style={styles.backgroundName}>{bg.name}</div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveBackground(bg.name);
                                }}
                                style={styles.removeButton}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {loading && <div style={styles.loading}>Loading...</div>}
        </div>
    );
};

const styles = {
    container: {
        padding: theme.spacing.md,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        margin: 0,
        color: theme.colors.text.primary,
    },
    uploadButton: {
        ...commonStyles.button.primary,
        cursor: 'pointer',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: theme.spacing.md,
        marginTop: theme.spacing.md,
    },
    backgroundItem: {
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        backgroundColor: theme.colors.background.secondary,
    },
    imagePreview: {
        width: '100%',
        height: '150px',
        backgroundColor: theme.colors.background.tertiary,
        cursor: 'pointer',
        position: 'relative' as const,
    },
    noBackgroundPreview: {
        width: '100%',
        height: '150px',
        backgroundColor: theme.colors.background.tertiary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.text.secondary,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    },
    backgroundInfo: {
        padding: theme.spacing.sm,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backgroundName: {
        color: theme.colors.text.primary,
        fontSize: '0.9em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
    },
    removeButton: {
        ...commonStyles.button.secondary,
        color: theme.colors.error,
        padding: '4px 8px',
        fontSize: '0.8em',
    },
    error: {
        color: theme.colors.error,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.sm,
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderRadius: theme.borderRadius.sm,
    },
    loading: {
        textAlign: 'center' as const,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.md,
    },
}; 