import { spring, interpolate } from 'remotion';
import { AnimationOptions } from '../types/script';

// Enhanced spring configurations for different animation feels
const springConfigs = {
    bouncy: { damping: 8, mass: 0.8, stiffness: 100 },
    smooth: { damping: 15, mass: 0.5, stiffness: 80 },
    snappy: { damping: 12, mass: 0.3, stiffness: 200 },
    gentle: { damping: 20, mass: 1, stiffness: 50 }
};

// Default slide distance in pixels (increased to ensure text starts off-screen)
const DEFAULT_SLIDE_DISTANCE = 1200;

export const getAnimationStyle = (frame: number, fps: number, animation?: AnimationOptions) => {
    // Return empty object for no animation
    if (!animation || (!animation.entrance && !animation.exit)) {
        return {};
    }

    // Determine if we're in the entrance or exit phase
    const totalDuration = animation.entrance?.duration || 30;
    const exitDelay = animation.exit?.delay || 0;
    const exitDuration = animation.exit?.duration || 30;
    const isInExitPhase = frame >= (totalDuration + exitDelay);

    // Get the relevant animation config based on phase
    const currentAnimation = isInExitPhase ? animation.exit : animation.entrance;
    if (!currentAnimation || currentAnimation.type === 'none') {
        return {};
    }

    // Configure spring based on animation phase and feel
    const springConfig = currentAnimation.feel ? 
        springConfigs[currentAnimation.feel] : 
        {
            damping: currentAnimation.damping || 10,
            mass: currentAnimation.mass || 0.5,
            stiffness: currentAnimation.stiffness || 100,
        };

    // Calculate progress with spring
    const adjustedFrame = isInExitPhase ? frame - (totalDuration + exitDelay) : frame;
    const progress = spring({
        frame: adjustedFrame,
        fps,
        config: springConfig,
        durationInFrames: currentAnimation.duration || 30,
        delay: currentAnimation.delay || 0,
    });

    // For exit animations, we want to start from visible (1) and go to invisible (0)
    const currentProgress = isInExitPhase ? (1 - progress) : progress;

    // Helper function for smooth opacity
    const getOpacity = (p: number) => interpolate(p, [0, 0.1, 0.9, 1], [0, 1, 1, 1]);

    // Apply different transforms based on animation type
    switch (currentAnimation.type) {
        case 'none':
            return {};

        case 'fade':
            return {
                opacity: currentProgress,
            };

        case 'slide-left': {
            const offset = -DEFAULT_SLIDE_DISTANCE;
            const translateX = isInExitPhase ? 
                (offset * currentProgress) : // Exit: 0 -> -1200
                (offset * (1 - currentProgress)); // Enter: -1200 -> 0
            return {
                transform: `translateX(${translateX}px)`,
                opacity: getOpacity(currentProgress),
            };
        }

        case 'slide-right': {
            const offset = DEFAULT_SLIDE_DISTANCE;
            const translateX = isInExitPhase ? 
                (offset * currentProgress) : // Exit: 0 -> 1200
                (offset * (1 - currentProgress)); // Enter: 1200 -> 0
            return {
                transform: `translateX(${translateX}px)`,
                opacity: getOpacity(currentProgress),
            };
        }

        case 'slide-out-left':
            return {
                transform: `translateX(${-100 * currentProgress}px)`,
            };

        case 'slide-out-right':
            return {
                transform: `translateX(${100 * currentProgress}px)`,
            };

        case 'fadeScale':
            const scale = isInExitPhase ? 
                interpolate(currentProgress, [0, 1], [1.5, 1]) :
                interpolate(currentProgress, [0, 1], [0.5, 1]);
            return {
                opacity: getOpacity(currentProgress),
                transform: `scale(${scale})`,
            };

        case 'fadeSlide': {
            const offset = currentAnimation.offset || DEFAULT_SLIDE_DISTANCE;
            const direction = currentAnimation.slideDirection || 'right';
            let x = 0, y = 0;

            switch (direction) {
                case 'left': x = -offset; break;
                case 'right': x = offset; break;
                case 'up': y = -offset; break;
                case 'down': y = offset; break;
            }

            const translateX = isInExitPhase ? (x * currentProgress) : (x * (1 - currentProgress));
            const translateY = isInExitPhase ? (y * currentProgress) : (y * (1 - currentProgress));

            return {
                opacity: getOpacity(currentProgress),
                transform: `translate(${translateX}px, ${translateY}px)`,
            };
        }

        case 'bounce':
            const bounceProgress = spring({
                frame,
                fps,
                config: { damping: 8, mass: 0.8, stiffness: 150 },
                durationInFrames: animation.duration || 30,
            });
            const bounceScale = isInExitPhase ?
                interpolate(bounceProgress, [0, 1], [1.2, 1]) :
                interpolate(bounceProgress, [0, 0.7, 1], [0.3, 1.1, 1]);
            return {
                opacity: getOpacity(currentProgress),
                transform: `scale(${bounceScale})`,
            };

        case 'flip': {
            const rotateX = isInExitPhase ?
                interpolate(currentProgress, [0, 1], [0, -90]) :
                interpolate(currentProgress, [0, 1], [90, 0]);
            return {
                opacity: getOpacity(currentProgress),
                transform: `rotateX(${rotateX}deg)`,
                transformOrigin: 'center',
            };
        }

        case 'zoom':
            const zoomScale = isInExitPhase ?
                interpolate(currentProgress, [0, 1], [1, 2]) :
                interpolate(currentProgress, [0, 1], [0.1, 1]);
            return {
                opacity: getOpacity(currentProgress),
                transform: `scale(${zoomScale})`,
                transformOrigin: 'center',
            };

        case 'rotate': {
            const angle = isInExitPhase ?
                interpolate(currentProgress, [0, 1], [0, -360]) :
                interpolate(currentProgress, [0, 1], [360, 0]);
            const rotateScale = interpolate(currentProgress, [0, 0.5, 1], [0.5, 0.8, 1]);
            return {
                opacity: getOpacity(currentProgress),
                transform: `rotate(${angle}deg) scale(${rotateScale})`,
                transformOrigin: 'center',
            };
        }

        case 'slideRotate': {
            const offset = currentAnimation.offset || 100;
            const direction = currentAnimation.slideDirection || 'right';
            let x = 0, y = 0;

            switch (direction) {
                case 'left': x = -offset; break;
                case 'right': x = offset; break;
                case 'up': y = -offset; break;
                case 'down': y = offset; break;
            }

            if (isInExitPhase) {
                x *= -1;
                y *= -1;
            }

            const angle = isInExitPhase ?
                interpolate(currentProgress, [0, 1], [0, -90]) :
                interpolate(currentProgress, [0, 1], [90, 0]);

            return {
                opacity: getOpacity(currentProgress),
                transform: `translate(${x * (1 - currentProgress)}px, ${y * (1 - currentProgress)}px) rotate(${angle}deg)`,
                transformOrigin: 'center',
            };
        }

        case 'elastic': {
            const elasticProgress = spring({
                frame,
                fps,
                config: { damping: 4, mass: 0.3, stiffness: 150 },
                durationInFrames: animation.duration || 45,
            });
            const elasticScale = isInExitPhase ?
                interpolate(elasticProgress, [0, 1], [1, 0.3]) :
                interpolate(elasticProgress, [0, 0.6, 0.8, 1], [0.3, 1.2, 0.9, 1]);
            return {
                opacity: getOpacity(currentProgress),
                transform: `scale(${elasticScale})`,
                transformOrigin: 'center',
            };
        }

        default:
            return {};
    }
}; 