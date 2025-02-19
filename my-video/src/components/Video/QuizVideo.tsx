import React from 'react';
import {
    AbsoluteFill,
    Audio,
    Sequence,
    useVideoConfig,
} from 'remotion';
import {QuizConfig} from '../../types/quiz';
import {ComparisonSequence} from './ComparisonSequence';

interface QuizVideoProps {
    quizConfig: QuizConfig;
}

export const QuizVideo: React.FC<QuizVideoProps> = ({quizConfig}) => {
    const {fps} = useVideoConfig();
    const SEQUENCE_DURATION = 5 * fps;

    // Handle empty state
    if (!quizConfig.comparisons.length) {
        return (
            <AbsoluteFill style={{
                backgroundColor: '#1a1a1a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <h1 style={{color: 'white'}}>Add a comparison to start</h1>
            </AbsoluteFill>
        );
    }

    return (
        <AbsoluteFill style={{backgroundColor: '#1a1a1a'}}>
            {quizConfig.comparisons.map((comparison, index) => (
                <Sequence
                    key={comparison.id}
                    from={index * SEQUENCE_DURATION}
                    durationInFrames={SEQUENCE_DURATION}
                >
                    <ComparisonSequence comparison={comparison} />
                </Sequence>
            ))}
        </AbsoluteFill>
    );
}; 