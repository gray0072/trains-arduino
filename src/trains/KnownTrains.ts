import { Train } from "./Train";
import trainBlue from '../assets/train-blue.jpg';
import trainGreen from '../assets/train-green.jpg';

export const knownTrains: Train[] = [
    {
        name: "Green train",
        imageSrc: trainGreen,
        bluetoothDeviceName: "TrainGreen",
        bluetoothServiceId: "12345678-1234-1234-1234-123456789001",
        bluetoothCharacteristicId: "87654321-4321-4321-4321-9876543210ab",
    },
    {
        name: "Blue train",
        imageSrc: trainBlue,
        bluetoothDeviceName: "TrainBlue",
        bluetoothServiceId: "12345678-1234-1234-1234-123456789002",
        bluetoothCharacteristicId: "87654321-4321-4321-4321-9876543210ab",
    },
]