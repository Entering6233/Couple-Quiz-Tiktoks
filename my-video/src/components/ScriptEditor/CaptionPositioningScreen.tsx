import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CaptionStyleOptions } from '../../types/script';
import { theme } from '../../styles/theme';

const PREVIEW_WIDTH = 400;
const PREVIEW_HEIGHT = 712;
const SCALE_FACTOR = 2.7;

interface Props {
    style: CaptionStyleOptions;
    onPositionChange: (position: { x: number; y: number }) => void;
    onClose: () => void;
}

const getInitialPosition = (style: CaptionStyleOptions) => {
    if (style.position === 'top') {
        return {
            x: PREVIEW_WIDTH / 2,
            y: PREVIEW_HEIGHT * 0.1, // 10% from top
        };
    }
    return {
        x: PREVIEW_WIDTH / 2,
        y: PREVIEW_HEIGHT * 0.9, // 90% from top (10% from bottom)
    };
};

export const CaptionPositioningScreen: React.FC<Props> = React.memo(({ style, onPositionChange, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState(() => ({
        isDragging: false,
        position: getInitialPosition(style)
    }));

    const updatePosition = useCallback((clientX: number, clientY: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.min(Math.max(0, clientX - rect.left), PREVIEW_WIDTH);
            const y = Math.min(Math.max(0, clientY - rect.top), PREVIEW_HEIGHT);
            
            setState(prev => ({
                ...prev,
                position: { x, y }
            }));
            onPositionChange({
                x: Math.round(x * SCALE_FACTOR),
                y: Math.round(y * SCALE_FACTOR),
            });
        }
    }, [onPositionChange]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setState(prev => ({ ...prev, isDragging: true }));
        updatePosition(e.clientX, e.clientY);
    }, [updatePosition]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (state.isDragging) {
            updatePosition(e.clientX, e.clientY);
        }
    }, [state.isDragging, updatePosition]);

    const handleMouseUp = useCallback(() => {
        setState(prev => ({ ...prev, isDragging: false }));
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Example caption text for preview
    const previewText = "Example Caption Text";

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,
        }}>
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                style={{
                    width: PREVIEW_WIDTH,
                    height: PREVIEW_HEIGHT,
                    backgroundColor: '#1a1a1a',
                    position: 'relative',
                    borderRadius: theme.borderRadius.sm,
                    overflow: 'hidden',
                    cursor: state.isDragging ? 'grabbing' : 'grab',
                }}
            >
                {/* Grid lines */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(to right, #333 1px, transparent 1px),
                        linear-gradient(to bottom, #333 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    opacity: 0.5,
                    pointerEvents: 'none',
                }} />

                {/* Preview Caption */}
                <div style={{
                    position: 'absolute',
                    left: state.position.x,
                    top: state.position.y,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: style.backgroundColor || 'rgba(0, 0, 0, 0.7)',
                    color: style.color || '#ffffff',
                    padding: style.padding || '10px 20px',
                    borderRadius: style.borderRadius || '5px',
                    fontSize: `${(style.fontSize || 24) / SCALE_FACTOR}px`,
                    fontFamily: style.fontFamily || 'Arial',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    maxWidth: '80%',
                    whiteSpace: 'nowrap',
                }}>
                    {previewText}
                </div>
            </div>

            {/* Position display */}
            <div style={{
                display: 'flex',
                gap: theme.spacing.md,
                justifyContent: 'center',
                color: theme.colors.text.secondary,
                fontSize: theme.fontSizes.sm,
            }}>
                <span>X: {Math.round(state.position.x * SCALE_FACTOR)}</span>
                <span>Y: {Math.round(state.position.y * SCALE_FACTOR)}</span>
            </div>
        </div>
    );
}); 