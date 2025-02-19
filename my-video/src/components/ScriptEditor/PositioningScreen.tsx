import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TextComponent } from '../../types/script';
import { theme } from '../../styles/theme';

const PREVIEW_WIDTH = 400; // Doubled from 200
const PREVIEW_HEIGHT = 712; // Doubled from 356
const SCALE_FACTOR = 2.7; // Halved from 5.4 since we doubled the preview size

interface Props {
    component: TextComponent;
    onPositionChange: (position: { x: number; y: number }) => void;
    onClose: () => void;
}

const getInitialPosition = (component: TextComponent) => {
    if (component.style?.position) {
        return {
            x: component.style.position.x / SCALE_FACTOR,
            y: component.style.position.y / SCALE_FACTOR,
        };
    }
    return {
        x: PREVIEW_WIDTH / 2,
        y: PREVIEW_HEIGHT / 2,
    };
};

export const PositioningScreen: React.FC<Props> = React.memo(({ component, onPositionChange, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState(() => ({
        isDragging: false,
        position: getInitialPosition(component)
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

                {/* Center dot */}
                <div
                    style={{
                        position: 'absolute',
                        left: state.position.x,
                        top: state.position.y,
                        width: 8,
                        height: 8,
                        backgroundColor: theme.colors.primary,
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
                    }}
                />
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