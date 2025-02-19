import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { BaseScriptComponent, TextComponent, VoiceComponent, AudioComponent } from '../../types/script';
import { Script, Component } from '../../types/script';
import { theme } from '../../styles/theme';
import { useVideoConfig } from '../../contexts/VideoConfigContext';

const FRAMES_PER_SECOND = 30;
const TRACK_HEIGHT = 40;
const NUM_TRACKS = 5;
const TIMELINE_HEADER_HEIGHT = 30;
const DEFAULT_DURATION = FRAMES_PER_SECOND * 5;

// Helper function to format time
const formatTime = (frames: number): string => {
    const totalSeconds = frames / FRAMES_PER_SECOND;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds % 1) * 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

interface ExtendedScript extends Script {
    durationInFrames: number;
}

interface ExtendedAudioComponent extends AudioComponent {
    audioUrl: string;
}

interface ExtendedVoiceComponent extends VoiceComponent {
    audioUrl?: string;
}

interface TimelineProps {
    script: Script;
    onReorder: (components: BaseScriptComponent[]) => void;
    onSelect: (id: string) => void;
    selectedId?: string;
    onDelete: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ 
    script: rawScript, 
    onReorder,
    onSelect,
    selectedId,
    onDelete,
}) => {
    const script = rawScript as ExtendedScript;
    const timelineRef = useRef<HTMLDivElement>(null);
    const [components, setComponents] = useState<BaseScriptComponent[]>(script.components);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const { fps = 30 } = useVideoConfig();

    // Calculate pixel scale based on zoom level
    const pixelsPerFrame = useMemo(() => 1 * zoomLevel, [zoomLevel]);
    const timelineWidth = useMemo(() => script.durationInFrames * pixelsPerFrame, [script.durationInFrames, pixelsPerFrame]);

    const handleZoom = useCallback((delta: number) => {
        setZoomLevel(prev => {
            const newZoom = prev * (1 + delta);
            return Math.min(Math.max(0.00001, newZoom), 10);
        });
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY * -0.001;
            handleZoom(delta);
        }
    }, [handleZoom]);

    useEffect(() => {
        const timeline = timelineRef.current;
        if (timeline) {
            timeline.addEventListener('wheel', handleWheel, { passive: false });
            return () => timeline.removeEventListener('wheel', handleWheel);
        }
    }, [handleWheel]);

    // Update components when script changes
    useEffect(() => {
        setComponents(script.components);
    }, [script.components]);

    const renderTimeline = () => {
        const markers = [];
        const totalSeconds = script.durationInFrames / FRAMES_PER_SECOND;
        
        // Dynamic marker interval based on zoom level
        let interval = 1; // seconds
        if (totalSeconds * zoomLevel > 300) interval = 60;
        else if (totalSeconds * zoomLevel > 120) interval = 30;
        else if (totalSeconds * zoomLevel > 60) interval = 15;
        else if (totalSeconds * zoomLevel > 30) interval = 5;
        else if (totalSeconds * zoomLevel > 10) interval = 1;
        else interval = 0.5;

        for (let i = 0; i <= totalSeconds; i += interval) {
            const position = i * FRAMES_PER_SECOND * pixelsPerFrame;
            markers.push(
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: `${position}px`,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        backgroundColor: i % (interval * 2) === 0 ? theme.colors.border : theme.colors.border + '40',
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        transform: 'translateX(-50%)',
                        fontSize: '10px',
                        color: theme.colors.text.secondary,
                        whiteSpace: 'nowrap',
                    }}>
                        {formatTime(i * FRAMES_PER_SECOND)}
                    </div>
                </div>
            );
        }
        return markers;
    };

    const handleDragStart = (id: string) => {
        setDraggingId(id);
    };

    const handleDragEnd = () => {
        setDraggingId(null);
        onReorder(components);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggingId || !timelineRef.current) return;

        const draggingComponent = components.find(c => c.id === draggingId);
        if (!draggingComponent) return;

        const timelineRect = timelineRef.current.getBoundingClientRect();
        const mousePosition = e.clientX - timelineRect.left;
        const timelineWidth = timelineRect.width;
        const newStartFrame = Math.round((mousePosition / timelineWidth) * script.durationInFrames);

        const updatedComponents = components.map(c => {
            if (c.id === draggingId) {
                return {
                    ...c,
                    startFrame: Math.max(0, newStartFrame)
                };
            }
            return c;
        });

        setComponents(updatedComponents);
    };

    const recalculateAudioDuration = async (component: ExtendedAudioComponent | ExtendedVoiceComponent) => {
        if (!component.audioUrl) return;
        
        try {
            const audio = new Audio(component.audioUrl);
            await new Promise((resolve) => {
                audio.addEventListener('loadedmetadata', () => {
                    const durationInFrames = Math.ceil(audio.duration * FRAMES_PER_SECOND);
                    resolve(durationInFrames);
                });
            });
        } catch (error) {
            console.error('Failed to recalculate audio duration:', error);
        }
    };

    const handleRecalculateAllDurations = useCallback(async () => {
        const audioComponents = script.components.filter(c => 
            c.type === 'audio' || c.type === 'voice'
        );

        for (const component of audioComponents) {
            if ('audioUrl' in component) {
                await recalculateAudioDuration(component as ExtendedAudioComponent | ExtendedVoiceComponent);
            }
        }
    }, [script.components]);

    const handleResizeStart = useCallback((e: React.MouseEvent, componentId: string) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        setComponents(prev => prev.map(c => {
            if (c.id === componentId) {
                return {
                    ...c,
                    startFrame: Math.max(0, c.startFrame || 0)
                };
            }
            return c;
        }));
    }, []);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!draggingId || !timelineRef.current) return;
        
        const timelineRect = timelineRef.current.getBoundingClientRect();
        const deltaX = e.clientX - timelineRect.left;
        const deltaFrames = Math.round((deltaX / script.durationInFrames) * FRAMES_PER_SECOND);
        const component = components.find(c => c.id === draggingId);
        
        if (component) {
            let newDuration = Math.max(1, (component.durationInFrames || 0) + deltaFrames);
            
            if ('wordTimings' in component) {
                const voiceComponent = component as VoiceComponent;
                if (voiceComponent.wordTimings && voiceComponent.wordTimings.length > 0) {
                    const lastWord = voiceComponent.wordTimings[voiceComponent.wordTimings.length - 1];
                    const minFrames = Math.ceil(lastWord.end * FRAMES_PER_SECOND);
                    newDuration = Math.max(newDuration, minFrames);
                }
            }

            const updatedComponents = components.map(c => {
                if (c.id === draggingId) {
                    return { ...c, durationInFrames: newDuration };
                }
                return c;
            });

            setComponents(updatedComponents);
        }
    }, [draggingId, components, script.durationInFrames, timelineRef]);

    const handleResizeEnd = useCallback(() => {
        setDraggingId(null);
    }, []);

    useEffect(() => {
        if (draggingId) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [draggingId, handleResizeMove, handleResizeEnd]);

    const renderComponent = (component: BaseScriptComponent) => {
        const startPosition = (component.startFrame || 0) * pixelsPerFrame;
        const width = (component.durationInFrames || 0) * pixelsPerFrame;

        return (
            <div
                key={component.id}
                style={{
                    position: 'absolute',
                    left: `${startPosition}px`,
                    width: `${width}px`,
                    height: `${TRACK_HEIGHT - 1}px`,
                    backgroundColor: selectedId === component.id ? theme.colors.primary : getComponentColor(component.type),
                    borderRadius: '4px',
                    padding: '4px',
                    color: 'white',
                    fontSize: '12px',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'move',
                    overflow: 'hidden',
                    transition: 'background-color 0.2s',
                }}
                onMouseDown={(e) => handleDragStart(component.id)}
                onClick={() => onSelect(component.id)}
            >
                <div style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                    flex: 1,
                }}>
                    {getComponentLabel(component)}
                </div>
                {width > 50 && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', opacity: 0.8 }}>
                        {formatTime(component.durationInFrames || 0)}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                right: '10px',
                top: '-30px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
            }}>
                <button
                    onClick={handleRecalculateAllDurations}
                    style={styles.actionButton}
                >
                    Recalculate Audio Durations
                </button>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    backgroundColor: theme.colors.background.secondary,
                    padding: '4px 8px',
                    borderRadius: '4px',
                }}>
                    <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
                        Zoom: {(zoomLevel * 100).toFixed(0)}%
                    </span>
                    <button
                        onClick={() => handleZoom(-0.2)}
                        style={styles.zoomButton}
                        title="Zoom Out"
                    >
                        -
                    </button>
                    <button
                        onClick={() => handleZoom(0.2)}
                        style={styles.zoomButton}
                        title="Zoom In"
                    >
                        +
                    </button>
                    <button
                        onClick={() => setZoomLevel(1)}
                        style={styles.zoomButton}
                        title="Reset Zoom"
                    >
                        Reset
                    </button>
                </div>
            </div>
            <div 
                ref={timelineRef}
                style={{
                    width: '100%',
                    height: `${TRACK_HEIGHT * NUM_TRACKS + TIMELINE_HEADER_HEIGHT + 20}px`,
                    overflowX: 'auto',
                    position: 'relative',
                    backgroundColor: theme.colors.background.primary,
                    padding: '10px',
                }}
            >
                <div style={{
                    position: 'relative',
                    width: `${timelineWidth}px`,
                    height: '100%',
                }}>
                    <div style={{
                        height: TIMELINE_HEADER_HEIGHT,
                        borderBottom: `1px solid ${theme.colors.border}`,
                        position: 'relative',
                        marginBottom: '10px',
                    }}>
                        {renderTimeline()}
                    </div>
                    {Array.from({ length: NUM_TRACKS }).map((_, index) => (
                        <div
                            key={index}
                            style={{
                                height: TRACK_HEIGHT,
                                borderBottom: `1px solid ${theme.colors.border}`,
                                position: 'relative',
                                backgroundColor: theme.colors.background.secondary,
                            }}
                        >
                            {components
                                .filter(c => (c.track || 0) === index)
                                .map(component => renderComponent(component))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const getComponentColor = (type: string): string => {
    switch (type) {
        case 'text': return '#4CAF50';
        case 'image': return '#2196F3';
        case 'voice': return '#FF9800';
        case 'audio': return '#9C27B0';
        default: return '#9E9E9E';
    }
};

const getComponentLabel = (component: BaseScriptComponent): string => {
    switch (component.type) {
        case 'text':
            return `Text: ${(component as TextComponent).text.substring(0, 20)}...`;
        case 'voice':
            return `Voice: ${(component as VoiceComponent).text.substring(0, 20)}...`;
        case 'audio':
            return 'Audio';
        default:
            return component.type;
    }
};

const styles = {
    zoomButton: {
        padding: '4px 8px',
        fontSize: '14px',
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '4px',
        color: theme.colors.text.primary,
        cursor: 'pointer',
        minWidth: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButton: {
        padding: '4px 8px',
        fontSize: '12px',
        backgroundColor: theme.colors.primary,
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
    }
} as const; 