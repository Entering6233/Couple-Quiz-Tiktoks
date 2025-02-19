import React, { useState, useEffect } from 'react';
import { createClient } from 'pexels';

const client = createClient('rXEDE5m6pUxOXZPawHmzKj04Z29WlV2y0Us44ld2TmXwdZstXtHUIh2F');

interface ImagePickerProps {
  currentImage: string;
  searchTerm: string;
  onSelect: (imageUrl: string) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  currentImage,
  searchTerm,
  onSelect,
}) => {
  const [images, setImages] = useState<Array<{ url: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      client.photos.search({ query: searchTerm, per_page: 10 })
        .then(result => {
          if ('photos' in result) {
            setImages(result.photos.map(photo => ({
              url: photo.src.large
            })));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching images:', err);
          setLoading(false);
        });
    }
  }, [searchTerm]);

  return (
    <div>
      {loading ? (
        <div>Loading images...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '10px',
          marginTop: '10px',
        }}>
          {images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={`Option ${index + 1}`}
              style={{
                width: '100%',
                height: '100px',
                objectFit: 'cover',
                cursor: 'pointer',
                border: currentImage === image.url ? '3px solid blue' : '1px solid #ccc',
              }}
              onClick={() => onSelect(image.url)}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 