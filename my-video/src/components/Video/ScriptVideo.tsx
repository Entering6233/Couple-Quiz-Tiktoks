import React, { useEffect } from 'react';
import { 
    AbsoluteFill, 
    Sequence, 
    spring, 
    useCurrentFrame, 
    useVideoConfig, 
    Audio 
} from 'remotion';
import { 
    Script, 
    TextComponent as TextComponentType, 
    VoiceComponent as VoiceComponentType, 
    AudioComponent as AudioComponentType 
} from '../../types/script';
import { CaptionRenderer } from './CaptionRenderer';
import { ComparisonComponent } from './ComparisonComponent';
import { VideoComponent } from './VideoComponent';
import { TextComponent } from './TextComponent';
import { ImageComponent } from './ImageComponent';

// Add debug logging
const log = (message: string, data?: any) => {
    console.log(`[ScriptVideo] ${message}`, data ? data : '');
};

const error = (message: string, error?: any) => {
    console.error(`[ScriptVideo] ${message}`, error ? error : '');
};

interface ScriptVideoProps {
    script: Script;
}

// Fix ErrorBoundary component to use proper React import
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ScriptVideo Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <AbsoluteFill style={{ backgroundColor: 'black', color: 'white', padding: 20 }}>
                    <h1>Error Rendering Video</h1>
                    <pre>{this.state.error?.message}</pre>
                </AbsoluteFill>
            );
        }

        return this.props.children;
    }
}

// Validate script data
const validateScript = (script: Script) => {
    if (!script) {
        throw new Error('No script data provided');
    }
    
    if (!Array.isArray(script.components)) {
        throw new Error('Script components must be an array');
    }
    
    log(`Validating script with ${script.components.length} components`);
    
    script.components.forEach((comp, index) => {
        if (!comp.type) {
            throw new Error(`Component ${index} has no type`);
        }
        if (typeof comp.startFrame !== 'number') {
            throw new Error(`Component ${index} (${comp.type}) has invalid startFrame`);
        }
        if (typeof comp.durationInFrames !== 'number') {
            throw new Error(`Component ${index} (${comp.type}) has invalid durationInFrames`);
        }
        log(`Component ${index + 1}: ${comp.type} - ${comp.id} (${comp.durationInFrames} frames)`);
    });
    
    return true;
};

const getAnimationStyle = (frame: number, fps: number, animation: string, direction: 'in' | 'out', timing: { start: number; end: number }) => {
    if (!animation) return {};

    const isOut = direction === 'out';
    const durationInFrames = timing.end - timing.start;
    const adjustedFrame = frame - timing.start;

    console.log(`Animation ${direction}:`, {
        frame,
        adjustedFrame,
        timing,
        durationInFrames,
    });

    // If we're not within the animation timeframe, return the final state
    if (adjustedFrame < 0) return isOut ? {} : { opacity: 0, transform: getInitialTransform(animation) };
    if (adjustedFrame > durationInFrames) return isOut ? { opacity: 0, transform: getFinalTransform(animation) } : {};

    switch (animation) {
        case 'slide-left': {
            const opacity = spring({
                frame: adjustedFrame,
                fps,
                from: isOut ? 1 : 0,
                to: isOut ? 0 : 1,
                durationInFrames,
            });

            const slideX = spring({
                frame: adjustedFrame,
                fps,
                from: isOut ? 0 : -200,
                to: isOut ? -200 : 0,
                durationInFrames,
                config: {
                    damping: 12,
                    mass: 0.5,
                },
            });

            return {
                opacity,
                transform: `translateX(${slideX}px)`,
            };
        }
        case 'slide-right': {
            const opacity = spring({
                frame: adjustedFrame,
                fps,
                from: isOut ? 1 : 0,
                to: isOut ? 0 : 1,
                durationInFrames,
            });

            const slideX = spring({
                frame: adjustedFrame,
                fps,
                from: isOut ? 0 : 200,
                to: isOut ? 200 : 0,
                durationInFrames,
                config: {
                    damping: 12,
                    mass: 0.5,
                },
            });

            return {
                opacity,
                transform: `translateX(${slideX}px)`,
            };
        }
        default:
            return {};
    }
};

// Helper functions to get initial and final transform states
const getInitialTransform = (animation: string) => {
    switch (animation) {
        case 'slide-left':
            return 'translateX(-200px)';
        case 'slide-right':
            return 'translateX(200px)';
        default:
            return 'none';
    }
};

const getFinalTransform = (animation: string) => {
    switch (animation) {
        case 'slide-left':
            return 'translateX(-200px)';
        case 'slide-right':
            return 'translateX(200px)';
        default:
            return 'none';
    }
};

const BACKGROUND_SERVICE_URL = 'http://localhost:3002';

