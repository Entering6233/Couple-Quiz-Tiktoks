import React from 'react';
import { useCurrentFrame } from 'remotion';
import { spring, useVideoConfig } from 'remotion';
import { ImageComponent as ImageComponentType } from '../../types/script';

const IMAGE_SERVICE_URL = 'http://localhost:5003';

interface ImageComponentProps {
    component: ImageComponentType;
}

export const ImageComponent: React.FC<ImageComponentProps> = ({ component }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const startFrame = component.startFrame || 0;
    const duration = component.durationInFrames || 0;
    const endFrame = startFrame + duration;

    // If the current frame is outside our duration, don't render
    if (frame < startFrame || frame >= endFrame) {
        return null;
    }

    // Detailed logging for component props
    console.log('🖼️ ImageComponent Frame Info:', {
        currentFrame: frame,
        componentStartFrame: startFrame,
        componentDuration: duration,
        componentEndFrame: endFrame,
        hasAnimation: !!component.animation,
        timestamp: new Date().toISOString(),
    });

    const {
        imageUrl,
        style = {},
        animation
    } = component;

    // If no animation is specified or type is none, render without animation
    if (!animation || animation.in.type === 'none') {
        console.log('🎭 No animation or animation type is none, rendering static image');
        return renderImage(1);
    }

    // Calculate combined animation progress
    const getAnimationProgress = (currentFrame: number) => {
        const { startFrame: inStart = startFrame, endFrame: inEnd = startFrame + 30 } = animation.in;
        const { startFrame: outStart = endFrame - 30, endFrame: outEnd = endFrame } = animation.out;
        
        console.log('🎬 Animation Frame Info:', {
            currentFrame,
            absoluteInStart: inStart,
            absoluteInEnd: inEnd,
            absoluteOutStart: outStart,
            absoluteOutEnd: outEnd,
            timestamp: new Date().toISOString(),
        });

        // 1) If before in-start: fully transparent
        if (currentFrame < inStart) {
            console.log('⏳ Before entrance animation');
            return 0;
        }

        // 2) If we're in the in range, do a spring from 0 → 1
        if (currentFrame < inEnd) {
            const progress = spring({
                frame: currentFrame - inStart,
                fps,
                config: {
                    damping: 12,
                    mass: 0.5,
                },
                durationInFrames: inEnd - inStart,
            });
            console.log('🎭 During entrance animation:', { progress, currentFrame });
            return progress;
        }

        // 3) If we've passed the "in" but not yet at "out," we're fully visible
        if (currentFrame < outStart) {
            console.log('✨ Fully visible period');
            return 1;
        }

        // 4) If we're in the out range, fade from 1 → 0
        if (currentFrame < outEnd) {
            const outProgress = spring({
                frame: currentFrame - outStart,
                fps,
                config: {
                    damping: 12,
                    mass: 0.5,
                },
                durationInFrames: outEnd - outStart,
            });
            const finalProgress = 1 - outProgress;
            console.log('🎭 During exit animation:', { outProgress, finalProgress, currentFrame });
            return finalProgress;
        }

        // 5) After out-end: fully transparent
        console.log('⌛ After exit animation');
        return 0;
    };

    const progress = getAnimationProgress(frame);

    console.log('🎨 Final Animation State:', {
        progress,
        frame,
        timestamp: new Date().toISOString(),
    });

    return renderImage(progress);

    function renderImage(opacity: number) {
        const {
            width = 400,
            height = 400,
            position = { x: 0, y: 0 },
            scale = 1,
            rotation = 0,
            border = { enabled: false, color: '#000000', width: 2 },
            dropShadow = { enabled: false, color: '#000000', blur: 10, spread: 0, x: 5, y: 5 },
            cornerRadius = { enabled: false, isUniform: true, value: 10, topLeft: 10, topRight: 10, bottomLeft: 10, bottomRight: 10 }
        } = style;

        // Calculate corner radius styles if enabled
        const cornerRadiusStyle = cornerRadius.enabled ? {
            borderRadius: cornerRadius.isUniform
                ? `${cornerRadius.value}px`
                : `${cornerRadius.topLeft}px ${cornerRadius.topRight}px ${cornerRadius.bottomRight}px ${cornerRadius.bottomLeft}px`
        } : {};

        // Calculate shadow styles if enabled
        const shadowStyle = dropShadow.enabled ? {
            filter: `drop-shadow(${dropShadow.x}px ${dropShadow.y}px ${dropShadow.blur}px ${dropShadow.color})`
        } : {};

        // Calculate border styles if enabled
        const borderStyle = border.enabled ? {
            border: `${border.width}px solid ${border.color}`,
            // If corner radius is enabled, apply it to both container and image
            ...(cornerRadius.enabled ? cornerRadiusStyle : {})
        } : {};

        // Calculate animation styles
        const getAnimationStyle = () => {
            if (!animation || (animation.in.type === 'none' && animation.out.type === 'none')) {
                return {
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    opacity: style.opacity ?? 1
                };
            }

            // Determine which animation type to use based on whether we're in entrance or exit phase
            const isExitPhase = frame >= (animation.out?.startFrame ?? endFrame - 30);
            const type = isExitPhase ? animation.out.type : animation.in.type;

            switch (type) {
                case 'slide-left':
                    return {
                        transform: `translate(${-200 * (1 - opacity)}px, 0) scale(${scale}) rotate(${rotation}deg)`,
                        opacity: opacity * (style.opacity ?? 1)
                    };
                case 'slide-right':
                    return {
                        transform: `translate(${200 * (1 - opacity)}px, 0) scale(${scale}) rotate(${rotation}deg)`,
                        opacity: opacity * (style.opacity ?? 1)
                    };
                case 'slide-up':
                    return {
                        transform: `translate(0, ${-200 * (1 - opacity)}px) scale(${scale}) rotate(${rotation}deg)`,
                        opacity: opacity * (style.opacity ?? 1)
                    };
                case 'slide-down':
                    return {
                        transform: `translate(0, ${200 * (1 - opacity)}px) scale(${scale}) rotate(${rotation}deg)`,
                        opacity: opacity * (style.opacity ?? 1)
                    };
                case 'zoom':
                    return {
                        transform: `scale(${opacity * scale}) rotate(${rotation}deg)`,
                        opacity: opacity * (style.opacity ?? 1)
                    };
                case 'fade':
                default:
                    return {
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                        opacity: opacity * (style.opacity ?? 1)
                    };
            }
        };

        // Ensure the image URL includes the full domain and port
        const fullImageUrl = imageUrl.startsWith('http') 
            ? imageUrl 
            : `${IMAGE_SERVICE_URL}/images/${imageUrl}`;

        console.log('🎨 Rendering Image with styles:', {
            position,
            width,
            height,
            scale,
            rotation,
            opacity,
            animationStyle: getAnimationStyle(),
            fullImageUrl,
            timestamp: new Date().toISOString(),
        });

        return (
            <div
                style={{
                    position: 'absolute',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    ...getAnimationStyle(),
                    ...shadowStyle,
                    ...borderStyle,
                    ...cornerRadiusStyle,
                    overflow: 'hidden',
                }}
            >
                <img
                    src={fullImageUrl}
                    alt="Video component"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        // Apply corner radius to image as well to ensure proper masking
                        ...(cornerRadius.enabled ? cornerRadiusStyle : {})
                    }}
                    crossOrigin="anonymous"
                    onError={(e) => {
                        console.error('❌ Image Load Error:', {
                            fullImageUrl,
                            error: (e.currentTarget as any).error?.message || 'Unknown error',
                            timestamp: new Date().toISOString()
                        });
                    }}
                    onLoad={(e) => {
                        console.log('✅ Image Load Success:', {
                            fullImageUrl,
                            naturalWidth: e.currentTarget.naturalWidth,
                            naturalHeight: e.currentTarget.naturalHeight,
                            cornerRadius: cornerRadius.enabled ? cornerRadiusStyle : 'none',
                            timestamp: new Date().toISOString()
                        });
                    }}
                />
            </div>
        );
    }
}; 