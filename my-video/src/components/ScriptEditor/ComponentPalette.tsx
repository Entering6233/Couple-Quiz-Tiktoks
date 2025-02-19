import React from 'react';
import { ComponentType } from '../../types/script';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';

interface ComponentPaletteProps {
    onDragStart: (type: ComponentType) => void;
}

interface ComponentOption {
    type: ComponentType;
    label: string;
    icon: string;
    description: string;
    create: () => any;
}

const components: ComponentOption[] = [
    {
        type: 'text',
        label: 'Text',
        icon: '📝',
        description: 'Add text with optional voice-over',
        create: () => ({
            type: 'text',
            text: '',
            style: {
                fontSize: '16px',
                fontWeight: 'normal',
                color: '#000000',
                lineHeight: '1.5',
            },
        }),
    },
    {
        type: 'title',
        label: 'Title',
        icon: '🔤',
        description: 'Large text with optional subtitle',
        create: () => ({
            type: 'title',
            text: '',
            style: {
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#000000',
                lineHeight: '1.2',
            },
        }),
    },
    {
        type: 'comparison',
        label: 'Comparison',
        icon: '⚖️',
        description: 'Compare two options side by side',
        create: () => ({
            type: 'comparison',
            options: [],
            style: {
                width: '100%',
                height: 'auto',
            },
        }),
    },
    {
        type: 'countdown',
        label: 'Countdown',
        icon: '⏱️',
        description: 'Animated countdown timer',
        create: () => ({
            type: 'countdown',
            duration: 60,
            style: {
                width: '100%',
                height: 'auto',
            },
        }),
    },
    {
        type: 'transition',
        label: 'Transition',
        icon: '🔄',
        description: 'Smooth transition between scenes',
        create: () => ({
            type: 'transition',
            duration: 1,
            style: {
                width: '100%',
                height: 'auto',
            },
        }),
    },
    {
        type: 'voice',
        label: 'Voice',
        icon: '🎙️',
        description: 'Generate voice with synchronized captions',
        create: () => ({
            type: 'voice',
            text: '',
            style: {
                fontSize: '16px',
                fontWeight: 'normal',
                color: '#000000',
                lineHeight: '1.5',
            },
        }),
    },
    {
        type: 'video',
        label: 'Video',
        icon: '🎬',
        description: 'Add custom video content',
        create: () => ({
            type: 'video',
            videoUrl: '',
            style: {
                width: '100%',
                height: 'auto',
            },
        }),
    },
    {
        type: 'audio',
        label: 'Audio Effect',
        icon: '🎵',
        description: 'Add audio effect',
        create: () => ({
            type: 'audio',
            audioUrl: '',
            style: {
                volume: 1,
                loop: false,
                startTime: 0,
            },
        }),
    },
    {
        type: 'image',
        label: 'Image',
        icon: '🖼️',
        description: 'Add an image with optional effects',
        create: () => ({
            type: 'image',
            imageUrl: '',
            style: {
                width: '100%',
                height: 'auto',
                opacity: 1,
                scale: 1,
                rotation: 0,
                position: { x: 0, y: 0 },
                border: {
                    width: 0,
                    color: '#000000',
                    style: 'solid'
                },
                dropShadow: {
                    enabled: false,
                    color: '#000000',
                    blur: 10,
                    offset: { x: 0, y: 0 }
                }
            },
        }),
    },
];

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onDragStart }) => {
    return (
        <div>
            <h3 style={commonStyles.heading}>Components</h3>
            <div style={{
                display: 'flex',
                gap: theme.spacing.sm,
                flexWrap: 'wrap',
            }}>
                {components.map(({ type, label, icon, description }) => (
                    <div
                        key={type}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('componentType', type);
                            onDragStart(type);
                        }}
                        style={{
                            backgroundColor: theme.colors.background.tertiary,
                            borderRadius: theme.borderRadius.md,
                            padding: theme.spacing.sm,
                            cursor: 'grab',
                            transition: 'all 0.2s ease',
                            border: `1px solid ${theme.colors.border}`,
                            flex: '0 0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: theme.spacing.sm,
                            minWidth: 'auto',
                        }}
                    >
                        <span style={{ fontSize: '1.2em' }}>{icon}</span>
                        <span style={{
                            color: theme.colors.text.primary,
                            fontWeight: 'bold',
                        }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}; 