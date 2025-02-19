import React, { useEffect, useState, useRef } from 'react';
import { 
    Component,
    TextComponent,
    ComparisonComponent,
    TitleComponent,
    CountdownComponent,
    TransitionComponent,
    AnimationOptions,
    ComponentType,
    CaptionStyleOptions,
    BaseScriptComponent,
    CaptionComponent,
} from '../../types/script';
import { theme } from '../../styles/theme';

interface ComponentLoggerProps {
    components: Component[];
}

interface LogEntry {
    timestamp: string;
    componentId: string;
    componentType: string;
    details: any;
    level: 'info' | 'warning' | 'error';
    action?: 'create' | 'update' | 'delete';
    changes?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
}

interface FilterOption {
    type: string;
    action?: 'create' | 'update' | 'delete';
    enabled: boolean;
}

interface AnimationDebugInfo {
    hasAnimation: boolean;
    animationType: string;
    entrance?: {
        type: string;
        duration?: number;
        delay?: number;
        feel?: 'bouncy' | 'smooth' | 'snappy' | 'gentle';
    };
    exit?: {
        type: string;
        duration?: number;
        delay?: number;
        feel?: 'bouncy' | 'smooth' | 'snappy' | 'gentle';
    };
}

const styles = {
    container: {
        position: 'fixed' as const,
        bottom: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '500px',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        overflow: 'hidden',
    },
    header: {
        padding: '12px 16px',
        backgroundColor: theme.colors.background.tertiary,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        margin: 0,
        fontSize: '14px',
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    logContainer: {
        maxHeight: '400px',
        overflowY: 'auto' as const,
        padding: '8px',
    },
    logEntry: {
        padding: '8px 12px',
        marginBottom: '8px',
        borderRadius: theme.borderRadius.md,
        fontSize: '12px',
        fontFamily: 'monospace',
        backgroundColor: theme.colors.background.tertiary,
        border: `1px solid ${theme.colors.border}`,
    },
    logHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '4px',
        color: theme.colors.text.secondary,
    },
    logDetails: {
        color: theme.colors.text.primary,
    },
    componentType: {
        display: 'inline-block',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold',
        marginLeft: '8px',
    },
    controls: {
        display: 'flex',
        gap: '8px',
    },
    button: {
        padding: '4px 8px',
        borderRadius: theme.borderRadius.sm,
        border: 'none',
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
        cursor: 'pointer',
        fontSize: '12px',
        '&:hover': {
            backgroundColor: theme.colors.background.tertiary,
        },
    },
    clearButton: {
        backgroundColor: theme.colors.accent.red,
        color: 'white',
        '&:hover': {
            backgroundColor: theme.colors.accent.orange,
        },
    },
    filterContainer: {
        padding: '12px',
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background.tertiary,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    },
    filterGroup: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '8px',
    },
    filterOption: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.background.primary,
        border: `1px solid ${theme.colors.border}`,
        cursor: 'pointer',
        fontSize: '12px',
        userSelect: 'none' as const,
    },
    filterOptionSelected: {
        backgroundColor: theme.colors.accent.blue,
        color: 'white',
        border: `1px solid ${theme.colors.accent.blue}`,
    },
    filterSection: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
    },
    filterLabel: {
        fontSize: '11px',
        fontWeight: 'bold',
        color: theme.colors.text.secondary,
        textTransform: 'uppercase' as const,
    },
    expandFilters: {
        padding: '4px 8px',
        borderRadius: theme.borderRadius.sm,
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: 'transparent',
        color: theme.colors.text.primary,
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    copyButton: {
        padding: '4px 8px',
        borderRadius: theme.borderRadius.sm,
        border: 'none',
        backgroundColor: theme.colors.accent.blue,
        color: 'white',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        '&:hover': {
            backgroundColor: theme.colors.accent.purple,
        },
    },
};

