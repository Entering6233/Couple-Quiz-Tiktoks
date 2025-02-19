import React, { useState, useRef, useEffect } from 'react';
import { CaptionTrack, Script, VoiceComponent, WordTiming } from '../../types/script';
import { theme } from '../../styles/theme';
import { Modal } from '../common/Modal';
import { CaptionEditor } from './CaptionEditor';

interface CaptionTimelineProps {
    script: Script;
    onScriptChange: (script: Script) => void;
}

const TRACK_HEIGHT = 40;
const PIXELS_PER_SECOND = 100;
const FRAMES_PER_SECOND = 30;

export const CaptionTimeline: React.FC<CaptionTimelineProps> = ({
    script,
    onScriptChange,
}) => {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [editingCaption, setEditingCaption] = useState<string | null>(null);
    const [editingWordTimings, setEditingWordTimings] = useState<{id: string, isTrack: boolean} | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate timeline width based on all components and caption tracks
    const timelineWidth = Math.max(
        ...script.components
            .filter(c => c.type === 'voice')
            .map(c => {
                const start = c.startFrame || 0;
                const duration = c.durationInFrames || 150;
                return (start + duration) / FRAMES_PER_SECOND * PIXELS_PER_SECOND;
            }),
        ...(script.captionTracks || []).map(track => {
            const start = track.startFrame;
            const lastWord = track.wordTimings[track.wordTimings.length - 1];
            const duration = lastWord ? (lastWord.end * FRAMES_PER_SECOND) : 150;
            return (start + duration) / FRAMES_PER_SECOND * PIXELS_PER_SECOND;
        }),
        PIXELS_PER_SECOND * 10 // Minimum width of 10 seconds
    );

    const handleUnlink = (componentId: string) => {
        // Find the voice component
        const component = script.components.find(
            c => c.id === componentId && c.type === 'voice'
        ) as VoiceComponent | undefined;

        if (!component?.wordTimings) return;

        // Create a new caption track
        const newTrack: CaptionTrack = {
            id: `caption_${Date.now()}`,
            originalComponentId: componentId,
            isLinked: false,
            wordTimings: component.wordTimings,
            startFrame: component.startFrame || 0,
            text: component.text,
        };

        // Add to caption tracks
        onScriptChange({
            ...script,
            captionTracks: [...(script.captionTracks || []), newTrack],
        });
    };

    const handleRelink = (trackId: string) => {
        const track = script.captionTracks?.find(t => t.id === trackId);
        if (!track?.originalComponentId) return;

        // Update the original component with the track's timings
        const updatedComponents = script.components.map(comp => {
            if (comp.id === track.originalComponentId && comp.type === 'voice') {
                return {
                    ...comp,
                    wordTimings: track.wordTimings,
                    startFrame: track.startFrame,
                };
            }
            return comp;
        });

        // Remove this track from caption tracks
        onScriptChange({
            ...script,
            components: updatedComponents,
            captionTracks: script.captionTracks?.filter(t => t.id !== trackId) || [],
        });
    };

    const handleDragStart = (e: React.DragEvent, track: CaptionTrack) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        setDragOffset(Math.round((offsetX / PIXELS_PER_SECOND) * FRAMES_PER_SECOND));
        setDraggingId(track.id);
    };

    const handleDrag = (e: React.DragEvent) => {
        if (!draggingId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newStartFrame = Math.max(0, Math.round((x / PIXELS_PER_SECOND) * FRAMES_PER_SECOND) - dragOffset);

        const updatedTracks = script.captionTracks?.map(track => 
            track.id === draggingId ? { ...track, startFrame: newStartFrame } : track
        );

        onScriptChange({
            ...script,
            captionTracks: updatedTracks || [],
        });
    };

    const handleEditText = (trackId: string, newText: string) => {
        const updatedTracks = script.captionTracks?.map(track => 
            track.id === trackId ? { ...track, text: newText } : track
        );

        onScriptChange({
            ...script,
            captionTracks: updatedTracks || [],
        });
    };

    const handleWordTimingsChange = (id: string, isTrack: boolean, newTimings: WordTiming[]) => {
        if (isTrack) {
            // Update caption track
            const updatedTracks = script.captionTracks?.map(track => 
                track.id === id ? { ...track, wordTimings: newTimings } : track
            );
            onScriptChange({
                ...script,
                captionTracks: updatedTracks || [],
            });
        } else {
            // Update voice component
            const updatedComponents = script.components.map(comp => 
                comp.id === id && comp.type === 'voice'
                    ? { ...comp, wordTimings: newTimings }
                    : comp
            );
            onScriptChange({
                ...script,
                components: updatedComponents,
            });
        }
    };

    return (
        <>
            <div style={{
                backgroundColor: theme.colors.background.secondary,
                padding: theme.spacing.lg,
                borderRadius: theme.borderRadius.md,
                marginTop: theme.spacing.xl,
                borderTop: `2px solid ${theme.colors.border}`,
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: theme.spacing.lg,
                }}>
                    <h3 style={{ 
                        color: theme.colors.text.primary, 
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 'bold',
                    }}>
                        Captions Timeline
                    </h3>
                </div>

                <div 
                    ref={containerRef}
                    style={{
                        backgroundColor: theme.colors.background.tertiary,
                        borderRadius: theme.borderRadius.sm,
                        padding: theme.spacing.sm,
                    }}
                >
                    <div style={{
                        width: `${timelineWidth}px`,
                        position: 'relative',
                    }}>
                        {/* Time markers */}
                        <div style={{
                            height: '30px',
                            borderBottom: `1px solid ${theme.colors.border}`,
                            position: 'relative',
                            marginBottom: theme.spacing.sm,
                        }}>
                            {Array.from({ length: Math.ceil(timelineWidth / PIXELS_PER_SECOND) }).map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        left: `${i * PIXELS_PER_SECOND}px`,
                                        width: '1px',
                                        height: '15px',
                                        backgroundColor: theme.colors.border,
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        left: '2px',
                                        fontSize: '12px',
                                        color: theme.colors.text.secondary,
                                        fontFamily: 'monospace',
                                    }}>
                                        {i}s
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Empty tracks */}
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={`empty-track-${index}`}
                                style={{
                                    height: TRACK_HEIGHT,
                                    borderBottom: `1px solid ${theme.colors.border}`,
                                    position: 'relative',
                                    backgroundColor: index % 2 === 0 ? theme.colors.background.secondary : 'transparent',
                                    marginBottom: theme.spacing.sm,
                                }}
                            />
                        ))}

                        {/* Voice components with captions */}
                        {script.components
                            .filter(c => c.type === 'voice' && (c as VoiceComponent).wordTimings)
                            .map((component) => {
                                const voiceComponent = component as VoiceComponent;
                                const isUnlinked = script.captionTracks?.some(
                                    t => t.originalComponentId === component.id
                                );

                                return (
                                    <div
                                        key={component.id}
                                        style={{
                                            height: TRACK_HEIGHT,
                                            borderBottom: `1px solid ${theme.colors.border}`,
                                            position: 'relative',
                                            backgroundColor: theme.colors.background.secondary,
                                            marginBottom: theme.spacing.sm,
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            left: `${((component.startFrame || 0) / FRAMES_PER_SECOND) * PIXELS_PER_SECOND}px`,
                                            height: TRACK_HEIGHT,
                                            backgroundColor: isUnlinked ? theme.colors.background.tertiary : theme.colors.primary,
                                            padding: '0 8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            borderRadius: theme.borderRadius.sm,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            minWidth: '100px',
                                        }}>
                                            <span style={{ marginRight: '8px' }}>
                                                {voiceComponent.text.substring(0, 30)}...
                                            </span>
                                            {!isUnlinked && (
                                                <button
                                                    onClick={() => handleUnlink(component.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: theme.colors.secondary,
                                                        border: 'none',
                                                        borderRadius: theme.borderRadius.sm,
                                                        cursor: 'pointer',
                                                        color: 'white',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    Unlink
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                        {/* Caption tracks */}
                        {script.captionTracks?.map((track, index) => (
                            <div
                                key={track.id}
                                style={{
                                    height: TRACK_HEIGHT,
                                    borderBottom: `1px solid ${theme.colors.border}`,
                                    position: 'relative',
                                    backgroundColor: index % 2 === 0 ? theme.colors.background.secondary : 'transparent',
                                    marginBottom: theme.spacing.sm,
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDraggingId(null);
                                }}
                            >
                                <div
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, track)}
                                    onDrag={handleDrag}
                                    onDragEnd={() => setDraggingId(null)}
                                    style={{
                                        position: 'absolute',
                                        left: `${(track.startFrame / FRAMES_PER_SECOND) * PIXELS_PER_SECOND}px`,
                                        height: TRACK_HEIGHT,
                                        backgroundColor: theme.colors.secondary,
                                        padding: '0 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderRadius: theme.borderRadius.sm,
                                        cursor: 'grab',
                                    }}
                                >
                                    {editingCaption === track.id ? (
                                        <input
                                            value={track.text}
                                            onChange={(e) => handleEditText(track.id, e.target.value)}
                                            onBlur={() => setEditingCaption(null)}
                                            autoFocus
                                            style={{
                                                width: '200px',
                                                padding: '4px',
                                                border: 'none',
                                                borderRadius: theme.borderRadius.sm,
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <span
                                                onClick={() => setEditingCaption(track.id)}
                                                style={{ marginRight: '8px', cursor: 'text' }}
                                            >
                                                {track.text.substring(0, 20)}...
                                            </span>
                                            <button
                                                onClick={() => handleRelink(track.id)}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: theme.colors.primary,
                                                    border: 'none',
                                                    borderRadius: theme.borderRadius.sm,
                                                    cursor: 'pointer',
                                                    color: 'white',
                                                }}
                                            >
                                                Relink
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Caption Editor Modal */}
            {editingWordTimings && (
                <Modal
                    isOpen={true}
                    onClose={() => setEditingWordTimings(null)}
                    title="Edit Captions"
                >
                    <CaptionEditor
                        wordTimings={
                            editingWordTimings.isTrack
                                ? script.captionTracks?.find(t => t.id === editingWordTimings.id)?.wordTimings || []
                                : (script.components.find(c => c.id === editingWordTimings.id) as VoiceComponent)?.wordTimings || []
                        }
                        onWordTimingsChange={(newTimings) => 
                            handleWordTimingsChange(editingWordTimings.id, editingWordTimings.isTrack, newTimings)
                        }
                        onClose={() => setEditingWordTimings(null)}
                    />
                </Modal>
            )}
        </>
    );
}; 