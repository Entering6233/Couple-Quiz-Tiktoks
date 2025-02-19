import { Script, ScriptComponent, TextStyle, ImageComponentStyle, BackgroundSettings, AnimationSettings } from './script';

export interface TemplateComponent extends Omit<ScriptComponent, 'text' | 'audioUrl' | 'wordTimings'> {
    placeholderText?: string;
    defaultStyle?: TextStyle | ImageComponentStyle;
    defaultAnimation?: AnimationSettings;
    keepContent?: boolean; // Flag to indicate if content should be preserved when saving template
}

export interface TemplateSettings {
    defaultTextStyle: TextStyle;
    defaultCaptionStyle: TextStyle;
    defaultImageStyle?: ImageComponentStyle;
    background?: BackgroundSettings;
    preserveBackground?: boolean; // Flag to keep background settings when saving template
}

export interface Template {
    id: string;
    name: string;
    description?: string;
    components: TemplateComponent[];
    settings: TemplateSettings;
    version: string; // For future compatibility
}

export interface TemplateFile {
    template: Template;
    assets?: {
        images?: { [key: string]: string }; // Base64 encoded images
        audio?: { [key: string]: string }; // Base64 encoded audio
    };
} 