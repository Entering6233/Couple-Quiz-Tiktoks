import React, { useState, useEffect } from 'react';
import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { ScriptVideo } from './components/Video/ScriptVideo';
import { Script } from './types/script';

// Preview component that uses the background path
const Preview: React.FC = () => {
  const [backgroundPath, setBackgroundPath] = useState<string | null>(null);
  const searchParams = new URLSearchParams(window.location.search);
  const scriptData = searchParams.get('props');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).updateBackgroundPath = (path: string) => {
        console.log('Updating background path:', path);
        // Convert Windows path to URL format
        const urlPath = path.replace(/\\/g, '/');
        setBackgroundPath(`file:///${urlPath}`);
      };
    }
  }, []);

  if (!scriptData) {
    return <div>No script data provided</div>;
  }

  try {
    const script = JSON.parse(decodeURIComponent(scriptData)) as Script;
    console.log('Preview received script:', script);

    // Update script with current background path if available
    if (backgroundPath && script.settings?.background) {
      script.settings.background.url = backgroundPath;
    }

    return (
        <Composition
          id="ScriptVideo"
          component={ScriptVideo}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            script
          }}
        />
    );
  } catch (error) {
    console.error('Error parsing script data:', error);
    return <div>Error parsing script data</div>;
  }
};

registerRoot(Preview); 