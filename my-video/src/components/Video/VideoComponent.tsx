import React, { useEffect, useRef, useState } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { VideoComponent as VideoComponentType } from '../../types/script';
import { getAnimationStyle } from '../../utils/animation';

interface VideoComponentProps {
    component: VideoComponentType;
}

export const VideoComponent: React.FC<VideoComponentProps> = ({ component }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const [proxyUrl, setProxyUrl] = useState<string | null>(null);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);

    const style = component.style || {};
    const animationStyle = getAnimationStyle(frame, fps, style.animation);

    // Calculate current video time based on frame
    const videoTime = (frame / fps) + (style.startTime || 0);

    useEffect(() => {
        const proxyVideo = async () => {
            try {
                console.log('Proxying video:', component.videoUrl);
                const response = await fetch('http://localhost:3005/proxy_video', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: component.videoUrl }),
                });

                if (!response.ok) {
                    throw new Error('Failed to proxy video');
                }

                const data = await response.json();
                console.log('Received proxy URL:', data.url);
                setProxyUrl(data.url);
            } catch (error) {
                console.error('Error proxying video:', error);
            }
        };

        if (component.videoUrl) {
            proxyVideo();
        }

        return () => {
            setProxyUrl(null);
            setVideoLoaded(false);
        };
    }, [component.videoUrl]);

    // Sync video time with timeline
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoLoaded) return;

        // Update video time
        if (Math.abs(video.currentTime - videoTime) > 0.1) {
            video.currentTime = videoTime;
        }

        // Update component duration when video metadata is loaded
        if (videoDuration === 0 && video.duration) {
            setVideoDuration(video.duration);
            // If this is a new video, update the component's duration
            if (!component.style?.duration) {
                const durationInFrames = Math.ceil(video.duration * fps);
                // You'll need to implement this update function in your state management
                // updateComponentDuration(component.id, durationInFrames);
            }
        }
    }, [frame, fps, videoLoaded, videoTime, videoDuration]);

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current || !style.chromakey?.enabled || !proxyUrl || !videoLoaded) {
            console.log('Skipping chromakey setup. Conditions:', {
                hasVideoRef: !!videoRef.current,
                hasCanvasRef: !!canvasRef.current,
                chromakeyEnabled: style.chromakey?.enabled,
                hasProxyUrl: !!proxyUrl,
                videoLoaded
            });
            return;
        }

        console.log('Setting up chromakey effect with settings:', style.chromakey);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            console.error('Failed to get canvas context');
            return;
        }

        const updateCanvasSize = () => {
            const newWidth = video.videoWidth || video.clientWidth;
            const newHeight = video.videoHeight || video.clientHeight;
            console.log('Updating canvas size:', { width: newWidth, height: newHeight });
            canvas.width = newWidth;
            canvas.height = newHeight;
        };

        const processFrame = () => {
            try {
                // Only process frame if video is at the correct time
                if (Math.abs(video.currentTime - videoTime) <= 0.1) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    if (style.chromakey?.enabled) {
                        try {
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const data = imageData.data;

                            const keyColor = style.chromakey.color || '#00ff00';
                            const r = parseInt(keyColor.slice(1, 3), 16);
                            const g = parseInt(keyColor.slice(3, 5), 16);
                            const b = parseInt(keyColor.slice(5, 7), 16);

                            const similarity = (style.chromakey.similarity || 0.4) * 255;
                            const smoothness = style.chromakey.smoothness || 0.1;

                            for (let i = 0; i < data.length; i += 4) {
                                const pixelR = data[i];
                                const pixelG = data[i + 1];
                                const pixelB = data[i + 2];

                                const diff = Math.sqrt(
                                    Math.pow(pixelR - r, 2) * 0.3 +
                                    Math.pow(pixelG - g, 2) * 0.59 +
                                    Math.pow(pixelB - b, 2) * 0.11
                                );

                                if (diff < similarity) {
                                    const alpha = Math.max(0, diff / (similarity * smoothness));
                                    data[i + 3] = Math.min(255, alpha * 255);
                                }
                            }

                            ctx.putImageData(imageData, 0, 0);
                        } catch (error) {
                            console.error('Error processing chromakey:', error);
                        }
                    }
                }

                // Request next frame
                animationFrameRef.current = requestAnimationFrame(processFrame);
            } catch (error) {
                console.error('Error processing frame:', error);
            }
        };

        updateCanvasSize();
        processFrame();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [style.chromakey, proxyUrl, videoLoaded, videoTime]);

    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        width: `${style.width || 100}%`,
        height: `${style.height || 100}%`,
        left: `${style.position?.x || 0}%`,
        top: `${style.position?.y || 0}%`,
        transform: `translate(-50%, -50%) scale(${style.scale || 1}) rotate(${style.rotation || 0}deg)`,
        opacity: style.opacity ?? 1,
        ...animationStyle,
    };

    if (!proxyUrl) {
        return <div style={containerStyle}>Loading video...</div>;
    }

    if (style.chromakey?.enabled) {
        return (
            <div style={containerStyle}>
                <video
                    ref={videoRef}
                    src={proxyUrl}
                    style={{ display: 'none' }}
                    autoPlay={false}
                    loop={false}
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    onLoadedData={() => {
                        console.log('Video loaded');
                        setVideoLoaded(true);
                    }}
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                />
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <video
                ref={videoRef}
                src={proxyUrl}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                }}
                autoPlay={false}
                loop={false}
                muted
                playsInline
                crossOrigin="anonymous"
                onLoadedData={() => setVideoLoaded(true)}
            />
        </div>
    );
}; 