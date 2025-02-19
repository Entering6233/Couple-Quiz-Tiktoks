import { 
    ComponentType, 
    Component,
    BaseScriptComponent,
    TextStyle,
    TextComponent,
    ComparisonComponent,
    TitleComponent,
    CountdownComponent,
    TransitionComponent,
    VoiceComponent,
    VideoComponent,
    AudioComponent,
    ImageComponent
} from '../types/script';

const DEFAULT_TEXT_STYLE: TextStyle = {
    fontSize: 40,
    color: 'white',
    fontFamily: 'Arial',
    textAlign: 'center',
    fontWeight: 'normal',
};

export const createComponent = (
    type: ComponentType,
    defaultTextStyle: TextStyle = DEFAULT_TEXT_STYLE,
    defaultCaptionStyle: TextStyle = DEFAULT_TEXT_STYLE
): Component => {
    const baseProps = {
        id: Date.now().toString(),
        durationInFrames: 150, // 5 seconds default
        startFrame: 0,
    };

    switch (type) {
        case 'title':
            return {
                ...baseProps,
                type: 'title',
                text: 'New Title',
                subtitle: '',
                style: { ...defaultTextStyle },
                background: {
                    type: 'color',
                    value: '#000000',
                },
            } as TitleComponent;

        case 'text':
            return {
                ...baseProps,
                type: 'text',
                text: 'Enter your text here',
                style: { ...defaultTextStyle },
            } as TextComponent;

        case 'comparison':
            return {
                ...baseProps,
                type: 'comparison',
                question: 'Enter your question',
                leftOption: {
                    text: 'Left Option',
                    imageUrl: '',
                },
                rightOption: {
                    text: 'Right Option',
                    imageUrl: '',
                },
            } as ComparisonComponent;

        case 'countdown':
            return {
                ...baseProps,
                type: 'countdown',
                from: 5,
                style: { ...defaultTextStyle },
                sound: true,
                durationInFrames: 150,
            } as CountdownComponent;

        case 'transition':
            return {
                ...baseProps,
                type: 'transition',
                transitionType: 'fade',
                direction: 'left',
                durationInFrames: 30,
            } as TransitionComponent;

        case 'voice':
            return {
                ...baseProps,
                type: 'voice',
                text: 'Enter text for voice generation',
                voiceSettings: {
                    voiceId: 'GhJYgP4Lrji0pwS3kQwv',
                    stability: 0.75,
                    similarity_boost: 0.75,
                },
                captionStyle: {
                    fontSize: 24,
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    position: 'bottom',
                    wordWindow: 3,
                    textStyle: 'bordered',
                    textStroke: '2px black',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                },
                showCaptions: false,
                style: { ...defaultTextStyle },
            } as VoiceComponent;

        case 'video':
            return {
                ...baseProps,
                type: 'video',
                videoUrl: '',
                style: {
                    width: 100,
                    height: 100,
                    position: { x: 0, y: 0 },
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    borderRadius: 0,
                    border: {
                        enabled: false,
                        color: '#000000',
                        width: 1,
                    },
                    dropShadow: {
                        enabled: false,
                        color: 'rgba(0,0,0,0.5)',
                        blur: 10,
                        spread: 0,
                        x: 0,
                        y: 4,
                    },
                    volume: 1,
                    playbackRate: 1,
                    loop: false,
                    muted: false,
                    animation: {
                        type: 'none',
                        duration: 30,
                        delay: 0,
                        direction: 'left',
                        easing: 'easeInOut',
                    },
                },
            } as VideoComponent;

        case 'audio':
            return {
                ...baseProps,
                type: 'audio',
                audioUrl: '',
                style: {
                    volume: 1,
                    loop: false,
                    startTime: 0,
                },
            } as AudioComponent;

        case 'image':
            return {
                ...baseProps,
                type: 'image',
                imageUrl: '',
                style: {
                    width: 400,
                    height: 400,
                    position: { x: 0, y: 0 },
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    border: {
                        enabled: false,
                        color: '#000000',
                        width: 1
                    },
                    dropShadow: {
                        enabled: false,
                        color: 'rgba(0,0,0,0.5)',
                        blur: 10,
                        spread: 0,
                        x: 0,
                        y: 4
                    }
                }
            } as ImageComponent;

        default:
            throw new Error(`Unknown component type: ${type}`);
    }
}; 