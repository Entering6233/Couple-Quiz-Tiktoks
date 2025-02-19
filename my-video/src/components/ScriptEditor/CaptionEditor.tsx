import React, { useState } from 'react';
import { WordTiming } from '../../types/script';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

interface CaptionEditorProps {
    wordTimings: WordTiming[];
    onWordTimingsChange: (newTimings: WordTiming[]) => void;
    onClose: () => void;
}

export const CaptionEditor: React.FC<CaptionEditorProps> = ({
    wordTimings,
    onWordTimingsChange,
    onClose,
}) => {
    const [editingWord, setEditingWord] = useState<number | null>(null);
    const [localTimings, setLocalTimings] = useState<WordTiming[]>(wordTimings);

    const handleWordChange = (index: number, field: keyof WordTiming, value: string | number) => {
        const newTimings = [...localTimings];
        newTimings[index] = {
            ...newTimings[index],
            [field]: field === 'word' ? value : Number(value),
        };
        setLocalTimings(newTimings);
    };

    const handleSave = () => {
        onWordTimingsChange(localTimings);
        onClose();
    };

    return (
        <div style={{
            padding: theme.spacing.md,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md,
            maxHeight: '80vh',
            overflow: 'auto',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.sm,
            }}>
                {localTimings.map((timing, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            gap: theme.spacing.md,
                            alignItems: 'center',
                            padding: theme.spacing.sm,
                            backgroundColor: theme.colors.background.secondary,
                            borderRadius: theme.borderRadius.sm,
                        }}
                    >
                        <input
                            value={timing.word}
                            onChange={(e) => handleWordChange(index, 'word', e.target.value)}
                            style={{
                                flex: 2,
                                padding: '4px 8px',
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.border}`,
                                backgroundColor: theme.colors.background.tertiary,
                                color: theme.colors.text.primary,
                            }}
                        />
                        <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                            <label>Start:</label>
                            <input
                                type="number"
                                step="0.1"
                                value={timing.start}
                                onChange={(e) => handleWordChange(index, 'start', e.target.value)}
                                style={{
                                    width: '80px',
                                    padding: '4px 8px',
                                    borderRadius: theme.borderRadius.sm,
                                    border: `1px solid ${theme.colors.border}`,
                                    backgroundColor: theme.colors.background.tertiary,
                                    color: theme.colors.text.primary,
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                            <label>End:</label>
                            <input
                                type="number"
                                step="0.1"
                                value={timing.end}
                                onChange={(e) => handleWordChange(index, 'end', e.target.value)}
                                style={{
                                    width: '80px',
                                    padding: '4px 8px',
                                    borderRadius: theme.borderRadius.sm,
                                    border: `1px solid ${theme.colors.border}`,
                                    backgroundColor: theme.colors.background.tertiary,
                                    color: theme.colors.text.primary,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: theme.spacing.md,
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
                    Save Changes
                </button>
            </div>
        </div>
    );
}; 