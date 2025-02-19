import React, { useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { SubtitleSequence } from 'remotion-subtitle';
import {
    BounceCaption,
    ColorfulCaption,
    ExplosiveCaption,
    FadeCaption,
    FireCaption,
    GlitchCaption,
    GlowingCaption,
    LightningCaption,
    NeonCaption,
    RotatingCaption,
    ShakeCaption,
    ThreeDishCaption,
    TiltShiftCaption,
    TypewriterCaption,
    WavingCaption,
    ZoomCaption,
} from 'remotion-subtitle';
import { TextStyle, WordTiming } from '../../types/script';

interface RemotionSubtitleCaptionProps {
    wordTimings: WordTiming[];
    style: TextStyle;
    startFrame: number;
}

const CAPTION_COMPONENTS = {
    bounce: BounceCaption,
    colorful: ColorfulCaption,
    explosive: ExplosiveCaption,
    fade: FadeCaption,
    fire: FireCaption,
    glitch: GlitchCaption,
    glowing: GlowingCaption,
    lightning: LightningCaption,
    neon: NeonCaption,
    rotating: RotatingCaption,
    shake: ShakeCaption,
    threeDish: ThreeDishCaption,
    tiltShift: TiltShiftCaption,
    typewriter: TypewriterCaption,
    waving: WavingCaption,
    zoom: ZoomCaption,
};

export const RemotionSubtitleCaption: React.FC<RemotionSubtitleCaptionProps> = (props) => {
    const { wordTimings, style, startFrame } = props;
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;
    const componentStartTime = startFrame / fps;

    // Enhanced debug logging
    const debugLog = (message: string, data?: any, trace: boolean = false, level: 'info' | 'warn' | 'error' = 'info') => {
        const timestamp = new Date().toISOString();
        const frameInfo = `[Frame: ${frame}]`;
        const componentInfo = `[RemotionSubtitleCaption]`;
        const propsSnapshot = JSON.stringify(props, null, 2);
        const callStack = new Error().stack;

        console.group(`${timestamp} ${frameInfo} ${componentInfo} ${message}`);
        console.log('Props Snapshot:', propsSnapshot);
        console.log('Current Frame:', frame);
        console.log('FPS:', fps);
        console.log('Current Time:', currentTime);
        console.log('Component Start Time:', componentStartTime);
        console.log('Data:', data);
        console.log('Call Stack:', callStack);
        if (trace) {
            console.trace('Detailed Stack Trace');
        }
        console.groupEnd();
    };

    // Log initial render
    debugLog('Component Initial Render', {
        hasWordTimings: !!wordTimings,
        wordTimingsCount: wordTimings.length,
        style,
        startFrame,
        currentTime,
        componentStartTime
    }, true);

    // Log component mount
    useEffect(() => {
        debugLog('Component Mounted', {
            wordTimingsCount: wordTimings.length,
            style,
            startFrame,
            currentTime,
            componentStartTime,
            mountTime: new Date().toISOString(),
        }, true);

        return () => {
            debugLog('Component Unmounting', {
                unmountTime: new Date().toISOString(),
                lastFrame: frame,
            }, true);
        };
    }, []);

    // Log every frame update
    useEffect(() => {
        const frameStartTime = performance.now();
        debugLog('Frame Update', {
            currentFrame: frame,
            currentTime,
            componentStartTime,
            activeWords: wordTimings.filter(timing => {
                const start = timing.start - componentStartTime;
                const end = timing.end - componentStartTime;
                return currentTime >= start && currentTime <= end;
            }).map(w => w.word)
        });
        const frameEndTime = performance.now();
        debugLog('Frame Update Complete', {
            frameDuration: frameEndTime - frameStartTime,
            frame,
        });
    }, [frame]);

    // Convert word timings to SRT format with logging
    debugLog('Converting word timings to SRT format', {
        wordTimings,
        componentStartTime
    });

    const srtContent = wordTimings
        .map((timing, index) => {
            const start = timing.start - componentStartTime;
            const end = timing.end - componentStartTime;
            const srtEntry = `${index + 1}\n${formatTime(start)} --> ${formatTime(end)}\n${timing.word}\n\n`;
            
            debugLog('Generated SRT entry:', {
                index,
                word: timing.word,
                originalStart: timing.start,
                originalEnd: timing.end,
                adjustedStart: start,
                adjustedEnd: end,
                srtEntry
            });

            return srtEntry;
        })
        .join('');

    // Get the appropriate caption component
    const CaptionComponent = style.captionStyle && CAPTION_COMPONENTS[style.captionStyle as keyof typeof CAPTION_COMPONENTS];
    
    debugLog('Caption component selection:', {
        requestedStyle: style.captionStyle,
        foundComponent: !!CaptionComponent,
        availableStyles: Object.keys(CAPTION_COMPONENTS)
    });

    if (!CaptionComponent) {
        debugLog('No caption component found for style', {
            style: style.captionStyle
        }, true);
        return null;
    }

    // Create subtitle sequence with logging
    debugLog('Creating subtitle sequence', {
        srtContent,
        style
    });

    const subtitles = new SubtitleSequence(srtContent);

    debugLog('Rendering subtitles', {
        currentFrame: frame,
        currentTime,
        style: {
            fontSize: style.fontSize || '24px',
            color: style.color || 'white',
            ...style,
        }
    }, true);

    return (
        <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '10%',
            transform: 'translateX(-50%)',
            width: '80%',
            textAlign: 'center',
        }}>
            {debugLog('Rendering Subtitles', {
                currentTime,
                componentStartTime,
                activeWords: wordTimings.filter(timing => {
                    const start = timing.start - componentStartTime;
                    const end = timing.end - componentStartTime;
                    return currentTime >= start && currentTime <= end;
                }).map(w => w.word)
            })}
            {subtitles.getSequences(
                <CaptionComponent style={{
                    fontSize: style.fontSize || '24px',
                    color: style.color || 'white',
                    ...style,
                }} />,
                fps
            )}
        </div>
    );
};

// Helper function to format time in SRT format (HH:MM:SS,mmm)
function formatTime(seconds: number): string {
    const pad = (n: number, width: number) => String(n).padStart(width, '0');
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(ms, 3)}`;
} 