export const ScriptVideo: React.FC<ScriptVideoProps> = ({ script }) => {
    log('Rendering ScriptVideo with script:', script);

    // Validate script data
    try {
        validateScript(script);
    } catch (err) {
        error('Script validation failed:', err);
        return (
            <AbsoluteFill style={{ backgroundColor: 'black', color: 'white', padding: 20 }}>
                <h1>Invalid Script Data</h1>
                <pre>{err instanceof Error ? err.message : 'Unknown error'}</pre>
            </AbsoluteFill>
        );
    }

    useEffect(() => {
        const loadFonts = async () => {
            try {
                log('Loading fonts...');
                // Get font dictionary from font service
                const response = await fetch('http://localhost:3003/fonts/dictionary');
                if (!response.ok) {
                    error('Failed to load font dictionary, using system fonts');
                    return;
                }
                const fontDict = await response.json();
                log('Font dictionary loaded:', fontDict);

                // Get unique font families used in components
                const usedFonts = new Set<string>();
                script.components.forEach(comp => {
                    if (comp.type === 'text' || comp.type === 'title') {
                        const textComp = comp as { style?: { fontFamily?: string } };
                        if (textComp.style?.fontFamily) {
                            usedFonts.add(textComp.style.fontFamily);
                            log('Found font:', textComp.style.fontFamily);
                        }
                    }
                });

                // Load each used font
                const fontLoadPromises = Array.from(usedFonts).map(async fontName => {
                    const fontData = fontDict[fontName];
                    if (fontData?.url) {
                        try {
                            log('Loading font:', fontName, 'from URL:', fontData.url);
                            const font = new FontFace(fontName, `url(${fontData.url})`);
                            const loadedFont = await font.load();
                            document.fonts.add(loadedFont);
                            log('Successfully loaded font:', fontName);
                            return true;
                        } catch (error) {
                            error('Error loading font:', { fontName, error });
                            return false;
                        }
                    }
                    return false;
                });

                await Promise.all(fontLoadPromises);
                log('All fonts loaded');
            } catch (error) {
                error('Error in loadFonts:', error);
            }
        };

        loadFonts();
    }, [script]);

    // Ensure background URL is properly formed with the background service URL
    let backgroundStyle = { backgroundColor: 'black' };
    try {
        if (script.settings?.background?.type === 'image' && script.settings.background.url) {
            const backgroundUrl = script.settings.background.url.startsWith('http') 
                ? script.settings.background.url 
                : `${BACKGROUND_SERVICE_URL}/backgrounds/${encodeURIComponent(script.settings.background.url)}`;
            log('Setting background image URL:', backgroundUrl);
            backgroundStyle = { 
                backgroundImage: `url("${backgroundUrl}")`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
            };
        } else {
            log('Using default black background');
        }
    } catch (error) {
        error('Error setting background style:', error);
    }

    const renderComponent = (component: any) => {
        try {
            log('Rendering component:', { type: component.type, id: component.id });
            
            switch (component.type) {
                case 'text':
                    return <TextComponent component={component as TextComponentType} />;
                case 'comparison':
                    return <ComparisonComponent component={component as any} />;
                case 'video':
                    return <VideoComponent component={component as any} />;
                case 'voice':
                    return <VoiceComponent component={component as VoiceComponentType} />;
                case 'audio':
                    return <AudioEffectComponent component={component as AudioComponentType} />;
                case 'image':
                    return <ImageComponent component={component as any} />;
                default:
                    error('Unknown component type:', component.type);
                    return null;
            }
        } catch (error) {
            error('Error rendering component:', { component, error });
            return null;
        }
    };

    return (
        <ErrorBoundary>
            <AbsoluteFill style={backgroundStyle}>
                {script.components.map((component) => {
                    const key = `${component.id}-${component.startFrame}-${component.durationInFrames}`;
                    log('Rendering sequence for component:', { key, component });
                    
                    return (
                        <Sequence
                            key={key}
                            from={component.startFrame || 0}
                            durationInFrames={component.durationInFrames || 150}
                        >
                            {renderComponent(component)}
                        </Sequence>
                    );
                })}
            </AbsoluteFill>
        </ErrorBoundary>
    );
};

const VoiceComponent: React.FC<{ component: VoiceComponentType }> = ({ component }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    console.log('VoiceComponent timing:', {
        frame,
        fps,
        currentTime,
        wordTimings: component.wordTimings,
        showCaptions: component.showCaptions
    });
    
    if (!component.audioUrl) {
        console.warn('VoiceComponent: No audio URL provided');
        return null;
    }

    // Calculate volume based on style settings
    const volume = component.style?.volume ?? 1;

    // Calculate start and end times if specified
    const startTime = component.style?.startTime ?? 0;
    const duration = component.style?.duration;

    // Convert word timings to numbers
    const normalizedWordTimings = component.wordTimings?.map(timing => ({
        ...timing,
        start: typeof timing.start === 'string' ? parseFloat(timing.start) : timing.start,
        end: typeof timing.end === 'string' ? parseFloat(timing.end) : timing.end
    }));

    return (
        <AbsoluteFill>
            <Audio
                src={component.audioUrl}
                startFrom={startTime}
                endAt={duration ? startTime + duration : undefined}
            />
            {component.showCaptions && normalizedWordTimings && (
                <CaptionRenderer
                    wordTimings={normalizedWordTimings}
                    currentTime={currentTime}
                    style={component.captionStyle || {
                        fontSize: 24,
                        color: '#ffffff',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        position: 'bottom'
                    }}
                />
            )}
        </AbsoluteFill>
    );
};

const AudioEffectComponent: React.FC<{ component: AudioComponentType }> = ({ component }) => {
    if (!component.audioUrl) {
        console.warn('AudioEffectComponent: No audio URL provided');
        return null;
    }

    // Get audio settings from style
    const volume = component.style?.volume ?? 1;
    const startTime = component.style?.startTime ?? 0;
    const duration = component.style?.duration;
    const loop = component.style?.loop ?? false;

    // Handle both string URLs and audio object URLs
    const audioSrc = typeof component.audioUrl === 'string' 
        ? component.audioUrl 
        : component.audioUrl.url;

    return (
        <Audio
            src={audioSrc}
            volume={volume}
            startFrom={startTime}
            endAt={duration ? startTime + duration : undefined}
            loop={loop}
        />
    );
}; 