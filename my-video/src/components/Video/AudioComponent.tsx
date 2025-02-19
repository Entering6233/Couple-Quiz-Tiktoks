import React, { useEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { AudioComponent as AudioComponentType } from '../../types/script';

interface AudioComponentProps {
    component: AudioComponentType;
}

export const AudioComponent: React.FC<AudioComponentProps> = ({ component }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    useEffect(() => {
        if (!audioRef.current) return;

        // Initialize Web Audio API context and nodes
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
            sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            gainNodeRef.current = audioContextRef.current.createGain();
            sourceNodeRef.current.connect(gainNodeRef.current);
            gainNodeRef.current.connect(audioContextRef.current.destination);
        }

        const audio = audioRef.current;
        const gainNode = gainNodeRef.current;
        const startTime = component.style?.startTime ?? 0;
        const currentTime = frame / fps;

        // Set volume using gain node
        if (gainNode) {
            gainNode.gain.value = component.style?.volume ?? 1;
        }

        // Set loop
        audio.loop = component.style?.loop ?? false;

        // Calculate and set current time
        const audioTime = currentTime - startTime;
        if (audioTime >= 0) {
            audio.currentTime = audioTime;
            audio.play().catch(console.error);
        } else {
            audio.pause();
        }

        // Handle duration limit
        if (component.style?.duration) {
            const duration = component.style.duration;
            if (audioTime > duration) {
                audio.pause();
            }
        }

        // Cleanup
        return () => {
            audio.pause();
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
                sourceNodeRef.current = null;
                gainNodeRef.current = null;
            }
        };
    }, [frame, fps, component.style?.startTime, component.style?.volume, component.style?.loop, component.style?.duration]);

    const audioUrl = typeof component.audioUrl === 'string' ? component.audioUrl : component.audioUrl.url;

    return (
        <audio
            ref={audioRef}
            src={audioUrl}
            preload="auto"
            crossOrigin="anonymous"
        />
    );
}; 