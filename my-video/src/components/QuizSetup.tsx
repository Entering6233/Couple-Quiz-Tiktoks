import React from 'react';
import { Photo } from 'pexels';
import { ImageSelector } from './ImageSelector';
import { QuizItem } from '../data/quizData';

interface QuizSetupProps {
  onSave: (quizData: QuizItem[]) => void;
}

export const QuizSetup: React.FC<QuizSetupProps> = ({ onSave }) => {
  const [quizItems, setQuizItems] = React.useState<QuizItem[]>([]);
  const [currentItem, setCurrentItem] = React.useState(0);
  const [selectingFor, setSelectingFor] = React.useState<'left' | 'right' | null>(null);

  const handleImageSelect = (photo: Photo) => {
    if (!selectingFor) return;

    setQuizItems((prev) => {
      const updated = [...prev];
      updated[currentItem] = {
        ...updated[currentItem],
        [selectingFor === 'left' ? 'leftOption' : 'rightOption']: {
          ...updated[currentItem][selectingFor === 'left' ? 'leftOption' : 'rightOption'],
          image: photo.src.large,
          pexelsPhoto: photo,
        },
      };
      return updated;
    });

    setSelectingFor(null);
  };

  return (
    <div>
      {selectingFor && (
        <ImageSelector
          onSelect={handleImageSelect}
          searchQuery={
            selectingFor === 'left'
              ? quizItems[currentItem].leftOption.text
              : quizItems[currentItem].rightOption.text
          }
        />
      )}
      
      {/* Add your UI controls for managing quiz items here */}
    </div>
  );
}; 