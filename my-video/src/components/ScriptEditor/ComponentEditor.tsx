import React from 'react';
import { Component, TextComponent, TitleComponent, CountdownComponent, VoiceComponent } from '../../types/script';
import { TextComponentEditor } from './TextComponentEditor';
import { TitleComponentEditor } from './TitleComponentEditor';
import { ComparisonComponentEditor } from './ComparisonComponentEditor';
import { CountdownComponentEditor } from './CountdownComponentEditor';
import { VoiceComponentEditor } from './VoiceComponentEditor';
import { VideoComponentEditor } from './VideoComponentEditor';
import { AudioComponentEditor } from './AudioComponentEditor';
import { ImageComponentEditor } from './ImageComponentEditor';

interface ComponentEditorProps {
    component: Component;
    onChange: (updated: Component) => void;
    onDelete: () => void;
}

// Improved type guards
const isTextComponent = (component: Component): component is TextComponent => {
    return component.type === 'text';
};

const isTitleComponent = (component: Component): component is TitleComponent => {
    return component.type === 'title';
};

const isCountdownComponent = (component: Component): component is CountdownComponent => {
    return component.type === 'countdown';
};

const isVoiceComponent = (component: Component): component is VoiceComponent => {
    return component.type === 'voice';
};

export const ComponentEditor: React.FC<ComponentEditorProps> = ({
    component,
    onChange,
    onDelete,
}) => {
    switch (component.type) {
        case 'text':
            return <TextComponentEditor 
                component={component as TextComponent} 
                onChange={onChange} 
            />;
        case 'title':
            return <TitleComponentEditor 
                component={component as TitleComponent} 
                onChange={onChange} 
            />;
        case 'comparison':
            return <ComparisonComponentEditor 
                component={component} 
                onChange={onChange} 
            />;
        case 'countdown':
            return <CountdownComponentEditor 
                component={component as CountdownComponent} 
                onChange={onChange} 
            />;
        case 'voice':
            return <VoiceComponentEditor 
                component={component as VoiceComponent} 
                onChange={onChange}
                onDelete={onDelete}
            />;
        case 'video':
            return <VideoComponentEditor 
                component={component} 
                onChange={onChange} 
            />;
        case 'audio':
            return <AudioComponentEditor 
                component={component} 
                onChange={onChange} 
                onDelete={onDelete}
            />;
        case 'image':
            return <ImageComponentEditor 
                component={component} 
                onChange={onChange} 
            />;
        default:
            return <div>Unknown component type: {component.type}</div>;
    }
}; 