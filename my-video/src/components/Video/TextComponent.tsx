import { useCurrentFrame, useVideoConfig } from 'remotion';
import { getAnimationStyle } from '../../utils/animation';
import { TextComponent as TextComponentType } from '../../types/script';
import { CSSProperties, useEffect } from 'react';

interface TextComponentProps {
    component: TextComponentType;
}

export const TextComponent: React.FC<TextComponentProps> = ({ component }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { style, text } = component;

    // Get animation style
    const animationStyle = getAnimationStyle(frame, fps, style?.animation);

    // Create base container style with positioning
    const containerStyle: CSSProperties = {
        position: 'absolute',
        left: style?.position?.x || '50%',
        top: style?.position?.y || '50%',
        transform: style?.position ? 'none' : 'translate(-50%, -50%)',
        fontSize: style?.fontSize || 32,
        fontFamily: style?.fontFamily || 'Arial',
        color: style?.color || '#ffffff',
        backgroundColor: style?.backgroundColor,
        padding: style?.padding,
        borderRadius: style?.borderRadius,
        textAlign: style?.textAlign || 'center',
        fontWeight: style?.fontWeight || 'normal',
        lineHeight: style?.lineHeight || 1.5,
        letterSpacing: typeof style?.letterSpacing === 'string' ? style.letterSpacing : `${style?.letterSpacing || 0}px`,
        ...(style?.textStyle === 'bordered' && {
            WebkitTextStroke: style.textStroke || '3px black',
            textShadow: 'none',
        }),
        ...animationStyle,
    };

    // Debug logging
    useEffect(() => {
        console.log('%c🎭 Animation State:', 'color: #ff00ff; font-weight: bold;', {
            frame,
            totalDuration: component.durationInFrames,
            animation: style?.animation,
            animationStyle,
        });
    }, [frame, component.durationInFrames, style?.animation, animationStyle]);

    // Don't render if we're past the total duration
    if (frame >= component.durationInFrames) {
        return null;
    }

    return (
        <div style={containerStyle}>
            {text}
        </div>
    );
}; 