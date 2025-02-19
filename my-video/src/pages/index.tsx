import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { AppLayout } from '../components/Layout/AppLayout';
import { ComponentPalette } from '../components/ScriptEditor/ComponentPalette';
import { Script, ComponentType } from '../types/script';
import { ScriptVideo } from '../components/Video/ScriptVideo';
import { theme } from '../styles/theme';

export default function Home() {
    const [script, setScript] = useState<Script>({
        id: Date.now().toString(),
        title: 'New Quiz',
        components: [],
        captionTracks: [],
        settings: {
            defaultTextStyle: {
                fontSize: 40,
                color: 'white',
                fontFamily: 'Arial',
                textAlign: 'center',
            },
            defaultCaptionStyle: {
                fontSize: 24,
                color: 'white',
                fontFamily: 'Arial',
                textAlign: 'center',
            },
            background: {
                type: 'none',
            },
        },
    });

    const handleDragStart = (type: ComponentType) => {
        // Handle component drag start
        console.log('Dragging component:', type);
    };

    return (
        <AppLayout>
            {/* Left Sidebar Content */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.lg,
            }}>
                <ComponentPalette onDragStart={handleDragStart} />
            </div>

            {/* Center Content */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.lg,
            }}>
                {/* Preview */}
                <div style={{
                    flex: 1,
                    position: 'relative',
                    backgroundColor: theme.colors.background.tertiary,
                    borderRadius: theme.borderRadius.lg,
                    overflow: 'hidden',
                    padding: theme.spacing.lg,
                }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#000',
                        borderRadius: theme.borderRadius.md,
                        overflow: 'hidden',
                    }}>
                        <Player
                            component={ScriptVideo}
                            durationInFrames={300}
                            fps={30}
                            compositionWidth={1080}
                            compositionHeight={1920}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            controls
                            autoPlay
                            loop
                            inputProps={{
                                script,
                            }}
                        />
                    </div>
                </div>

                {/* Timeline */}
                <div style={{
                    height: '200px',
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    border: `1px solid ${theme.colors.border}`,
                }}>
                    <h2 style={{
                        color: theme.colors.text.primary,
                        marginBottom: theme.spacing.md,
                        fontSize: '18px',
                    }}>Timeline</h2>
                    {/* Timeline content will go here */}
                </div>
            </div>

            {/* Right Sidebar Content */}
            <div style={{
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                border: `1px solid ${theme.colors.border}`,
            }}>
                <h2 style={{
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.md,
                    fontSize: '18px',
                }}>Properties</h2>
                {/* Properties panel content will go here */}
            </div>
        </AppLayout>
    );
} 