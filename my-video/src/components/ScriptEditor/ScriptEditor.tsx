import React, { useState, useEffect } from 'react';
import { Script, Component, ComponentType } from '../../types/script';
import { Timeline } from './Timeline';
import { ComponentEditor } from './ComponentEditor';
import { Modal } from '../common/Modal';
import { TemplateManager } from '../TemplateManager/TemplateManager';
import { ComponentPalette } from './ComponentPalette';
import { ConfigMenu } from '../ConfigMenu/ConfigMenu';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { Player } from '@remotion/player';
import { ScriptVideo } from '../Video/ScriptVideo';

export const ScriptEditor: React.FC = () => {
    const [script, setScript] = useState<Script>(() => {
        const savedScript = localStorage.getItem('currentScript');
        if (savedScript) {
            try {
                const parsed = JSON.parse(savedScript);
                return parsed;
            } catch (e) {
                console.error('Failed to parse saved script:', e);
            }
        }

        return {
            id: Date.now().toString(),
            title: 'New Quiz',
            components: [],
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
                }
            },
        };
    });

    const [selectedComponentId, setSelectedComponentId] = useState<string>();
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);

    // Save script to localStorage whenever it changes
    useEffect(() => {
        if (script) {
            localStorage.setItem('currentScript', JSON.stringify(script));
        }
    }, [script]);

    const handleComponentChange = (updated: Component) => {
        setScript(prev => ({
            ...prev,
            components: prev.components.map(c => 
                c.id === updated.id ? updated : c
            ),
        }));
    };

    const handleComponentDelete = (id: string) => {
        setScript(prev => ({
            ...prev,
            components: prev.components.filter(c => c.id !== id),
        }));
        setSelectedComponentId(undefined);
    };

    const handleDragStart = (type: ComponentType) => {
        // This can be empty or add visual feedback
    };

    const handleReorder = (newComponents: Component[]) => {
        setScript(prev => ({
            ...prev,
            components: newComponents,
        }));
    };

    const selectedComponent = script.components.find(c => c.id === selectedComponentId);

    // Calculate total duration, minimum 30 frames (1 second)
    const totalDuration = Math.max(
        ...script.components.map(comp => {
            const start = comp.startFrame || 0;
            const duration = comp.durationInFrames || 150; // Default 5 seconds if not specified
            return start + duration;
        }),
        30 // Minimum 1 second
    );

    return (
        <div style={{
            backgroundColor: theme.colors.background.primary,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <header style={{
                backgroundColor: theme.colors.background.secondary,
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderBottom: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '48px',
            }}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>Video Editor</h1>
                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                    <button
                        onClick={() => setIsTemplateManagerOpen(true)}
                        style={{
                            ...commonStyles.button.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: theme.spacing.sm,
                        }}
                    >
                        📋 Templates
                    </button>
                    <button
                        onClick={() => setIsConfigOpen(true)}
                        style={{
                            ...commonStyles.button.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: theme.spacing.sm,
                        }}
                    >
                        ⚙️ Settings
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '4fr 1fr',
                gap: theme.spacing.sm,
                padding: theme.spacing.sm,
                flex: 1,
                height: 'calc(100vh - 48px)',
                overflow: 'hidden',
            }}>
                {/* Left Panel */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing.sm,
                    overflow: 'hidden',
                }}>
                    {/* Component Palette */}
                    <div style={{
                        ...commonStyles.card,
                        padding: theme.spacing.sm,
                    }}>
                        <ComponentPalette onDragStart={handleDragStart} />
                    </div>

                    {/* Timeline Container */}
                    <div style={{
                        ...commonStyles.card,
                        padding: theme.spacing.sm,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: theme.spacing.md,
                        overflow: 'visible',
                    }}>
                        {/* Main Timeline */}
                        <div>
                            <h3 style={{ 
                                color: theme.colors.text.primary, 
                                margin: 0,
                                marginBottom: theme.spacing.md,
                                fontSize: '16px',
                                fontWeight: 'bold',
                            }}>
                                Timeline
                            </h3>
                            <Timeline
                                script={script}
                                onReorder={handleReorder}
                                onSelect={setSelectedComponentId}
                                selectedId={selectedComponentId}
                                onDelete={handleComponentDelete}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.background.primary,
                    overflow: 'auto',
                }}>
                    {/* Preview */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '300px',
                        margin: '0 auto',
                        aspectRatio: '9/16',
                        backgroundColor: '#000',
                        borderRadius: theme.borderRadius.lg,
                        overflow: 'hidden',
                    }}>
                        <Player
                            component={ScriptVideo}
                            durationInFrames={totalDuration}
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
                                script
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Component Editor Modal */}
            <Modal
                isOpen={!!selectedComponentId}
                onClose={() => setSelectedComponentId(undefined)}
                title={selectedComponent && (
                    <h2 style={{
                        ...commonStyles.heading,
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                        color: theme.colors.text.primary,
                        fontSize: '20px',
                    }}>
                        <span style={{ fontSize: '1.2em' }}>
                            {selectedComponent.type === 'title' && '📑'}
                            {selectedComponent.type === 'text' && '📝'}
                            {selectedComponent.type === 'comparison' && '⚖️'}
                            {selectedComponent.type === 'countdown' && '⏲️'}
                            {selectedComponent.type === 'transition' && '🔄'}
                        </span>
                        Edit {selectedComponent.type.charAt(0).toUpperCase() + selectedComponent.type.slice(1)}
                    </h2>
                )}
            >
                {selectedComponent && (
                    <ComponentEditor
                        component={selectedComponent}
                        onChange={handleComponentChange}
                        onDelete={() => handleComponentDelete(selectedComponent.id)}
                    />
                )}
            </Modal>

            <ConfigMenu 
                isOpen={isConfigOpen} 
                onClose={() => setIsConfigOpen(false)} 
                script={script}
                onScriptChange={setScript}
            />

            {/* Template Manager Modal */}
            <Modal
                isOpen={isTemplateManagerOpen}
                onClose={() => setIsTemplateManagerOpen(false)}
                title="Template Manager"
            >
                <TemplateManager
                    currentScript={script}
                    onTemplateSelect={(newScript) => {
                        setScript(newScript);
                        setIsTemplateManagerOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
}; 