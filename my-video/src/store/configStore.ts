import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

interface ConfigState {
    elevenLabsApiKey: string;
    pexelsApiKey: string;
    setElevenLabsApiKey: (key: string) => void;
    setPexelsApiKey: (key: string) => void;
}

type ConfigPersist = (
    config: (
        set: (state: Partial<ConfigState>) => void,
        get: () => ConfigState,
    ) => ConfigState,
    options: PersistOptions<ConfigState>
) => any;

export const useConfigStore = create<ConfigState>(
    (persist as ConfigPersist)(
        (set) => ({
            elevenLabsApiKey: '',
            pexelsApiKey: '',
            setElevenLabsApiKey: (key: string) => set({ elevenLabsApiKey: key }),
            setPexelsApiKey: (key: string) => set({ pexelsApiKey: key }),
        }),
        {
            name: 'video-maker-config',
        }
    )
); 