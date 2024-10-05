
export interface ITrainCommands {
    sendBeep: (trainId: number) => Promise<void>;
    sendStop: (trainId: number) => Promise<void>;
    sendSpeedUp: (trainId: number) => Promise<void>;
    sendSpeedDown: (trainId: number) => Promise<void>;
    sendLightToggle: (trainId: number) => Promise<void>;
}