const getComponentDetails = (component: Component) => {
    const baseDetails = {
        id: component.id,
        startFrame: component.startFrame,
        durationInFrames: component.durationInFrames,
    };

    switch (component.type) {
        case 'text': {
            const textComp = component as TextComponent;
            return {
                ...baseDetails,
                text: textComp.text,
                style: {
                    fontSize: textComp.style?.fontSize,
                    fontFamily: textComp.style?.fontFamily,
                    color: textComp.style?.color,
                    letterSpacing: textComp.style?.letterSpacing,
                    textStroke: textComp.style?.textStroke,
                    position: textComp.style?.position,
                    animation: textComp.style?.animation ? {
                        ...textComp.style.animation,
                        _debugInfo: {
                            hasAnimation: !!textComp.style.animation,
                            animationType: textComp.style.animation.type,
                            entrance: textComp.style.animation.entrance,
                            exit: textComp.style.animation.exit,
                        } as AnimationDebugInfo
                    } : undefined
                }
            };
        }
        case 'comparison': {
            const compComp = component as ComparisonComponent;
            return {
                ...baseDetails,
                question: compComp.question,
                orientation: compComp.orientation,
                leftOption: compComp.leftOption,
                rightOption: compComp.rightOption,
                style: compComp.style,
            };
        }
        case 'title': {
            const titleComp = component as TitleComponent;
            return {
                ...baseDetails,
                text: titleComp.text,
                subtitle: titleComp.subtitle,
                style: titleComp.style,
                background: titleComp.background,
            };
        }
        case 'countdown': {
            const countdownComp = component as CountdownComponent;
            return {
                ...baseDetails,
                from: countdownComp.from,
                style: countdownComp.style,
                sound: countdownComp.sound,
            };
        }
        case 'transition': {
            const transitionComp = component as TransitionComponent;
            return {
                ...baseDetails,
                transitionType: transitionComp.transitionType,
                direction: transitionComp.direction,
            };
        }
        case 'caption': {
            const captionComp = component as CaptionComponent;
            return {
                ...baseDetails,
                text: captionComp.text,
                style: {
                    ...captionComp.style,
                    _debugInfo: {
                        hasWordWindow: !!captionComp.style?.wordWindow,
                        wordWindowSize: captionComp.style?.wordWindow || 0,
                        currentWordIndex: captionComp.currentWordIndex,
                        totalWords: captionComp.text?.split(' ').length || 0,
                        visibleWords: captionComp.visibleWords,
                        textStyle: captionComp.style?.textStyle,
                        hasTextStroke: captionComp.style?.textStyle === 'bordered',
                        hasShadow: !!captionComp.style?.textShadow,
                        position: captionComp.style?.position,
                        timing: {
                            currentTime: captionComp._debugTiming?.currentTime,
                            wordStartTimes: captionComp._debugTiming?.wordStartTimes,
                            wordEndTimes: captionComp._debugTiming?.wordEndTimes,
                        }
                    }
                }
            };
        }
        default:
            return baseDetails;
    }
};

const getComponentChanges = (oldComponent: any, newComponent: any, path = ''): { field: string; oldValue: any; newValue: any; }[] => {
    const changes: { field: string; oldValue: any; newValue: any; }[] = [];

    if (typeof oldComponent !== 'object' || typeof newComponent !== 'object') {
        if (oldComponent !== newComponent) {
            changes.push({
                field: path,
                oldValue: oldComponent,
                newValue: newComponent
            });
        }
        return changes;
    }

    const allKeys = new Set([...Object.keys(oldComponent || {}), ...Object.keys(newComponent || {})]);

    for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const oldValue = oldComponent?.[key];
        const newValue = newComponent?.[key];

        if (typeof oldValue === 'object' && typeof newValue === 'object') {
            changes.push(...getComponentChanges(oldValue, newValue, currentPath));
        } else if (oldValue !== newValue) {
            changes.push({
                field: currentPath,
                oldValue,
                newValue
            });
        }
    }

    return changes;
};

