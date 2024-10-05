import "bootstrap-icons/font/bootstrap-icons.css";
import TrainsView from './trains/TrainsView';
import { BluetoothStatus, BluetoothStore } from "./trains/BluetoothStore";
import { BluetoothConnectPanel } from "./trains/BluetoothConnectPanel";
import { useMemo } from "react";
import { useObservable } from "./trains/TrainCard";
import { ITrainCommands } from "./trains/ITrainCommands";
import React from "react";

export const TrainCommandsContext = React.createContext<ITrainCommands | null>(null);

export default function App() {

    const bluetoothStore = useMemo(() => new BluetoothStore(), [])
    const status = useObservable(bluetoothStore.status$)

    return (
        <TrainCommandsContext.Provider value={bluetoothStore}>
            {
                status === BluetoothStatus.Connected
                    ? <TrainsView />
                    : <BluetoothConnectPanel
                        status={status}
                        connect={bluetoothStore.connect} />
            }
        </TrainCommandsContext.Provider>
    );
}