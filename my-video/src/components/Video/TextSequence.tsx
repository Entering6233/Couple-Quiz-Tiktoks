import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TextComponent } from '../../types/script';

interface TextSequenceProps {
    component: TextComponent;
}

export const TextSequence: React.FC<TextSequenceProps> = ({ component }) => {
    const style = component.style || {};
    const position = style.position || { x: 0, y: 0 };

    // Format text based on wordsPerLine
    const formatText = (text: string) => {
        if (!text || !style.wordsPerLine || style.wordsPerLine <= 0) {
            return text;
        }

        // Remove existing line breaks and extra spaces
        const cleanText = text.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
        const words = cleanText.split(' ');
        const lines = [];
        
        // Group words into lines
        for (let i = 0; i < words.length; i += style.wordsPerLine) {
            const line = words.slice(i, i + style.wordsPerLine).join(' ');
            if (line) lines.push(line);
        }
        
        // Join lines with newlines
        return lines.join('\n');
    };

    // Create text shadow for outline effect
    const getTextShadow = () => {
        if (!style.outline?.enabled) return 'none';

        const width = style.outline.width || 2;
        const color = style.outline.color || '#000000';
        const shadows = [];

        // Generate outline effect using multiple text shadows
        for (let x = -width; x <= width; x++) {
            for (let y = -width; y <= width; y++) {
                if (Math.abs(x) === width || Math.abs(y) === width) {
                    shadows.push(`${x}px ${y}px 0 ${color}`);
                }
            }
        }

        return shadows.join(', ');
    };

    return (
        <AbsoluteFill>
            <div style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                fontSize: style.fontSize || 40,
                fontFamily: style.fontFamily || 'Arial',
                color: style.color || 'white',
                textAlign: style.textAlign || 'center',
                width: '100%',
                maxWidth: '80%',
                margin: '0 auto',
                transform: 'translate(0, 0)', // Prevent any transform issues
                whiteSpace: 'pre-wrap', // Preserve line breaks
                fontWeight: style.fontWeight || 'normal',
                lineHeight: style.lineHeight || 1.5,
                textShadow: getTextShadow(),
            }}>
                {formatText(component.text)}
            </div>
        </AbsoluteFill>
    );
}; 