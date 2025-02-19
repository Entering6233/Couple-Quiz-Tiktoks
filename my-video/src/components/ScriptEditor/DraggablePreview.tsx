import React, { useState, useRef } from 'react';
import { TextStyle } from '../../types/script';

interface DraggablePreviewProps {
    text: string;
    style: TextStyle;
    onChange: (updates: Partial<TextStyle>) => void;
}

export const DraggablePreview: React.FC<DraggablePreviewProps> = ({
    text,
    style,
    onChange,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const position = style.position || { x: 50, y: 50, width: 80 };

    const handleMouseDown = (e: React.MouseEvent, mode: 'drag' | 'resize') => {
        if (mode === 'drag') setIsDragging(true);
        if (mode === 'resize') setIsResizing(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging && !isResizing) return;
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        
        if (isDragging) {
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;

            const newX = position.x + (dx / containerRect.width * 100);
            const newY = position.y + (dy / containerRect.height * 100);

            onChange({
                position: {
                    ...position,
                    x: Math.max(0, Math.min(100, newX)),
                    y: Math.max(0, Math.min(100, newY)),
                }
            });
        }

        if (isResizing) {
            const dx = e.clientX - startPos.x;
            const newWidth = position.width + (dx / containerRect.width * 100);

            onChange({
                position: {
                    ...position,
                    width: Math.max(10, Math.min(100, newWidth)),
                }
            });
        }

        setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '400px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'default',
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                ref={elementRef}
                style={{
                    position: 'absolute',
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    width: `${position.width}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
            >
                <div
                    style={{
                        padding: '10px',
                        fontFamily: style.fontFamily,
                        fontSize: `${style.fontSize}px`,
                        color: style.color || '#fff',
                        textAlign: style.textAlign || 'center',
                        fontWeight: style.fontWeight,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'drag')}
                >
                    {text || 'Preview text will appear here...'}
                </div>
                <div
                    style={{
                        position: 'absolute',
                        right: '-5px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '10px',
                        height: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        cursor: 'ew-resize',
                        borderRadius: '4px',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'resize')}
                />
            </div>
        </div>
    );
}; 