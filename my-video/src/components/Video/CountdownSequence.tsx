import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CountdownComponent } from '../../types/script';

interface CountdownSequenceProps {
    component: CountdownComponent;
}

export const CountdownSequence: React.FC<CountdownSequenceProps> = ({ component }) => {
    const frame = useCurrentFrame();
    const style = component.style || {};
    const position = style.position || { x: 0, y: 0 };

    // Calculate current number based on frame
    const from = component.from || 10;
    const framePerNumber = component.durationInFrames ? component.durationInFrames / from : 30;
    const currentNumber = Math.max(0, Math.ceil(from - frame / framePerNumber));

    return (
        <AbsoluteFill>
            <div style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                fontSize: style.fontSize || 80,
                fontFamily: style.fontFamily || 'Arial',
                color: style.color || 'white',
                textAlign: style.textAlign || 'center',
                width: style.position?.width || 300,
                fontWeight: 'bold',
                transform: 'translate(0, 0)', // Prevent any transform issues
            }}>
                {currentNumber}
            </div>
        </AbsoluteFill>
    );
}; 