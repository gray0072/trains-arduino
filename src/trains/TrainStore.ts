import { BehaviorSubject } from "rxjs";
import { Train, TrainStatus } from "./Train";
import { ITrainCommands } from "./ITrainCommands";

export class TrainStore implements ITrainCommands {

    constructor(private train: Train) {
    }

    status$ = new BehaviorSubject<TrainStatus>(TrainStatus.NotConnected)
    speed$ = new BehaviorSubject<number>(0)
    private device: BluetoothDevice | null = null
    private characteristic: BluetoothRemoteGATTCharacteristic | null = null

    connect = async () => {
        try {
            this.status$.next(TrainStatus.Connecting)
                this.device = await navigator.bluetooth.requestDevice({
                    filters: [{ name: this.train.bluetoothDeviceName }],
                    optionalServices: [this.train.bluetoothServiceId]
                });

            const server = await this.device.gatt!.connect();
            this.device.ongattserverdisconnected = () => {
                this.status$.next(TrainStatus.NotConnected)
            }
            const service = await server.getPrimaryService(this.train.bluetoothServiceId);
            this.characteristic = await service.getCharacteristic(this.train.bluetoothCharacteristicId);

            this.characteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
            await this.characteristic.startNotifications();

            this.status$.next(TrainStatus.Connected)
        } catch (error) {
            this.status$.next(TrainStatus.Error)
            console.error('Error:', error);
        }
    }

    handleCharacteristicValueChanged = (event: any) => {
        const value = new TextDecoder().decode(event.target.value);
        console.log('Received Value: ', value);
    }

    sendCommand = async (command: string) => {
        if (this.characteristic) {
            const encoder = new TextEncoder();
            const data = encoder.encode(command);
            try {
                await this.characteristic.writeValue(data);
            }
            catch (error) {
                console.error('sendCommand error:', error);
            }
        } else {
            console.error('Characteristic not found');
        }
    }

    public sendBeep = async () => {
        await this.sendCommand("BEEP")
    }

    public sendLightOn = async () => {
        await this.sendCommand("LIGHT_ON")
    }

    public sendLightOff = async () => {
        await this.sendCommand("LIGHT_OFF")
    }

    public sendSpeed = async (speed: number) => {
        this.speed$.next(speed)
        await this.sendCommand("SPEED_" + speed)
    }
}