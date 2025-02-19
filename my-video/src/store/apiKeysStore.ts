import { create } from 'zustand';

interface ApiKeysState {
    elevenLabsApiKey: string;
    pexelsApiKey: string;
    setElevenLabsApiKey: (key: string) => void;
    setPexelsApiKey: (key: string) => void;
}

export const useApiKeys = create<ApiKeysState>((set) => ({
    elevenLabsApiKey: '',
    pexelsApiKey: '',
    setElevenLabsApiKey: (key) => set({ elevenLabsApiKey: key }),
    setPexelsApiKey: (key) => set({ pexelsApiKey: key }),
})); 