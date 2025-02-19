import React, { useState, useEffect } from 'react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

interface FontManagerProps {
    onClose: () => void;
}

interface CustomFont {
    name: string;
    url: string;
    format: 'truetype' | 'opentype';
}

const styles = {
    modal: {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.lg,
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 1000,
    },
    overlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 999,
    },
    title: {
        margin: 0,
        marginBottom: theme.spacing.lg,
        color: theme.colors.text.primary,
        fontSize: theme.fontSizes.xl,
    },
    fontList: {
        marginBottom: theme.spacing.lg,
    },
    fontItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.tertiary,
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing.sm,
    },
    button: {
        ...commonStyles.button,
        marginRight: theme.spacing.sm,
    },
    deleteButton: {
        backgroundColor: theme.colors.error,
        color: 'white',
        border: 'none',
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        borderRadius: theme.borderRadius.sm,
        cursor: 'pointer',
    },
    input: {
        display: 'none',
    },
};

export const FontManager: React.FC<FontManagerProps> = ({ onClose }) => {
    const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

    // Load fonts from background service
    useEffect(() => {
        const loadFonts = async () => {
            try {
                const response = await fetch('http://localhost:3003/fonts/dictionary');
                if (!response.ok) throw new Error('Failed to load fonts');
                const fontDict = await response.json();
                
                // Convert dictionary to array
                const fonts = Object.entries(fontDict).map(([name, data]: [string, any]) => ({
                    name,
                    url: data.url,
                    format: data.format
                }));
                setCustomFonts(fonts);

                // Load each font
                fonts.forEach(font => {
                    try {
                        const testFont = new FontFace(font.name, `url(${font.url})`);
                        testFont.load().then(loadedFont => {
                            document.fonts.add(loadedFont);
                        }).catch(error => {
                            console.error('Error loading font:', error);
                        });
                    } catch (error) {
                        console.error('Error creating font:', error);
                    }
                });
            } catch (error) {
                console.error('Error loading font dictionary:', error);
            }
        };

        loadFonts();
    }, []);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if it's an OTF or TTF file
        if (!file.name.match(/\.(otf|ttf)$/i)) {
            alert('Please select an OTF or TTF font file');
            return;
        }

        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            // Upload font to font service
            const response = await fetch('http://localhost:3003/set_font', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload font');
            }

            const result = await response.json();
            const { url, name } = result;
            const format = file.name.toLowerCase().endsWith('.otf') ? 'opentype' as const : 'truetype' as const;

            // Test if font can be loaded
            console.log('Loading font:', name, 'from URL:', url);
            const testFont = new FontFace(name, `url(${url})`);
            await testFont.load();
            document.fonts.add(testFont);
            console.log('Successfully loaded font:', name);

            // Add new font to list
            const newFont: CustomFont = { name, url, format };
            setCustomFonts(prev => [...prev, newFont]);

            // Force preview to reload fonts
            window.dispatchEvent(new Event('fontsUpdated'));

        } catch (error) {
            console.error('Error loading font:', error);
            alert('Error loading font. Please try another file.');
        }
    };

    const handleDelete = async (fontName: string) => {
        try {
            // Delete font from font service
            const response = await fetch('http://localhost:3003/delete_font', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: fontName }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete font');
            }

            // Remove font from document.fonts
            const fontToRemove = Array.from(document.fonts).find(f => f.family === fontName);
            if (fontToRemove) {
                document.fonts.delete(fontToRemove);
                console.log('Removed font from document:', fontName);
            }

            // Update state
            setCustomFonts(prev => prev.filter(font => font.name !== fontName));

            // Force preview to reload fonts
            window.dispatchEvent(new Event('fontsUpdated'));

        } catch (error) {
            console.error('Error deleting font:', error);
            alert('Error deleting font. Please try again.');
        }
    };

    return (
        <>
            <div style={styles.overlay} onClick={onClose} />
            <div style={styles.modal}>
                <h2 style={styles.title}>Font Manager</h2>

                <div style={styles.fontList}>
                    {customFonts.map(font => (
                        <div key={font.name} style={styles.fontItem}>
                            <span style={{ 
                                fontFamily: `'${font.name}'`,
                                fontSize: '18px',
                            }}>
                                {font.name} - Sample Text
                            </span>
                            <button
                                style={styles.deleteButton}
                                onClick={() => handleDelete(font.name)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>

                <input
                    type="file"
                    accept=".otf,.ttf"
                    onChange={handleFileSelect}
                    id="font-file"
                    style={styles.input}
                />
                <label htmlFor="font-file" style={styles.button}>
                    Add Font
                </label>
                <button style={styles.button} onClick={onClose}>
                    Close
                </button>
            </div>
        </>
    );
}; 