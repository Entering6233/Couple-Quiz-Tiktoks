import axios from 'axios';
import { WordTiming } from '../types/script';

const ELEVEN_LABS_API_KEY = process.env.REACT_APP_ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_VOICE_ID = process.env.REACT_APP_ELEVEN_LABS_VOICE_ID;

export async function generateSpeech(text: string): Promise<{ url: string, blob: Blob }> {
    // Generate audio with ElevenLabs
    const audioResponse = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`,
        {
            text,
            voice_settings: {
                stability: 0.75,
                similarity_boost: 0.75
            }
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVEN_LABS_API_KEY
            },
            responseType: 'blob'
        }
    );

    // Create a blob URL for the audio
    const audioBlob = new Blob([audioResponse.data], { type: 'audio/mpeg' });
    return {
        url: URL.createObjectURL(audioBlob),
        blob: audioBlob
    };
}

export async function generateCaptions(audioBlob: Blob): Promise<WordTiming[]> {
    // Create form data for the transcription request
    const formData = new FormData();
    formData.append('audio', audioBlob, 'speech.mp3');

    // Send to Whisper service for transcription
    const transcriptionResponse = await axios.post('http://localhost:5000/transcribe', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return transcriptionResponse.data.wordTimings;
} 