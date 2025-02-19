export interface WordTiming {
    word: string;
    start: number;
    end: number;
}

export interface CaptionStyleOptions {
    fontSize: number;
    color: string;
    backgroundColor: string;
    position: 'top' | 'bottom';
    wordWindow?: number;
    fontFamily?: string;
    customFontUrl?: string;
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic';
    borderRadius?: string;
    padding?: string;
    boxShadow?: string;
    opacity?: number;
    animationStyle?: string;
    animationDuration?: number;
    textStyle?: 'normal' | 'bordered';
    textStroke?: string;
    textShadow?: string;
    border?: string;
    WebkitTextStroke?: string;
    customPosition?: {
        x: number;
        y: number;
    };
}

export type CaptionPreset = 
    | 'default' 
    | 'tiktok' 
    | 'subtitle' 
    | 'remotion-subtitles'
    | 'bounce'
    | 'colorful'
    | 'explosive'
    | 'fade'
    | 'fire'
    | 'glitch'
    | 'glowing'
    | 'lightning'
    | 'neon'
    | 'rotating'
    | 'shake'
    | 'threeDish'
    | 'tiltShift'
    | 'typewriter'
    | 'waving'
    | 'zoom';

export type CaptionStyle = CaptionStyleOptions | CaptionPreset;

export type TikTokToken = {
    text: string;
    fromMs: number;
    toMs: number;
};

export type TikTokPage = {
    text: string;
    startMs: number;
    tokens: TikTokToken[];
};

export type AnimationType = 'fade' | 'scale' | 'slide' | 'typewriter' | 'bounce' | 'wave';

export interface AnimationConfig {
    type: AnimationType;
    duration: number;
    delay?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
    springConfig?: {
        damping: number;
        mass?: number;
        stiffness?: number;
    };
}

export interface TextStyleBase {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: string | number;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    letterSpacing?: number;
    lineHeight?: number;
    strokeWidth?: number;
    strokeColor?: string;
    backgroundColor?: string;
    padding?: string | number;
    borderRadius?: string | number;
    shadow?: {
        color: string;
        blur: number;
        offset?: { x: number; y: number };
    };
}

export interface AnimationOptions {
    type: 'none' | 'fade' | 'scale' | 'rotate' | 'slide' | 'slide-left' | 'slide-right' | 'fadeScale' | 'fadeSlide' | 'bounce' | 'flip' | 'zoom' | 'slideRotate' | 'elastic';
    entrance?: {
        type: 'none' | 'fade' | 'scale' | 'rotate' | 'slide' | 'slide-left' | 'slide-right' | 'fadeScale' | 'fadeSlide' | 'bounce' | 'flip' | 'zoom' | 'slideRotate' | 'elastic';
        duration?: number;
        delay?: number;
        damping?: number;
        mass?: number;
        stiffness?: number;
        feel?: 'bouncy' | 'smooth' | 'snappy' | 'gentle';
        slideDirection?: 'left' | 'right' | 'up' | 'down';
        offset?: number;
    };
    exit?: {
        type: 'none' | 'fade' | 'scale' | 'rotate' | 'slide' | 'slide-left' | 'slide-right' | 'fadeScale' | 'fadeSlide' | 'bounce' | 'flip' | 'zoom' | 'slideRotate' | 'elastic';
        duration?: number;
        delay?: number;
        damping?: number;
        mass?: number;
        stiffness?: number;
        feel?: 'bouncy' | 'smooth' | 'snappy' | 'gentle';
        slideDirection?: 'left' | 'right' | 'up' | 'down';
        offset?: number;
    };
}

export interface TextStyle {
    position?: {
        x: string | number;
        y: string | number;
    };
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string | number;
    borderRadius?: string | number;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: string | number;
    lineHeight?: number;
    letterSpacing?: string | number;
    textStyle?: 'normal' | 'bordered';
    textStroke?: string;
    textShadow?: string;
    animation?: AnimationOptions;
}

export type TextDisplayMode = 'sync' | 'instant';

export type ComponentType = 
    | 'text'
    | 'comparison'
    | 'image'
    | 'transition'
    | 'title'
    | 'question'
    | 'splitScreen'
    | 'countdown'
    | 'voice'
    | 'video'
    | 'audio'
    | 'caption';

export interface BaseScriptComponent {
    id: string;
    type: ComponentType;
    startFrame: number;
    durationInFrames: number;
    track?: number;
}

export interface ComparisonComponentStyle {
    fontSize?: number;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
    spacing?: number;
    borderRadius?: number;
    shadow?: string;
    showText?: boolean;
    orientation?: 'horizontal' | 'vertical';
    imageSize?: number;
    imageGap?: number;
    forceSameSize?: boolean;
    imagePosition?: Partial<{
        x: number;
        y: number;
    }>;
    imageBorder?: {
        enabled: boolean;
        color: string;
        width: number;
    };
    imageDropShadow?: {
        enabled: boolean;
        color: string;
        blur: number;
        spread: number;
        x: number;
        y: number;
    };
    animation?: AnimationOptions;
}

export type ComparisonComponent = BaseScriptComponent & {
    type: 'comparison';
    question: string;
    orientation: 'horizontal' | 'vertical';
    leftOption: {
        text: string;
        imageUrl: string;
    };
    rightOption: {
        text: string;
        imageUrl: string;
    };
    style?: ComparisonComponentStyle;
};

