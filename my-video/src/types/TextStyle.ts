export interface TextStyle {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    padding?: string;
    margin?: string;
    borderRadius?: string;
    border?: string;
    textStroke?: string;
    strokeWidth?: number;
    textShadow?: string;
    opacity?: number;
    textStyle?: 'normal' | 'bordered';
    animation?: {
        type: 'none' | 'fade' | 'scale' | 'rotate' | 'slide';
        in?: {
            type: 'none' | 'fade' | 'scale' | 'rotate' | 'slide';
            startFrame?: number;
            endFrame?: number;
        };
        out?: {
            type: 'none' | 'fade' | 'scale' | 'rotate' | 'slide';
            startFrame?: number;
            endFrame?: number;
        };
        stagger?: number;
    };
} 