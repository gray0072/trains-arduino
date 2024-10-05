import { BehaviorSubject } from "rxjs";
import { ITrainCommands } from "./ITrainCommands";

const bluetoothDeviceName = "TrainsRemote";
const bluetoothServiceId = "12345678-1234-1234-1234-123456789000";
const bluetoothCharacteristicId = "87654321-4321-4321-4321-9876543210ab";

export enum BluetoothStatus {
    NotConnected = "NotConnected",
    Connecting = "Connecting",
    Connected = "Connected",
    Error = "Error",
}

export class BluetoothStore implements ITrainCommands {

    status$ = new BehaviorSubject<BluetoothStatus>(BluetoothStatus.NotConnected)
    private device: BluetoothDevice | null = null
    private characteristic: BluetoothRemoteGATTCharacteristic | null = null

    connect = async () => {
        try {
            this.status$.next(BluetoothStatus.Connecting)
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ name: bluetoothDeviceName }],
                optionalServices: [bluetoothServiceId]
            });

            const server = await this.device.gatt!.connect();
            this.device.ongattserverdisconnected = () => {
                this.status$.next(BluetoothStatus.NotConnected)
            }
            const service = await server.getPrimaryService(bluetoothServiceId);
            this.characteristic = await service.getCharacteristic(bluetoothCharacteristicId);

            this.characteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged);
            await this.characteristic.startNotifications();

            this.status$.next(BluetoothStatus.Connected)
        } catch (error) {
            this.status$.next(BluetoothStatus.Error)
            console.error('Error:', error);
        }
    }

    handleCharacteristicValueChanged = (event: any) => {
        const value = new TextDecoder().decode(event.target.value);
        console.log('Received Value: ', value);
    }

    sendTrainCommand = async (trainIndex: number, command: string) => {
        if (this.characteristic) {
            const encoder = new TextEncoder();
            command = `TRAIN${trainIndex}_${command}`;
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

    public sendBeep = async (trainIndex: number) => {
        await this.sendTrainCommand(trainIndex, "CMD_BEEP")
    }

    public sendStop = async (trainIndex: number) => {
        await this.sendTrainCommand(trainIndex, "CMD_STOP")
    }

    public sendSpeedUp = async (trainIndex: number) => {
        await this.sendTrainCommand(trainIndex, "CMD_SPEED_UP")
    }

    public sendSpeedDown = async (trainIndex: number) => {
        await this.sendTrainCommand(trainIndex, "CMD_SPEED_DOWN")
    }

    public sendLightToggle = async (trainIndex: number) => {
        await this.sendTrainCommand(trainIndex, "CMD_LIGHT_TOGGLE")
    }
}