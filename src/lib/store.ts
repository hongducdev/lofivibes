import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SoundState {
    isRaining: boolean;
    isCityTraffic: boolean;
    isPeopleTalking: boolean;
    isWaves: boolean;
    isWind: boolean;
    isKeyboard: boolean;
    volume: number;
    toggleRain: () => void;
    toggleCityTraffic: () => void;
    togglePeopleTalking: () => void;
    toggleWaves: () => void;
    toggleWind: () => void;
    toggleKeyboard: () => void;
    setVolume: (volume: number) => void;
}

export const useSoundStore = create<SoundState>()(
    persist(
        (set) => ({
            isRaining: false,
            isCityTraffic: false,
            isPeopleTalking: false,
            isWaves: false,
            isWind: false,
            isKeyboard: false,
            volume: 0.5,
            toggleRain: () => set((state) => ({ isRaining: !state.isRaining })),
            toggleCityTraffic: () =>
                set((state) => ({ isCityTraffic: !state.isCityTraffic })),
            togglePeopleTalking: () =>
                set((state) => ({ isPeopleTalking: !state.isPeopleTalking })),
            toggleWaves: () => set((state) => ({ isWaves: !state.isWaves })),
            toggleWind: () => set((state) => ({ isWind: !state.isWind })),
            toggleKeyboard: () => set((state) => ({ isKeyboard: !state.isKeyboard })),
            setVolume: (volume: number) => set({ volume }),
        }),
        {
            name: "sound-storage",
        }
    )
);
