import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TitleComponent } from '../../types/script';

interface TitleSequenceProps {
    component: TitleComponent;
}

export const TitleSequence: React.FC<TitleSequenceProps> = ({ component }) => {
    const style = component.style || {};
    const position = style.position || { x: 0, y: 0 };

    return (
        <AbsoluteFill>
            <div style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                fontSize: style.fontSize || 60,
                fontFamily: style.fontFamily || 'Arial',
                color: style.color || 'white',
                textAlign: style.textAlign || 'center',
                width: style.position?.width || 300,
                fontWeight: 'bold',
                transform: 'translate(0, 0)', // Prevent any transform issues
            }}>
                {component.text}
            </div>
        </AbsoluteFill>
    );
}; 