import React, { useEffect } from 'react';
import { useCurrentFrame } from '@remotion/core';
import { CaptionStyleOptions } from '../../types/script';
import { getAnimationStyle } from '../../styles/captionAnimations';

interface AnimatedCaptionsProps {
    text: string;
    style: CaptionStyleOptions;
    frame: number;
}

export const AnimatedCaptions: React.FC<AnimatedCaptionsProps> = ({ text, style, frame }) => {
    const currentFrame = useCurrentFrame();
    
    useEffect(() => {
        // Load custom font if provided
        if (style.customFontUrl) {
            const link = document.createElement('link');
            link.href = style.customFontUrl;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            return () => {
                document.head.removeChild(link);
            };
        }
    }, [style.customFontUrl]);

    const getAnimatedText = () => {
        switch (style.animationStyle) {
            case 'wordByWord':
                return text.split(' ').map((word, index) => (
                    <span
                        key={index}
                        style={{
                            display: 'inline-block',
                            opacity: currentFrame >= frame + (index * 5) ? 1 : 0,
                            transition: `opacity ${style.animationDuration || 500}ms`
                        }}
                    >
                        {word + ' '}
                    </span>
                ));
            
            case 'characterByCharacter':
                return text.split('').map((char, index) => (
                    <span
                        key={index}
                        style={{
                            display: 'inline-block',
                            opacity: currentFrame >= frame + (index * 2) ? 1 : 0,
                            transition: `opacity ${style.animationDuration || 500}ms`
                        }}
                    >
                        {char}
                    </span>
                ));
            
            default:
                return text;
        }
    };

    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        [style.position]: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: style.fontFamily || 'Arial',
        fontSize: style.fontSize,
        color: style.color,
        backgroundColor: style.backgroundColor,
        padding: style.padding || '10px 20px',
        borderRadius: style.borderRadius || '5px',
        boxShadow: style.boxShadow,
        opacity: style.opacity,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        WebkitTextStroke: style.textStroke,
        textShadow: style.textShadow,
        animation: style.animationStyle ? getAnimationStyle(style.animationStyle, style.animationDuration || 500) : undefined,
        whiteSpace: style.animationStyle === 'typeWriter' ? 'nowrap' : 'normal',
        overflow: 'hidden',
        maxWidth: '80%',
        textAlign: 'center' as const,
    };

    return (
        <div style={containerStyle}>
            {getAnimatedText()}
        </div>
    );
}; 