export interface TextComponent extends BaseScriptComponent {
    type: 'text';
    text: string;
    style?: TextStyle;
    duration?: number;
}

export interface TitleComponent extends BaseScriptComponent {
    type: 'title';
    text: string;
    subtitle?: string;
    style?: TextStyle;
    background?: {
        type: 'color' | 'image';
        value: string;
    };
}

export interface CountdownComponent extends BaseScriptComponent {
    type: 'countdown';
    from: number;
    style: TextStyle;
    sound?: boolean;
}

export interface TransitionComponent extends BaseScriptComponent {
    type: 'transition';
    transitionType: 'fade' | 'slide' | 'whoosh';
    direction?: 'left' | 'right' | 'up' | 'down';
}

export interface VideoComponentStyle {
    width?: number;
    height?: number;
    position?: {
        x: number;
        y: number;
    };
    scale?: number;
    rotation?: number;
    opacity?: number;
    border?: {
        enabled: boolean;
        color: string;
        width: number;
    };
    dropShadow?: {
        enabled: boolean;
        color: string;
        blur: number;
        spread: number;
        x: number;
        y: number;
    };
    volume?: number;
    playbackRate?: number;
    loop?: boolean;
    muted?: boolean;
    chromakey?: {
        enabled: boolean;
        color: string;
        similarity: number;  // 0-1, how close colors need to be to be removed
        smoothness: number;  // 0-1, edge smoothness
    };
    animation?: AnimationOptions;
    // Add time control properties
    startTime?: number;  // Start time in seconds from the source video
    duration?: number;   // Duration in seconds to use from the source video
}

export type VideoComponent = BaseScriptComponent & {
    type: 'video';
    videoUrl: string;
    style?: VideoComponentStyle;
};

export interface AudioComponentStyle {
    volume?: number;
    loop?: boolean;
    startTime?: number;
    duration?: number;
}

export interface AudioFile {
    name: string;
    path: string;
    duration: number;
}

export interface AudioComponent extends BaseScriptComponent {
    type: 'audio';
    audioFile?: string | AudioFile;
    volume?: number;
    style?: AudioComponentStyle;
}

export interface VoiceSettings {
    voiceId?: string;
    stability?: number;
    similarity_boost?: number;
}

export interface VoiceComponent extends BaseScriptComponent {
    type: 'voice';
    text: string;
    audioUrl?: string;
    voiceSettings?: VoiceSettings;
    wordTimings?: WordTiming[];
    showCaptions?: boolean;
    captionStyle?: CaptionStyleOptions;
    style?: VoiceStyle;
}

export interface CaptionTrack {
    id: string;
    originalComponentId?: string;  // ID of the original voice component
    isLinked: boolean;
    wordTimings: WordTiming[];
    startFrame: number;
    text: string;
}

export interface CornerRadius {
    enabled: boolean;
    isUniform: boolean;
    value: number;
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
}

export interface ImageComponentStyle {
    width?: number;
    height?: number;
    position?: {
        x: number;
        y: number;
    };
    scale?: number;
    rotation?: number;
    opacity?: number;
    border?: {
        enabled: boolean;
        color: string;
        width: number;
    };
    dropShadow?: {
        enabled: boolean;
        color: string;
        blur: number;
        spread: number;
        x: number;
        y: number;
    };
    cornerRadius?: CornerRadius;
}

export interface ImageComponent extends BaseScriptComponent {
    type: 'image';
    imageUrl: string;
    style?: ImageComponentStyle;
    animation?: {
        in: {
            type: 'none' | 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'slide-up' | 'slide-down';
            startFrame: number;
            endFrame: number;
        };
        out: {
            type: 'none' | 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'slide-up' | 'slide-down';
            startFrame: number;
            endFrame: number;
        };
    };
}

export interface CaptionComponent extends BaseScriptComponent {
    type: 'caption';
    text: string;
    style?: CaptionStyleOptions;
    currentWordIndex?: number;
    visibleWords?: string[];
    _debugTiming?: {
        currentTime: number;
        wordStartTimes: number[];
        wordEndTimes: number[];
    };
}

export type Component = 
    | TextComponent 
    | ComparisonComponent 
    | TitleComponent 
    | CountdownComponent 
    | TransitionComponent
    | CaptionComponent
    | VoiceComponent
    | ImageComponent
    | VideoComponent
    | AudioComponent;

export interface ScriptSettings {
    defaultTextStyle: TextStyle;
    defaultCaptionStyle: TextStyle;
    fps?: number;
    background?: {
        type: 'none' | 'image' | 'video';
        url?: string;
        filePath?: string;
        durationInFrames?: number;
    };
    backgroundHistory?: {
        type: 'image' | 'video';
        url: string;
        filePath: string;
        timestamp: string;
    }[];
}

export interface Script {
    id: string;
    components: BaseScriptComponent[];
    settings: {
        width: number;
        height: number;
        fps: number;
        durationInFrames: number;
    };
}

export interface VoiceComponentStyle extends TextStyle {
    wordWindow?: number; // Number of words to show at once
}

export interface VoiceStyle extends TextStyle {
    volume?: number;
    loop?: boolean;
    startTime?: number;
    duration?: number;
    animation?: AnimationOptions;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: string;
    position?: {
        x: number | string;
        y: number | string;
    };
} 