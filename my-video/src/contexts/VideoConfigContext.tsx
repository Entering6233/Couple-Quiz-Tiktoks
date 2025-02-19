import React, { createContext, useContext } from 'react';

interface VideoConfig {
    fps?: number;
    width?: number;
    height?: number;
    durationInFrames?: number;
}

const defaultConfig: VideoConfig = {
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 300,
};

const VideoConfigContext = createContext<VideoConfig>(defaultConfig);

export const VideoConfigProvider: React.FC<{ children: React.ReactNode; config?: VideoConfig }> = ({ 
    children, 
    config = {} 
}) => {
    const mergedConfig = { ...defaultConfig, ...config };
    return (
        <VideoConfigContext.Provider value={mergedConfig}>
            {children}
        </VideoConfigContext.Provider>
    );
};

export const useVideoConfig = () => useContext(VideoConfigContext); 

