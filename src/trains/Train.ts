
export type Train = {
    name: string;
    imageSrc: string;
    bluetoothDeviceName: string;
    bluetoothServiceId: string;
    bluetoothCharacteristicId: string;
    voiceCommands: { [key: string]: string };
}

export enum TrainStatus {
    NotConnected = "NotConnected",
    Connecting = "Connecting",
    Connected = "Connected",
    Error = "Error",
}