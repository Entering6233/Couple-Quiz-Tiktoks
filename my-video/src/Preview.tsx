import React, { useEffect, useState } from 'react';
import { Composition } from 'remotion';
import { ScriptVideo } from './components/Video/ScriptVideo';
import { Script } from './types/script';

interface CustomFont {
    name: string;
    url: string;
    format: 'truetype' | 'opentype';
}

export const Preview: React.FC = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [renderKey, setRenderKey] = useState(0);
    const searchParams = new URLSearchParams(window.location.search);
    const scriptData = searchParams.get('props');
    
    useEffect(() => {
        const loadFonts = async () => {
            setFontsLoaded(false);
            try {
                const response = await fetch('http://localhost:3003/fonts/dictionary');
                if (!response.ok) throw new Error('Failed to load font dictionary');
                const fontDict = await response.json();
                console.log('Font dictionary:', fontDict);

                if (!scriptData) return;
                const script: Script = JSON.parse(decodeURIComponent(scriptData));

                // Get unique font families used in components
                const usedFonts = new Set<string>();
                script.components.forEach(comp => {
                    if (comp.type === 'text' || comp.type === 'title') {
                        const textComp = comp as { style?: { fontFamily?: string } };
                        if (textComp.style?.fontFamily) {
                            usedFonts.add(textComp.style.fontFamily);
                            console.log('Found font:', textComp.style.fontFamily);
                        }
                    }
                });

                // Load each used font
                const fontLoadPromises = Array.from(usedFonts).map(async fontName => {
                    const fontData = fontDict[fontName];
                    if (fontData?.url) {
                        try {
                            console.log('Loading font:', fontName, 'from URL:', fontData.url);
                            const font = new FontFace(fontName, `url(${fontData.url})`);
                            const loadedFont = await font.load();
                            document.fonts.add(loadedFont);
                            console.log('Successfully loaded font:', fontName);
                            return true;
                        } catch (error) {
                            console.error('Error loading font:', fontName, error);
                            return false;
                        }
                    }
                    return false;
                });

                // Wait for all fonts to load
                await Promise.all(fontLoadPromises);
                setFontsLoaded(true);
                setRenderKey(prev => prev + 1);
                console.log('All fonts loaded, forcing re-render');
            } catch (error) {
                console.error('Error loading fonts:', error);
                setFontsLoaded(true);
            }
        };

        loadFonts();

        // Listen for font updates
        const handleFontsUpdated = () => {
            console.log('Fonts updated, reloading...');
            loadFonts();
        };

        window.addEventListener('fontsUpdated', handleFontsUpdated);
        return () => {
            window.removeEventListener('fontsUpdated', handleFontsUpdated);
        };
    }, [scriptData]);
    
    if (!scriptData) {
        console.error('No script data provided');
        return <div>Error: No script data provided</div>;
    }

    if (!fontsLoaded) {
        return <div>Loading fonts...</div>;
    }

    try {
        const script: Script = JSON.parse(decodeURIComponent(scriptData));
        console.log('Preview rendering with script:', script);

        if (!script || typeof script !== 'object') {
            throw new Error('Invalid script data format');
        }

        if (!script.id || !script.title || !Array.isArray(script.components) || !Array.isArray(script.captionTracks)) {
            throw new Error('Missing required script properties');
        }

        const totalDuration = Math.max(
            ...script.components.map(comp => {
                const start = comp.startFrame || 0;
                const duration = comp.durationInFrames || 150;
                return start + duration;
            }),
            300
        );

        return (
                <Composition
                    key={renderKey}
                    id="ScriptVideo"
                    component={ScriptVideo}
                    durationInFrames={totalDuration}
                    fps={30}
                    width={1080}
                    height={1920}
                    defaultProps={{ script }}
                />
        );
    } catch (error) {
        console.error('Error parsing preview props:', error);
        return <div>Error: Invalid script data - {(error as Error).message}</div>;
    }
}; 