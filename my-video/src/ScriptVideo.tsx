import {AbsoluteFill} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Roboto';
import React, {useEffect, useState, useRef} from 'react';
import {delayRender, continueRender} from 'remotion';

const {fontFamily} = loadFont();

export const ScriptVideo: React.FC<{
  script: any;
}> = ({script}) => {
  const [handle] = useState(() => delayRender("Loading assets"));
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const backgroundRef = useRef<HTMLVideoElement>(null);
  const preloadedImageRef = useRef<HTMLImageElement | null>(null);

  // Preload all assets at once
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // Load fonts first
        const fonts = [fontFamily];
        if (script.settings?.font) {
          fonts.push(script.settings.font);
        }
        await Promise.all(fonts.map((font) => document.fonts.load(`16px "${font}"`)));

        // Load background if exists
        if (script.settings?.background?.url) {
          if (script.settings.background.type === 'image') {
            // Preload image and keep reference
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = script.settings.background.url;
            });
            preloadedImageRef.current = img;
          } else if (script.settings.background.type === 'video') {
            // Preload video
            const video = document.createElement('video');
            await new Promise((resolve, reject) => {
              video.onloadeddata = resolve;
              video.onerror = reject;
              video.src = script.settings.background.url;
              video.load(); // Force load
            });
          }
        }

        // All assets loaded successfully
        setAssetsLoaded(true);
        continueRender(handle);
      } catch (err) {
        console.error('Failed to load assets:', err);
        // Continue render even if assets fail to load
        setAssetsLoaded(true);
        continueRender(handle);
      }
    };

    loadAssets();
  }, [script.settings?.background, script.settings?.font, handle]);

  // Handle video background
  useEffect(() => {
    if (backgroundRef.current && script.settings?.background?.type === 'video') {
      backgroundRef.current.load(); // Force video reload when source changes
    }
  }, [script.settings?.background?.url]);

  if (!assetsLoaded) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000000' }}>
        {/* Optional loading indicator */}
      </AbsoluteFill>
    );
  }

  const backgroundStyle = script.settings?.background?.url && script.settings.background.type === 'image' ? {
    backgroundImage: `url(${script.settings.background.url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return (
    <AbsoluteFill
      style={{
        backgroundColor: script.settings?.backgroundColor || '#000000',
        fontFamily: script.settings?.font || fontFamily,
        color: script.settings?.textColor || '#ffffff',
        ...backgroundStyle,
      }}
    >
      {script.settings?.background?.type === 'video' && (
        <video
          ref={backgroundRef}
          src={script.settings.background.url}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      {/* Your video content here */}
    </AbsoluteFill>
  );
}; 