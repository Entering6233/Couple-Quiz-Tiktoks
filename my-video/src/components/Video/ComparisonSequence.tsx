import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Comparison } from '../../types/quiz';

interface ComparisonSequenceProps {
    comparison: Comparison;
}

export const ComparisonSequence: React.FC<ComparisonSequenceProps> = ({ comparison }) => {
    return (
        <AbsoluteFill>
            {/* Component content */}
        </AbsoluteFill>
    );
}; 