import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionComponent } from '../../types/script';

interface TransitionSequenceProps {
    component: TransitionComponent;
}

export const TransitionSequence: React.FC<TransitionSequenceProps> = ({ component }) => {
    return (
        <AbsoluteFill style={{
            backgroundColor: 'black',
        }} />
    );
}; 