
export type Train = {
    id: number;
    name: string;
    imageSrc: string;
    voiceCommands: { [key: string]: string };
}