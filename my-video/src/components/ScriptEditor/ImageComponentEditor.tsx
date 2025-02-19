import React, { useState, useEffect, useRef } from 'react';
import { ImageComponent, ImageComponentStyle } from '../../types/script';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { ColorPicker } from '../common/ColorPicker';
import { Slider } from '../common/Slider';
import { Switch } from '../common/Switch';
import { ImagePositioningScreen } from './ImagePositioningScreen';
import { Select } from '../common/Select';
import { debounce } from 'lodash';

const IMAGE_SERVICE_URL = 'http://localhost:5003';

interface PexelsImage {
    id: number;
    thumbnail: string;
    url: string;
    photographer: string;
    width: number;
    height: number;
}

interface ImageComponentEditorProps {
    component: ImageComponent;
    onChange: (component: ImageComponent) => void;
}

type AnimationType = NonNullable<ImageComponent['animation']>['in']['type'];

const ANIMATION_OPTIONS: { value: AnimationType; label: string }[] = [
    { value: 'none', label: 'Off' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide-left', label: 'Slide Left' },
    { value: 'slide-right', label: 'Slide Right' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'slide-down', label: 'Slide Down' },
    { value: 'zoom', label: 'Zoom' },
];

export const ImageComponentEditor: React.FC<ImageComponentEditorProps> = ({
    component,
    onChange,
}) => {
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [pexelsImages, setPexelsImages] = useState<PexelsImage[]>([]);
    const [showPexelsSearch, setShowPexelsSearch] = useState(false);
    const [showPositioning, setShowPositioning] = useState(false);

    // Initialize animation with proper defaults
    const animation = component.animation ?? {
        in: {
            type: 'none',
            startFrame: 0,
            endFrame: 30
        },
        out: {
            type: 'none',
            startFrame: (component.durationInFrames ?? 150) - 30,
            endFrame: component.durationInFrames ?? 150
        }
    };

    // Ensure animation is properly initialized when component is created
    useEffect(() => {
        if (!component.animation) {
            onChange({
                ...component,
                animation
            });
        }
    }, []);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:5003/upload_image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            onChange({
                ...component,
                imageUrl: data.url,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handlePexelsSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5003/search_pexels?query=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) {
                throw new Error('Failed to search Pexels');
            }

            const images = await response.json();
            setPexelsImages(images);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search Pexels');
        } finally {
            setSearching(false);
        }
    };

    const handlePexelsSelect = async (pexelsImage: PexelsImage) => {
        setUploadingImage(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5003/download_pexels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: pexelsImage.url }),
            });

            if (!response.ok) {
                throw new Error('Failed to download image');
            }

            const data = await response.json();
            onChange({
                ...component,
                imageUrl: data.url,
                style: {
                    ...component.style,
                    width: pexelsImage.width,
                    height: pexelsImage.height,
                },
            });
            setShowPexelsSearch(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to download image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleStyleChange = (updates: Partial<ImageComponentStyle>) => {
        const defaultStyle: ImageComponentStyle = {
            width: 400,
            height: 400,
            scale: 1,
            rotation: 0,
            opacity: 1,
            border: {
                enabled: false,
                color: '#ffffff',
                width: 2
            },
            dropShadow: {
                enabled: false,
                color: 'rgba(0,0,0,0.5)',
                blur: 10,
                spread: 0,
                x: 0,
                y: 0
            },
            cornerRadius: {
                enabled: false,
                isUniform: true,
                value: 10,
                topLeft: 10,
                topRight: 10,
                bottomLeft: 10,
                bottomRight: 10
            }
        };

        onChange({
            ...component,
            style: {
                ...defaultStyle,
                ...component.style,
                ...updates
            }
        });
    };

    const handleAnimationChange = (direction: 'in' | 'out', updates: Partial<NonNullable<ImageComponent['animation']>['in']>) => {
        const currentAnimation = component.animation ?? animation;
        
        onChange({
            ...component,
            animation: {
                ...currentAnimation,
                [direction]: {
                    ...currentAnimation[direction],
                    ...updates,
                },
            },
        });
    };

    const handlePositionChange = (position: { x: number; y: number }) => {
        handleStyleChange({ position });
    };

    const handleBorderChange = (updates: Partial<NonNullable<ImageComponentStyle['border']>>) => {
        const defaultBorder = {
            enabled: false,
            color: '#ffffff',
            width: 2
        };

        handleStyleChange({
            border: {
                ...defaultBorder,
                ...component.style?.border,
                ...updates
            }
        });
    };

    const handleDropShadowChange = (updates: Partial<NonNullable<ImageComponentStyle['dropShadow']>>) => {
        const defaultDropShadow = {
            enabled: false,
            color: 'rgba(0,0,0,0.5)',
            blur: 10,
            spread: 0,
            x: 0,
            y: 0
        };

        handleStyleChange({
            dropShadow: {
                ...defaultDropShadow,
                ...component.style?.dropShadow,
                ...updates
            }
        });
    };

    const applyCornerRadius = async (cornerRadius: NonNullable<ImageComponentStyle['cornerRadius']>) => {
        if (!component.imageUrl) {
            console.error('No image URL available for corner radius application');
            return;
        }

        console.log('Applying corner radius via API:', cornerRadius);
        
        try {
            const filename = component.imageUrl.split('/').pop();
            if (!filename) {
                console.error('Could not extract filename from URL:', component.imageUrl);
                return;
            }

            // Remove any leading slash from the filename
            const cleanFilename = filename.replace(/^\//, '');
            console.log('Extracted filename:', cleanFilename);

            const params = new URLSearchParams({
                radius: cornerRadius.value.toString(),
                topLeft: cornerRadius.topLeft.toString(),
                topRight: cornerRadius.topRight.toString(),
                bottomLeft: cornerRadius.bottomLeft.toString(),
                bottomRight: cornerRadius.bottomRight.toString()
            });

            const url = `${IMAGE_SERVICE_URL}/images/${cleanFilename}/corner-radius?${params}`;
            console.log('Making API request to:', url);

            const response = await fetch(url);
            console.log('API response status:', response.status);
            
            const responseText = await response.text();
            console.log('API response text:', responseText);

            if (!response.ok) {
                console.error('Corner radius API error:', responseText);
                throw new Error('Failed to apply corner radius');
            }

            const data = JSON.parse(responseText);
            console.log('Corner radius API response data:', data);

            if (!data.filePath) {
                console.error('No file path in response:', data);
                throw new Error('Invalid response from server');
            }

            // Update the component with the new image URL
            console.log('Updating component with new image URL:', data.filePath);
            onChange({
                ...component,
                imageUrl: data.filePath,
                style: {
                    ...component.style,
                    cornerRadius: cornerRadius
                }
            });
        } catch (err) {
            console.error('Error applying corner radius:', err);
            setError(err instanceof Error ? err.message : 'Failed to apply corner radius');
        }
    };

    const debouncedApplyCornerRadius = useRef(
        debounce(applyCornerRadius, 300)
    ).current;

    const handleCornerRadiusChange = async (updates: Partial<NonNullable<ImageComponentStyle['cornerRadius']>>) => {
        const defaultCornerRadius = {
            enabled: false,
            isUniform: true,
            value: 10,
            topLeft: 10,
            topRight: 10,
            bottomLeft: 10,
            bottomRight: 10
        };

        console.log('Updating corner radius with:', updates);
        console.log('Current corner radius:', component.style?.cornerRadius);

        const newCornerRadius = {
            ...defaultCornerRadius,
            ...component.style?.cornerRadius,
            ...updates
        };

        console.log('New corner radius will be:', newCornerRadius);

        // First update the local state
        handleStyleChange({
            cornerRadius: newCornerRadius
        });

        // If enabled, apply the corner radius via the API
        if (newCornerRadius.enabled) {
            console.log('Corner radius is enabled, triggering API call');
            if ('enabled' in updates) {
                // If we're enabling/disabling, apply immediately
                await applyCornerRadius(newCornerRadius);
            } else {
                // For other changes, use debounced version
                await debouncedApplyCornerRadius(newCornerRadius);
            }
        } else {
            console.log('Corner radius is disabled, skipping API call');
        }
    };

    // Add useEffect to reapply corner radius when image URL changes
    useEffect(() => {
        const isRoundedImage = component.imageUrl?.startsWith('rounded-');
        if (component.imageUrl && component.style?.cornerRadius?.enabled && !isRoundedImage) {
            console.log('Image URL changed and is not already rounded, reapplying corner radius');
            applyCornerRadius(component.style.cornerRadius);
        }
    }, [component.imageUrl]);

    // Add useEffect to track style changes
    useEffect(() => {
        if (component.style?.cornerRadius?.enabled) {
            console.log('Corner radius is enabled with settings:', {
                isUniform: component.style.cornerRadius.isUniform,
                value: component.style.cornerRadius.value,
                topLeft: component.style.cornerRadius.topLeft,
                topRight: component.style.cornerRadius.topRight,
                bottomLeft: component.style.cornerRadius.bottomLeft,
                bottomRight: component.style.cornerRadius.bottomRight
            });
        }
    }, [component.style?.cornerRadius]);

    // Add logging to image preview
    const getPreviewStyle = () => {
        const previewStyle = {
            ...styles.preview,
            borderRadius: component.style?.cornerRadius?.enabled
                ? component.style.cornerRadius.isUniform
                    ? `${component.style.cornerRadius.value}px`
                    : `${component.style.cornerRadius.topLeft}px ${component.style.cornerRadius.topRight}px ${component.style.cornerRadius.bottomRight}px ${component.style.cornerRadius.bottomLeft}px`
                : undefined
        };

        console.log('Applying preview style:', previewStyle);
        return previewStyle;
    };

    // Add this effect near the top of the component, after other useEffect hooks
    useEffect(() => {
        // When duration changes, update animation frames if needed
        const duration = component.durationInFrames ?? 150;
        
        // Only update if current values exceed new duration
        if (animation.in.startFrame > duration || animation.in.endFrame > duration ||
            animation.out.startFrame > duration || animation.out.endFrame > duration) {
            
            const newAnimation = {
                in: {
                    ...animation.in,
                    startFrame: Math.min(animation.in.startFrame, duration),
                    endFrame: Math.min(animation.in.endFrame, duration)
                },
                out: {
                    ...animation.out,
                    startFrame: Math.min(animation.out.startFrame, duration),
                    endFrame: duration
                }
            };
            
            onChange({
                ...component,
                animation: newAnimation
            });
        }
    }, [component.durationInFrames]);

    return (
        <div style={styles.container}>
            {showPositioning ? (
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}>Position Image</h3>
                        <button onClick={() => setShowPositioning(false)} style={styles.closeButton}>
                            Done
                        </button>
                    </div>
                    <ImagePositioningScreen
                        component={component}
                        onPositionChange={handlePositionChange}
                        onClose={() => setShowPositioning(false)}
                    />
                </div>
            ) : (
                <>
                    {/* Image Upload */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Image</h3>
                        <div style={styles.uploadButtons}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" style={styles.uploadButton}>
                                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </label>
                            <button
                                onClick={() => setShowPexelsSearch(!showPexelsSearch)}
                                style={styles.uploadButton}
                            >
                                Search Pexels
                            </button>
                        </div>

                        {showPexelsSearch && (
                            <div style={styles.pexelsSearch}>
                                <div style={styles.searchBar}>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePexelsSearch()}
                                        placeholder="Search Pexels images..."
                                        style={styles.searchInput}
                                    />
                                    <button
                                        onClick={handlePexelsSearch}
                                        style={styles.searchButton}
                                        disabled={searching}
                                    >
                                        {searching ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                                <div style={styles.pexelsResults}>
                                    {pexelsImages.map((image) => (
                                        <div
                                            key={image.id}
                                            onClick={() => handlePexelsSelect(image)}
                                            style={styles.pexelsImage}
                                        >
                                            <img
                                                src={image.thumbnail}
                                                alt={`By ${image.photographer}`}
                                                style={styles.pexelsThumbnail}
                                            />
                                            <div style={styles.photographerCredit}>
                                                By {image.photographer}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && <div style={styles.error}>{error}</div>}
                        {component.imageUrl && (
                            <div>
                                <img
                                    src={`${IMAGE_SERVICE_URL}/images/${component.imageUrl}`}
                                    alt="Preview"
                                    style={getPreviewStyle()}
                                    onLoad={() => {
                                        console.log('Image loaded with URL:', `${IMAGE_SERVICE_URL}/images/${component.imageUrl}`);
                                        if (component.style?.cornerRadius?.enabled) {
                                            console.log('Corner radius should be applied with:', component.style.cornerRadius);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => setShowPositioning(true)}
                                    style={styles.positionButton}
                                >
                                    Position Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Size and Position */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Size & Position</h3>
                        <Slider
                            label="Duration (frames)"
                            value={component.durationInFrames ?? 150}
                            onChange={(value) => onChange({
                                ...component,
                                durationInFrames: value
                            })}
                            min={1}
                            max={600}
                        />
                        <Slider
                            label="Width"
                            value={component.style?.width ?? 400}
                            onChange={(value) => handleStyleChange({ width: value })}
                            min={50}
                            max={1920}
                        />
                        <Slider
                            label="Height"
                            value={component.style?.height ?? 400}
                            onChange={(value) => handleStyleChange({ height: value })}
                            min={50}
                            max={1080}
                        />
                        <Slider
                            label="Scale"
                            value={component.style?.scale ?? 1}
                            onChange={(value) => handleStyleChange({ scale: value })}
                            min={0.1}
                            max={2}
                            step={0.1}
                        />
                        <Slider
                            label="Rotation"
                            value={component.style?.rotation ?? 0}
                            onChange={(value) => handleStyleChange({ rotation: value })}
                            min={-180}
                            max={180}
                        />
                        <Slider
                            label="Opacity"
                            value={component.style?.opacity ?? 1}
                            onChange={(value) => handleStyleChange({ opacity: value })}
                            min={0}
                            max={1}
                            step={0.1}
                        />
                    </div>

                    {/* Border */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Border</h3>
                        <Switch
                            label="Enable Border"
                            checked={component.style?.border?.enabled ?? false}
                            onChange={(checked) => handleBorderChange({ enabled: checked })}
                        />
                        {component.style?.border?.enabled && (
                            <>
                                <ColorPicker
                                    label="Border Color"
                                    color={component.style.border.color}
                                    onChange={(color) => handleBorderChange({ color })}
                                />
                                <Slider
                                    label="Border Width"
                                    value={component.style.border.width}
                                    onChange={(value) => handleBorderChange({ width: value })}
                                    min={1}
                                    max={20}
                                />
                            </>
                        )}
                    </div>

                    {/* Drop Shadow */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Drop Shadow</h3>
                        <Switch
                            label="Enable Shadow"
                            checked={component.style?.dropShadow?.enabled ?? false}
                            onChange={(checked) => handleDropShadowChange({ enabled: checked })}
                        />
                        {component.style?.dropShadow?.enabled && (
                            <>
                                <ColorPicker
                                    label="Shadow Color"
                                    color={component.style.dropShadow.color}
                                    onChange={(color) => handleDropShadowChange({ color })}
                                />
                                <Slider
                                    label="Blur Radius"
                                    value={component.style.dropShadow.blur}
                                    onChange={(value) => handleDropShadowChange({ blur: value })}
                                    min={0}
                                    max={50}
                                />
                                <Slider
                                    label="Spread"
                                    value={component.style.dropShadow.spread}
                                    onChange={(value) => handleDropShadowChange({ spread: value })}
                                    min={0}
                                    max={50}
                                />
                                <Slider
                                    label="X Offset"
                                    value={component.style.dropShadow.x}
                                    onChange={(value) => handleDropShadowChange({ x: value })}
                                    min={-50}
                                    max={50}
                                />
                                <Slider
                                    label="Y Offset"
                                    value={component.style.dropShadow.y}
                                    onChange={(value) => handleDropShadowChange({ y: value })}
                                    min={-50}
                                    max={50}
                                />
                            </>
                        )}
                    </div>

                    {/* Corner Radius */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Corner Radius</h3>
                        <Switch
                            label="Enable Rounded Corners"
                            checked={component.style?.cornerRadius?.enabled ?? false}
                            onChange={(checked) => handleCornerRadiusChange({ enabled: checked })}
                        />
                        {component.style?.cornerRadius?.enabled && (
                            <>
                                <Switch
                                    label="Uniform Corners"
                                    checked={component.style.cornerRadius.isUniform}
                                    onChange={(checked) => handleCornerRadiusChange({ isUniform: checked })}
                                />
                                {component.style.cornerRadius.isUniform ? (
                                    <Slider
                                        label="Corner Radius"
                                        value={component.style.cornerRadius.value}
                                        onChange={(value) => handleCornerRadiusChange({
                                            value,
                                            topLeft: value,
                                            topRight: value,
                                            bottomLeft: value,
                                            bottomRight: value
                                        })}
                                        min={0}
                                        max={100}
                                    />
                                ) : (
                                    <>
                                        <Slider
                                            label="Top Left Radius"
                                            value={component.style.cornerRadius.topLeft}
                                            onChange={(value) => handleCornerRadiusChange({ topLeft: value })}
                                            min={0}
                                            max={100}
                                        />
                                        <Slider
                                            label="Top Right Radius"
                                            value={component.style.cornerRadius.topRight}
                                            onChange={(value) => handleCornerRadiusChange({ topRight: value })}
                                            min={0}
                                            max={100}
                                        />
                                        <Slider
                                            label="Bottom Left Radius"
                                            value={component.style.cornerRadius.bottomLeft}
                                            onChange={(value) => handleCornerRadiusChange({ bottomLeft: value })}
                                            min={0}
                                            max={100}
                                        />
                                        <Slider
                                            label="Bottom Right Radius"
                                            value={component.style.cornerRadius.bottomRight}
                                            onChange={(value) => handleCornerRadiusChange({ bottomRight: value })}
                                            min={0}
                                            max={100}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Animation */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Animation</h3>
                        
                        {/* Entrance Animation */}
                        <div style={styles.animationSection}>
                            <h4 style={styles.subsectionTitle}>Entrance</h4>
                            <Select
                                label="Type"
                                value={animation.in.type}
                                options={ANIMATION_OPTIONS}
                                onChange={(value) => handleAnimationChange('in', { type: value as AnimationType })}
                            />
                            <Slider
                                label="Start Frame"
                                value={animation.in.startFrame}
                                onChange={(value) => handleAnimationChange('in', { startFrame: value })}
                                min={0}
                                max={component.durationInFrames ?? 150}
                            />
                            <Slider
                                label="End Frame"
                                value={animation.in.endFrame}
                                onChange={(value) => handleAnimationChange('in', { endFrame: value })}
                                min={0}
                                max={component.durationInFrames ?? 150}
                            />
                        </div>

                        {/* Exit Animation */}
                        <div style={styles.animationSection}>
                            <h4 style={styles.subsectionTitle}>Exit</h4>
                            <Select
                                label="Type"
                                value={animation.out.type}
                                options={ANIMATION_OPTIONS}
                                onChange={(value) => handleAnimationChange('out', { type: value as AnimationType })}
                            />
                            <Slider
                                label="Start Frame"
                                value={animation.out.startFrame}
                                onChange={(value) => handleAnimationChange('out', { startFrame: value })}
                                min={0}
                                max={component.durationInFrames ?? 150}
                            />
                            <Slider
                                label="End Frame"
                                value={animation.out.endFrame}
                                onChange={(value) => handleAnimationChange('out', { endFrame: value })}
                                min={0}
                                max={component.durationInFrames ?? 150}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: theme.spacing.md,
        padding: theme.spacing.md,
    },
    section: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: theme.spacing.sm,
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
        margin: 0,
        fontSize: theme.fontSizes.lg,
        color: theme.colors.text.primary,
    },
    subsectionTitle: {
        margin: 0,
        marginBottom: theme.spacing.sm,
        fontSize: theme.fontSizes.md,
        color: theme.colors.text.secondary,
    },
    uploadButtons: {
        display: 'flex',
        gap: theme.spacing.sm,
    },
    uploadButton: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.text.primary,
        border: 'none',
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        cursor: 'pointer',
        flex: 1,
    },
    positionButton: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.text.primary,
        border: 'none',
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        cursor: 'pointer',
        marginTop: theme.spacing.sm,
        width: '100%',
    },
    closeButton: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.text.primary,
        border: 'none',
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        cursor: 'pointer',
    },
    preview: {
        width: '100%',
        height: 'auto',
        borderRadius: theme.borderRadius.sm,
        marginTop: theme.spacing.sm,
    },
    error: {
        color: theme.colors.error,
        marginTop: theme.spacing.sm,
    },
    pexelsSearch: {
        marginTop: theme.spacing.md,
    },
    searchBar: {
        display: 'flex',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    searchInput: {
        backgroundColor: theme.colors.background.secondary,
        color: theme.colors.text.primary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        flex: 1,
    },
    searchButton: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.text.primary,
        border: 'none',
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        cursor: 'pointer',
    },
    pexelsResults: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: theme.spacing.sm,
        maxHeight: '300px',
        overflowY: 'auto' as const,
    },
    pexelsImage: {
        cursor: 'pointer',
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
        backgroundColor: theme.colors.background.secondary,
        '&:hover': {
            opacity: 0.8,
        },
    },
    pexelsThumbnail: {
        width: '100%',
        height: '100px',
        objectFit: 'cover' as const,
    },
    photographerCredit: {
        padding: theme.spacing.xs,
        fontSize: theme.fontSizes.xs,
        color: theme.colors.text.secondary,
        textAlign: 'center' as const,
    },
    imageUrl: {
        marginTop: theme.spacing.sm,
        fontSize: theme.fontSizes.sm,
        color: theme.colors.text.secondary,
    },
    animationSection: {
        marginTop: theme.spacing.md,
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.sm,
    },
}; 