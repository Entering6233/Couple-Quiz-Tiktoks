import React from 'react';
import {Comparison} from '../../types/quiz';
import { ImageSelector } from './ImageSelector';

interface ComparisonEditorProps {
  item: QuizItem;
  onChange: (item: QuizItem) => void;
  onDelete: () => void;
}

export const ComparisonEditor: React.FC<ComparisonEditorProps> = ({
  item,
  onChange,
  onDelete,
}) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '20px',
      marginBottom: '20px',
      borderRadius: '8px',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Question:
          <input
            type="text"
            value={item.question}
            onChange={(e) => onChange({
              ...item,
              question: e.target.value,
              voiceover: e.target.value, // Auto-set voiceover to question
            })}
            style={{ width: '100%', padding: '8px' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Left Option */}
        <div style={{ flex: 1 }}>
          <h4>Left Option</h4>
          <input
            type="text"
            value={item.leftOption.text}
            onChange={(e) => onChange({
              ...item,
              leftOption: {
                ...item.leftOption,
                text: e.target.value,
              },
            })}
            placeholder="Left option text"
          />
          <ImageSelector
            currentImage={item.leftOption.image}
            searchTerm={item.leftOption.text}
            onSelect={(imageUrl) => onChange({
              ...item,
              leftOption: {
                ...item.leftOption,
                image: imageUrl,
              },
            })}
          />
        </div>

        {/* Right Option */}
        <div style={{ flex: 1 }}>
          <h4>Right Option</h4>
          <input
            type="text"
            value={item.rightOption.text}
            onChange={(e) => onChange({
              ...item,
              rightOption: {
                ...item.rightOption,
                text: e.target.value,
              },
            })}
            placeholder="Right option text"
          />
          <ImageSelector
            currentImage={item.rightOption.image}
            searchTerm={item.rightOption.text}
            onSelect={(imageUrl) => onChange({
              ...item,
              rightOption: {
                ...item.rightOption,
                image: imageUrl,
              },
            })}
          />
        </div>
      </div>

      <button onClick={onDelete} style={{ marginTop: '20px', color: 'red' }}>
        Delete Comparison
      </button>
    </div>
  );
}; 