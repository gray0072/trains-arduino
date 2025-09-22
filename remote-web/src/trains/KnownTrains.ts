import { Train } from "./Train";
import trainBlue from '../assets/train-blue.jpg';
import trainGreen from '../assets/train-green.jpg';

export const knownTrains: Train[] = [
    {
        id: 1,
        name: "Green train",
        imageSrc: trainGreen,
        voiceCommands: {
            "en-US": "green",
            "ru-RU": "зелёный",
        },
    },
    {
        id: 2,
        name: "Blue train",
        imageSrc: trainBlue,
        voiceCommands: {
            "en-US": "blue",
            "ru-RU": "синий",
        },
    },
]