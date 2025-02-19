import React, { useState, useEffect } from 'react';
import { createClient, Photo } from 'pexels';
import { theme } from '../styles/theme';

const client = createClient('rXEDE5m6pUxOXZPawHmzKj04Z29WlV2y0Us44ld2TmXwdZstXtHUIh2F');

interface ImageSelectorProps {
    searchTerm: string;
    onSelect: (imageUrl: string) => void;
    currentImageUrl?: string;
    orientation?: 'portrait' | 'landscape' | 'square';
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
    searchTerm,
    onSelect,
    currentImageUrl,
    orientation = 'landscape'
}) => {
    const [images, setImages] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 6;

    useEffect(() => {
        if (!searchTerm) return;

        const searchImages = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await client.photos.search({
                    query: searchTerm,
                    per_page: perPage,
                    page,
                    orientation
                });
                setImages(result.photos || []);
                setTotalPages(Math.ceil((result.total_results || 0) / perPage));
            } catch (err) {
                setError('Failed to load images');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        searchImages();
    }, [searchTerm, page, orientation]);

    return (
        <div style={styles.container}>
            {loading && <div style={styles.loading}>Loading images...</div>}
            {error && <div style={styles.error}>{error}</div>}
            
            <div style={styles.grid}>
                {images.map((photo) => (
                    <div
                        key={photo.id}
                        style={{
                            ...styles.imageContainer,
                            border: currentImageUrl === photo.src.medium ? `3px solid ${theme.colors.primary}` : '1px solid #ddd',
                        }}
                        onClick={() => onSelect(photo.src.medium)}
                    >
                        <img
                            src={photo.src.medium}
                            alt={photo.alt || 'Option image'}
                            style={styles.image}
                        />
                        <div style={styles.imageOverlay}>
                            <span>Select</span>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                            ...styles.button,
                            opacity: page === 1 ? 0.5 : 1
                        }}
                    >
                        Previous
                    </button>
                    <span style={styles.pageInfo}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{
                            ...styles.button,
                            opacity: page === totalPages ? 0.5 : 1
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: theme.spacing.md,
    },
    loading: {
        textAlign: 'center' as const,
        padding: theme.spacing.md,
        color: theme.colors.text.secondary,
    },
    error: {
        textAlign: 'center' as const,
        padding: theme.spacing.md,
        color: theme.colors.error,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing.md,
    },
    imageContainer: {
        position: 'relative' as const,
        cursor: 'pointer',
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        aspectRatio: '16/9',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
            transform: 'scale(1.02)',
        },
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    },
    imageOverlay: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        opacity: 0,
        transition: 'opacity 0.2s ease-in-out',
        '&:hover': {
            opacity: 1,
        },
    },
    pagination: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.md,
        marginTop: theme.spacing.md,
    },
    pageInfo: {
        color: theme.colors.text.secondary,
    },
    button: {
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        backgroundColor: theme.colors.primary,
        color: '#fff',
        border: 'none',
        borderRadius: theme.borderRadius.sm,
        cursor: 'pointer',
        '&:disabled': {
            cursor: 'not-allowed',
        },
    },
}; 