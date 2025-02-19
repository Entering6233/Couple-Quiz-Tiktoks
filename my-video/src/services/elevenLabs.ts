import axios, { AxiosError } from 'axios';
import { WordTiming } from '../types/script';
import { useApiKeys } from '../store/apiKeysStore';

interface GenerateSpeechParams {
    text: string;
    voiceId: string;
    settings?: {
        stability?: number;
        similarity_boost?: number;
    };
}

export async function generateSpeech({ text, voiceId, settings = {} }: GenerateSpeechParams): Promise<{ audioUrl: string, wordTimings: WordTiming[] }> {
    console.log('[generateSpeech] Starting with params:', { text, voiceId, settings });
    
    const { elevenLabsApiKey } = useApiKeys.getState();
    console.log('[generateSpeech] Got API key:', elevenLabsApiKey ? 'Present' : 'Missing');

    if (!elevenLabsApiKey) {
        console.error('[generateSpeech] API key is missing');
        throw new Error('ElevenLabs API key is not set. Please set it in the settings menu.');
    }

    // Prepare request body
    const requestBody = {
        text,
        voiceId,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
            stability: settings.stability ?? 0.75,
            similarity_boost: settings.similarity_boost ?? 0.75
        },
        apiKey: elevenLabsApiKey
    };
    console.log('[generateSpeech] Prepared request body:', requestBody);

    try {
        // Generate audio with ElevenLabs
        console.log('[generateSpeech] Sending request to:', `http://localhost:3005/generate_voice`);
        const audioResponse = await axios.post(
            `http://localhost:3005/generate_voice`,
            requestBody
        );
        console.log('[generateSpeech] Received response:', audioResponse.data);

        return {
            audioUrl: audioResponse.data.url,
            wordTimings: audioResponse.data.wordTimings || []
        };
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('[generateSpeech] Error details:', {
            error: axiosError.message,
            response: axiosError.response?.data,
            status: axiosError.response?.status,
            headers: axiosError.response?.headers
        });
        throw error;
    }
}

export async function generateCaptions(audioBlob: Blob): Promise<WordTiming[]> {
    console.log('[generateCaptions] Starting with audio blob size:', audioBlob.size);
    
    // Create form data for the transcription request
    const formData = new FormData();
    formData.append('audio', audioBlob, 'speech.mp3');

    try {
        // Send to Whisper service for transcription
        console.log('[generateCaptions] Sending request to transcription service');
        const transcriptionResponse = await axios.post('http://localhost:5000/transcribe', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('[generateCaptions] Received response:', transcriptionResponse.data);

        return transcriptionResponse.data.wordTimings;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('[generateCaptions] Error:', axiosError.message);
        throw error;
    }
} 