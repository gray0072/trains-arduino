
export type Train = {
    name: string;
    imageSrc: string;
    bluetoothDeviceName: string;
    bluetoothServiceId: string;
    bluetoothCharacteristicId: string;
}

export enum TrainStatus {
    NotConnected = "NotConnected",
    Connecting = "Connecting",
    Connected = "Connected",
    Error = "Error",
}