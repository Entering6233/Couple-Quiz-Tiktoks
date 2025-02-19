import React from 'react';
import { WordTiming, CaptionStyleOptions } from '../../types/script';

interface CaptionRendererProps {
    wordTimings: WordTiming[];
    style: CaptionStyleOptions;
    currentTime: number;
}

export const CaptionRenderer: React.FC<CaptionRendererProps> = ({ wordTimings, style, currentTime }) => {
    // Log initial state with timing details
    console.log('CaptionRenderer state:', {
        currentTime: currentTime.toFixed(3),
        totalWords: wordTimings.length,
        allWordTimings: wordTimings.map(w => ({
            word: w.word,
            start: w.start.toFixed(3),
            end: w.end.toFixed(3),
            duration: (w.end - w.start).toFixed(3)
        }))
    });

    // Find words that should be visible based on the current time
    const visibleWords = wordTimings.filter(timing => {
        const isVisible = currentTime >= timing.start && currentTime <= timing.end;
        console.log(`Word "${timing.word}" visibility check:`, {
            word: timing.word,
            currentTime: currentTime.toFixed(3),
            start: timing.start.toFixed(3),
            end: timing.end.toFixed(3),
            isVisible,
            conditions: {
                afterStart: currentTime >= timing.start,
                beforeEnd: currentTime <= timing.end
            }
        });
        return isVisible;
    });

    // Log detailed timing analysis
    console.log('Timing analysis:', {
        currentTime: currentTime.toFixed(3),
        visibleWords: visibleWords.map(w => ({
            word: w.word,
            start: w.start.toFixed(3),
            end: w.end.toFixed(3),
            timeUntilEnd: (w.end - currentTime).toFixed(3),
            timeFromStart: (currentTime - w.start).toFixed(3)
        })),
        nextWords: wordTimings
            .filter(w => w.start > currentTime)
            .slice(0, 3)
            .map(w => ({
                word: w.word,
                startsIn: (w.start - currentTime).toFixed(3),
                start: w.start.toFixed(3),
                end: w.end.toFixed(3)
            }))
    });

    if (visibleWords.length === 0) {
        console.log('No visible words at time:', currentTime.toFixed(3));
        return null;
    }

    // Build the text style based on the caption style
    const textStyle: React.CSSProperties = {
        position: 'absolute',
        ...(style.customPosition ? {
            left: style.customPosition.x,
            top: style.customPosition.y,
            transform: 'translate(-50%, -50%)',
        } : {
            bottom: style.position === 'top' ? 'auto' : '10%',
            top: style.position === 'top' ? '10%' : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
        }),
        textAlign: 'center',
        fontSize: `${style.fontSize}px`,
        color: style.color,
        backgroundColor: style.backgroundColor,
        padding: style.padding || '10px 20px',
        borderRadius: style.borderRadius || '5px',
        maxWidth: '80%',
        transition: 'all 0.2s ease-in-out',
        fontWeight: style.fontWeight || 'normal',
        fontFamily: style.fontFamily || 'Arial',
        fontStyle: style.fontStyle || 'normal',
        opacity: style.opacity || 1,
    };

    // Apply text stroke and shadow styles if textStyle is 'bordered'
    if (style.textStyle === 'bordered') {
        textStyle.WebkitTextStroke = style.WebkitTextStroke || '1px black';
        textStyle.textShadow = style.textShadow || '2px 2px 4px rgba(0,0,0,0.5)';
    }

    const visibleText = visibleWords.map(word => word.word).join(' ');
    console.log('Rendering text:', visibleText);

    return (
        <div style={textStyle}>
            {visibleText}
        </div>
    );
}; 