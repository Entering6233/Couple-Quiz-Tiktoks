import React from 'react';
import { Component } from '../../types/script';
import { TextComponentEditor } from './TextComponentEditor';
import { ComparisonComponentEditor } from './ComparisonComponentEditor';
import { VoiceComponentEditor } from './VoiceComponentEditor';
import { VideoComponentEditor } from './VideoComponentEditor';
import { AudioComponentEditor } from './AudioComponentEditor';

interface ComponentEditorProps {
    component: Component;
    onChange: (component: Component) => void;
}

const componentEditors: Record<string, React.ComponentType<any>> = {
    text: TextComponentEditor,
    comparison: ComparisonComponentEditor,
    voice: VoiceComponentEditor,
    video: VideoComponentEditor,
    audio: AudioComponentEditor,
};

export const ComponentEditor: React.FC<ComponentEditorProps> = ({ component, onChange }) => {
    const EditorComponent = componentEditors[component.type];

    if (!EditorComponent) {
        return <div>No editor available for component type: {component.type}</div>;
    }

    return <EditorComponent component={component} onChange={onChange} />;
}; 