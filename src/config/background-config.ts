export type BaseVideoType = "day" | "night";
export type RainVideoType = "day-rain" | "night-rain";
export type VideoType = BaseVideoType | RainVideoType;

export interface BackgroundVideo {
    name: string;
    url: string;
    image: string;
    videos: Record<BaseVideoType, string> &
        Partial<Record<RainVideoType, string>>;
}

export const backgroundConfig: BackgroundVideo[] = [
    {
        name: "Book Cafe",
        url: "/assets/videos/book-cafe",
        image: "preview.png",
        videos: {
            day: "day.mp4",
            night: "night.mp4",
            "day-rain": "day-rain.mp4",
            "night-rain": "night-rain.mp4",
        },
    },
    {
        name: "Chill Vibes",
        url: "/assets/videos/chill-vibes",
        image: "preview.png",
        videos: {
            day: "day.mp4",
            night: "night.mp4",
            "day-rain": "day-rain.mp4",
            "night-rain": "night-rain.mp4",
        },
    },
    {
        name: "Cozy Studio",
        url: "/assets/videos/cozy-studio",
        image: "preview.png",
        videos: {
            day: "day.mp4",
            night: "night.mp4",
            "day-rain": "day-rain.mp4",
            "night-rain": "night-rain.mp4",
        },
    },
    {
        name: "Kyoto",
        url: "/assets/videos/kyoto",
        image: "preview.png",
        videos: {
            day: "day.mp4",
            night: "night.mp4",
        },
    },
    {
        name: "Seoul Inside",
        url: "/assets/videos/seoul-inside",
        image: "preview.png",
        videos: {
            day: "day.mp4",
            night: "night.mp4",
            "day-rain": "day-rain.mp4",
            "night-rain": "night-rain.mp4",
        },
    },
    {
        name: "Seoul Outside",
        url: "/assets/videos/seoul-outside",
        image: "preview.png",
        videos: {
            day: "day.mp4",
            night: "night.mp4",
            "day-rain": "day-rain.mp4",
            "night-rain": "night-rain.mp4",
        },
    },
];
