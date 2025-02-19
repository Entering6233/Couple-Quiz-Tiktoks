import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { QuizVideo } from '../../QuizVideo';
import { QuizItem } from '../../data/quizData';
import { ComparisonEditor } from './ComparisonEditor';

export const Setup: React.FC = () => {
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  
  const addComparison = () => {
    setQuizItems([
      ...quizItems,
      {
        question: '',
        leftOption: {
          image: '',
          text: '',
        },
        rightOption: {
          image: '',
          text: '',
        },
        voiceover: '',
      },
    ]);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      {/* Editor Section */}
      <div style={{ flex: 1 }}>
        <button onClick={addComparison}>Add Comparison</button>
        
        {quizItems.map((item, index) => (
          <ComparisonEditor
            key={index}
            item={item}
            onChange={(updatedItem) => {
              const newItems = [...quizItems];
              newItems[index] = updatedItem;
              setQuizItems(newItems);
            }}
            onDelete={() => {
              const newItems = quizItems.filter((_, i) => i !== index);
              setQuizItems(newItems);
            }}
          />
        ))}
      </div>

      {/* Preview Section */}
      <div style={{ flex: 1 }}>
        <Player
          component={QuizVideo}
          durationInFrames={1800}
          fps={30}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{
            width: '100%',
            height: 'auto',
          }}
          inputProps={{
            quizConfig: {
              comparisons: quizItems
            }
          }}
        />
      </div>
    </div>
  );
}; 