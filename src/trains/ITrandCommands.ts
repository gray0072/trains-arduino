
export interface ITrandCommands {
    sendBeep: () => Promise<void>;
    sendLightOn: () => Promise<void>;
    sendLightOff: () => Promise<void>;
    sendSpeed: (speed: number) => Promise<void>;
}
