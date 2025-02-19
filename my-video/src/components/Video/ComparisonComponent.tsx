import React from 'react';
import { ComparisonComponent as ComparisonComponentType } from '../../types/script';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { theme } from '../../styles/theme';

interface ComparisonComponentProps {
    component: ComparisonComponentType;
}

const getAnimationStyle = (
    frame: number,
    animation: ComparisonComponentType['style']['animation'],
    isSecondImage: boolean = false,
    durationInFrames: number
) => {
    if (!animation || animation.type === 'none') {
        return {};
    }

    const delay = (animation.delay || 0) + (isSecondImage ? (animation.stagger || 0) : 0);
    const duration = animation.duration || 30;
    const currentFrame = Math.max(0, frame - delay);
    const progress = interpolate(
        currentFrame,
        [0, duration, durationInFrames - duration, durationInFrames],
        [0, 1, 1, 0],
        {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: animation.easing === 'linear' ? (t) => t :
                   animation.easing === 'ease-in' ? (t) => t * t :
                   animation.easing === 'ease-out' ? (t) => 1 - Math.pow(1 - t, 2) :
                   (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        }
    );

    switch (animation.type) {
        case 'fade':
            return { opacity: progress };
        case 'scale':
            return { transform: `scale(${progress})` };
        case 'rotate':
            return { transform: `rotate(${interpolate(progress, [0, 1], [0, 360])}deg)` };
        case 'slide':
            const offset = 100;
            const x = animation.direction === 'left' ? -offset : 
                     animation.direction === 'right' ? offset : 0;
            const y = animation.direction === 'top' ? -offset :
                     animation.direction === 'bottom' ? offset : 0;
            return {
                transform: `translate(${interpolate(progress, [0, 1], [x, 0])}%, ${interpolate(progress, [0, 1], [y, 0])}%)`
            };
        default:
            return {};
    }
};

export const ComparisonComponent: React.FC<ComparisonComponentProps> = ({ component }) => {
    const frame = useCurrentFrame();
    const { 
        fontSize = 32, 
        fontFamily = 'Arial', 
        textColor = '#ffffff', 
        backgroundColor = 'rgba(0, 0, 0, 0.7)', 
        spacing = 20, 
        borderRadius = 8, 
        shadow = true,
        showText = true,
        imageSize = 100,
        imageGap = 20,
        forceSameSize = true,
        imagePosition = { x: 0, y: 0 },
        imageBorder,
        imageDropShadow,
        animation
    } = component.style || {};

    // Base fade animation
    const opacity = interpolate(
        frame,
        [0, 15, component.durationInFrames - 15, component.durationInFrames],
        [0, 1, 1, 0]
    );

    const imageContainerStyle = {
        display: 'flex',
        flexDirection: component.orientation === 'horizontal' ? 'row' as const : 'column' as const,
        gap: `${imageGap}px`,
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translate(${imagePosition.x}%, ${imagePosition.y}%)`,
        width: '100%',
        height: '100%',
        padding: '10% 5%',
    };

    const commonImageStyle = {
        width: forceSameSize ? `${imageSize}%` : 'auto',
        height: forceSameSize ? `${imageSize}%` : 'auto',
        maxWidth: forceSameSize ? `${imageSize}%` : '100%',
        maxHeight: forceSameSize ? `${imageSize}%` : '100%',
        objectFit: forceSameSize ? 'contain' : 'cover',
        borderRadius: `${borderRadius}px`,
        border: imageBorder?.enabled ? `${imageBorder.width}px solid ${imageBorder.color}` : undefined,
        boxShadow: imageDropShadow?.enabled ? 
            `${imageDropShadow.x}px ${imageDropShadow.y}px ${imageDropShadow.blur}px ${imageDropShadow.spread}px ${imageDropShadow.color}` : 
            undefined,
    };

    return (
        <AbsoluteFill style={{ opacity }}>
            {/* Question */}
            {showText && (
                <div style={{
                    position: 'absolute',
                    top: '5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor,
                    padding: '10px 20px',
                    borderRadius: borderRadius,
                    boxShadow: shadow ? '0 2px 4px rgba(0,0,0,0.2)' : undefined,
                    fontSize: `${fontSize}px`,
                    fontFamily,
                    color: textColor,
                    textAlign: 'center',
                    zIndex: 10,
                }}>
                    {component.question}
                </div>
            )}

            {/* Images Container */}
            <div style={imageContainerStyle}>
                {/* Left/Top Image */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    ...getAnimationStyle(frame, animation, false, component.durationInFrames),
                }}>
                    <img
                        src={component.leftOption.imageUrl}
                        style={commonImageStyle}
                        alt={component.leftOption.text}
                    />
                    {showText && (
                        <div style={{
                            backgroundColor,
                            padding: '5px 10px',
                            borderRadius: borderRadius,
                            boxShadow: shadow ? '0 2px 4px rgba(0,0,0,0.2)' : undefined,
                            fontSize: `${fontSize * 0.8}px`,
                            fontFamily,
                            color: textColor,
                            textAlign: 'center',
                        }}>
                            {component.leftOption.text}
                        </div>
                    )}
                </div>

                {/* Right/Bottom Image */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    ...getAnimationStyle(frame, animation, true, component.durationInFrames),
                }}>
                    <img
                        src={component.rightOption.imageUrl}
                        style={commonImageStyle}
                        alt={component.rightOption.text}
                    />
                    {showText && (
                        <div style={{
                            backgroundColor,
                            padding: '5px 10px',
                            borderRadius: borderRadius,
                            boxShadow: shadow ? '0 2px 4px rgba(0,0,0,0.2)' : undefined,
                            fontSize: `${fontSize * 0.8}px`,
                            fontFamily,
                            color: textColor,
                            textAlign: 'center',
                        }}>
                            {component.rightOption.text}
                        </div>
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
}; 