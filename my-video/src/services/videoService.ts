import { Script } from '../types/script';
import axios from 'axios';

const RENDER_SERVICE_URL = 'http://localhost:29382';
const PADDING_FRAMES = 150; // 5 seconds at 30fps

export const addBackgroundToHistory = (script: Script, background: Script['settings']['background']) => {
  if (!background) return script;

  const newScript = { ...script };
  if (!newScript.settings.backgroundHistory) {
    newScript.settings.backgroundHistory = [];
  }

  // Add current background to history
  newScript.settings.backgroundHistory.push({
    ...background,
    timestamp: Date.now(),
    title: `Background ${newScript.settings.backgroundHistory.length + 1}`,
  });

  // Keep only the last 10 backgrounds
  if (newScript.settings.backgroundHistory.length > 10) {
    newScript.settings.backgroundHistory = newScript.settings.backgroundHistory.slice(-10);
  }

  return newScript;
};

export const exportVideo = async (script: Script): Promise<string> => {
  try {
    console.log('Starting video export process...', { script });
    
    // Calculate total duration including padding
    const totalDuration = script.components.reduce((max, comp) => {
      const endFrame = (comp.startFrame || 0) + (comp.durationInFrames || 0);
      return Math.max(max, endFrame);
    }, 150);

    // Add padding frames to the start
    const paddedScript = {
      ...script,
      components: script.components.map(comp => ({
        ...comp,
        startFrame: (comp.startFrame || 0) + PADDING_FRAMES,
      })),
    };
    
    // Use our Python proxy service
    const response = await axios.post(`${RENDER_SERVICE_URL}/render`, {
      composition: {
        id: 'ScriptVideo',
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: totalDuration + PADDING_FRAMES,
        props: {
          script: paddedScript,
        },
      },
      serveUrl: process.env.REMOTION_SERVE_URL || 'http://localhost:3001',
      codec: 'h264',
      imageFormat: 'jpeg',
      // Add trim configuration
      trimConfig: {
        startFrame: PADDING_FRAMES,
        endFrame: totalDuration + PADDING_FRAMES,
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Render API Response:', response.data);

    if (!response.data.success) {
      console.error('API Error:', response.data);
      throw new Error(response.data.error || 'Failed to render video');
    }

    const outputLocation = response.data.outputLocation;
    if (!outputLocation) {
      console.error('API Response:', response.data);
      throw new Error('No output location received from render service');
    }

    return outputLocation;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw new Error(error.response?.data?.error || error.message);
    }
    console.error('Error in video export:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}; 