export const ComponentLogger: React.FC<ComponentLoggerProps> = ({ components }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [typeFilters, setTypeFilters] = useState<FilterOption[]>([
        { type: 'all', enabled: true },
        { type: 'animation', enabled: false },
        { type: 'text', enabled: false },
        { type: 'image', enabled: false },
        { type: 'video', enabled: false },
        { type: 'audio', enabled: false },
        { type: 'comparison', enabled: false },
        { type: 'title', enabled: false },
        { type: 'countdown', enabled: false },
        { type: 'voice', enabled: false },
        { type: 'transition', enabled: false },
        { type: 'timer', enabled: false },
        { type: 'quiz', enabled: false },
        { type: 'setup', enabled: false },
        { type: 'caption', enabled: false },
    ]);
    const [actionFilters, setActionFilters] = useState<FilterOption[]>([
        { type: 'all', enabled: true },
        { type: 'create', action: 'create', enabled: false },
        { type: 'update', action: 'update', enabled: false },
        { type: 'delete', action: 'delete', enabled: false },
    ]);
    const prevComponentsRef = useRef<Component[]>([]);

    useEffect(() => {
        console.log('ComponentLogger received components:', components);
        const prevComponents = prevComponentsRef.current;
        const currentComponents = components;

        // Track component updates
        const updateLogs: LogEntry[] = [];

        // Check for updates to existing components
        currentComponents.forEach(component => {
            console.log('Processing component:', component);
            const prevComponent = prevComponents.find(p => p.id === component.id);
            if (prevComponent) {
                console.log('Found previous version of component:', prevComponent);
                const changes = getComponentChanges(
                    getComponentDetails(prevComponent),
                    getComponentDetails(component)
                );
                console.log('Detected changes:', changes);
                
                if (changes.length > 0) {
                    updateLogs.push({
                        timestamp: new Date().toISOString(),
                        componentId: component.id,
                        componentType: component.type,
                        details: getComponentDetails(component),
                        level: 'info',
                        action: 'update',
                        changes
                    });
                }
            } else {
                // New component
                console.log('New component detected:', component);
                updateLogs.push({
                    timestamp: new Date().toISOString(),
                    componentId: component.id,
                    componentType: component.type,
                    details: getComponentDetails(component),
                    level: 'info',
                    action: 'create'
                });
            }
        });

        if (updateLogs.length > 0) {
            console.log('Adding new logs:', updateLogs);
            setLogs(prevLogs => {
                const newLogs = [...prevLogs, ...updateLogs];
                console.log('Updated logs state:', newLogs);
                return newLogs;
            });
        }

        prevComponentsRef.current = currentComponents;
    }, [components]);

    const clearLogs = () => {
        setLogs([]);
    };

    const toggleFilter = (index: number, filterType: 'type' | 'action') => {
        if (filterType === 'type') {
            setTypeFilters(prev => {
                const newFilters = [...prev];
                if (index === 0) {
                    const newValue = !newFilters[0].enabled;
                    return newFilters.map(f => ({ ...f, enabled: newValue }));
                } else {
                    newFilters[index].enabled = !newFilters[index].enabled;
                    newFilters[0].enabled = newFilters.slice(1).every(f => !f.enabled);
                }
                return newFilters;
            });
        } else {
            setActionFilters(prev => {
                const newFilters = [...prev];
                if (index === 0) {
                    const newValue = !newFilters[0].enabled;
                    return newFilters.map(f => ({ ...f, enabled: newValue }));
                } else {
                    newFilters[index].enabled = !newFilters[index].enabled;
                    newFilters[0].enabled = newFilters.slice(1).every(f => !f.enabled);
                }
                return newFilters;
            });
        }
    };

    const filteredLogs = logs.filter(log => {
        const enabledTypeFilters = typeFilters.filter(f => f.enabled);
        const enabledActionFilters = actionFilters.filter(f => f.enabled);

        if (enabledTypeFilters.some(f => f.type === 'animation')) {
            const hasAnimationChanges = log.changes?.some(change => 
                change.field.includes('animation') || 
                change.field.includes('style.animation')
            );
            if (!hasAnimationChanges) return false;
        }

        const typeMatch = enabledTypeFilters[0]?.type === 'all' || 
            enabledTypeFilters.some(f => f.type === log.componentType);
        
        const actionMatch = enabledActionFilters[0]?.type === 'all' ||
            enabledActionFilters.some(f => f.action === log.action);

        return typeMatch && actionMatch;
    });

    const getLogEntryStyle = (log: LogEntry) => {
        const baseStyle = styles.logEntry;
        
        const hasAnimationChanges = log.changes?.some(change => 
            change.field.includes('animation') || 
            change.field.includes('style.animation')
        );

        if (hasAnimationChanges) {
            return {
                ...baseStyle,
                borderLeft: '4px solid #9C27B0',
                backgroundColor: 'rgba(156, 39, 176, 0.1)'
            };
        }

        if (log.action === 'create') {
            return {
                ...baseStyle,
                borderLeft: '4px solid #4CAF50'
            };
        }
        if (log.action === 'update') {
            return {
                ...baseStyle,
                borderLeft: '4px solid #2196F3'
            };
        }
        if (log.action === 'delete') {
            return {
                ...baseStyle,
                borderLeft: '4px solid #F44336'
            };
        }
        return baseStyle;
    };

    const copyLogs = () => {
        const formattedLogs = filteredLogs.map(log => {
            const timestamp = new Date(log.timestamp).toLocaleTimeString();
            const header = `[${timestamp}] ${log.componentType.toUpperCase()} (${log.componentId.slice(0, 8)}) - ${log.action?.toUpperCase() || 'INFO'}`;
            
            let content = '';
            if (log.changes) {
                content = log.changes.map(change => 
                    `${change.field}:\n  - ${JSON.stringify(change.oldValue)}\n  + ${JSON.stringify(change.newValue)}`
                ).join('\n');
                content += '\n\nFinal State:\n' + JSON.stringify(log.details, null, 2);
            } else {
                content = JSON.stringify(log.details, null, 2);
            }

            return `${header}\n${content}\n${'-'.repeat(80)}`;
        }).join('\n\n');

        navigator.clipboard.writeText(formattedLogs).then(() => {
            // Visual feedback that copy was successful
            const copyButton = document.getElementById('copy-logs-button');
            if (copyButton) {
                const originalText = copyButton.innerText;
                copyButton.innerText = '✓ Copied!';
                setTimeout(() => {
                    copyButton.innerText = originalText;
                }, 2000);
            }
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>
                    <span>🔍 Component Logger</span>
                    <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
                        ({filteredLogs.length}/{logs.length} entries)
                    </span>
                </h3>
                <div style={styles.controls}>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        style={styles.expandFilters}
                    >
                        {showFilters ? '🔍 Hide Filters' : '🔍 Show Filters'}
                    </button>
                    <button
                        id="copy-logs-button"
                        onClick={copyLogs}
                        style={styles.copyButton}
                        title="Copy filtered logs to clipboard"
                    >
                        📋 Copy Logs
                    </button>
                    <button 
                        onClick={() => setIsMinimized(!isMinimized)}
                        style={styles.button}
                    >
                        {isMinimized ? '🔼' : '🔽'}
                    </button>
                    <button 
                        onClick={clearLogs}
                        style={{ ...styles.button, ...styles.clearButton }}
                    >
                        Clear
                    </button>
                </div>
            </div>
            {showFilters && (
                <div style={styles.filterContainer}>
                    <div style={styles.filterSection}>
                        <span style={styles.filterLabel}>Component Types</span>
                        <div style={styles.filterGroup}>
                            {typeFilters.map((filter, index) => (
                                <div
                                    key={filter.type}
                                    style={{
                                        ...styles.filterOption,
                                        ...(filter.enabled ? styles.filterOptionSelected : {}),
                                    }}
                                    onClick={() => toggleFilter(index, 'type')}
                                >
                                    {filter.type}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={styles.filterSection}>
                        <span style={styles.filterLabel}>Actions</span>
                        <div style={styles.filterGroup}>
                            {actionFilters.map((filter, index) => (
                                <div
                                    key={filter.type}
                                    style={{
                                        ...styles.filterOption,
                                        ...(filter.enabled ? styles.filterOptionSelected : {}),
                                        backgroundColor: filter.enabled 
                                            ? (filter.action === 'create' ? '#4CAF50' :
                                               filter.action === 'update' ? '#2196F3' :
                                               filter.action === 'delete' ? '#F44336' :
                                               theme.colors.accent.blue)
                                            : theme.colors.background.primary,
                                    }}
                                    onClick={() => toggleFilter(index, 'action')}
                                >
                                    {filter.type}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {!isMinimized && (
                <div style={styles.logContainer}>
                    {filteredLogs.map((log, index) => (
                        <div key={index} style={getLogEntryStyle(log)}>
                            <div style={styles.logHeader}>
                                <span>
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                    <span 
                                        style={{
                                            ...styles.componentType,
                                            backgroundColor: getComponentTypeColor(log.componentType as ComponentType),
                                            color: 'white',
                                        }}
                                    >
                                        {log.componentType}
                                    </span>
                                    {log.action && (
                                        <span style={{
                                            marginLeft: '8px',
                                            fontSize: '11px',
                                            color: log.action === 'create' ? '#4CAF50' :
                                                  log.action === 'update' ? '#2196F3' :
                                                  '#F44336'
                                        }}>
                                            {log.action.toUpperCase()}
                                        </span>
                                    )}
                                </span>
                                <span>ID: {log.componentId.slice(0, 8)}</span>
                            </div>
                            <pre style={styles.logDetails}>
                                {log.changes ? (
                                    <>
                                        {log.changes.map((change, i) => (
                                            <div key={i} style={{ marginBottom: '4px' }}>
                                                <span style={{ color: '#9E9E9E' }}>{change.field}:</span>
                                                <span style={{ color: '#F44336' }}> - {JSON.stringify(change.oldValue)}</span>
                                                <span style={{ color: '#4CAF50' }}> + {JSON.stringify(change.newValue)}</span>
                                            </div>
                                        ))}
                                        <div style={{ marginTop: '8px', borderTop: '1px solid #444', paddingTop: '8px' }}>
                                            {JSON.stringify(log.details, null, 2)}
                                        </div>
                                    </>
                                ) : (
                                    JSON.stringify(log.details, null, 2)
                                )}
                            </pre>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const getComponentTypeColor = (type: ComponentType): string => {
    const colors = {
        text: '#4CAF50',
        image: '#2196F3',
        video: '#9C27B0',
        audio: '#FF9800',
        comparison: '#E91E63',
        title: '#3F51B5',
        countdown: '#009688',
        voice: '#FF5722',
        transition: '#795548',
        timer: '#00BCD4',
        quiz: '#8BC34A',
        setup: '#FFC107',
        caption: '#673AB7',
        default: '#607D8B',
    };
    return colors[type as keyof typeof colors] || colors.default;
}; 
