import "bootstrap-icons/font/bootstrap-icons.css";
import TrainsView from './trains/TrainsView';
import { BluetoothStatus, BluetoothStore } from "./trains/BluetoothStore";
import { BluetoothConnectPanel } from "./trains/BluetoothConnectPanel";
import { useEffect, useMemo } from "react";
import { useObservable } from "./trains/TrainCard";
import { ITrainCommands } from "./trains/ITrainCommands";
import React from "react";
import { setUpdateIdle } from "./appUpdate";

export const TrainCommandsContext = React.createContext<ITrainCommands | null>(null);

export default function App() {

    const bluetoothStore = useMemo(() => new BluetoothStore(), [])
    const status = useObservable(bluetoothStore.status$)
    // A new deploy reloads the page only while no train is connected (appUpdate.ts).
    const idle = status !== BluetoothStatus.Connected && status !== BluetoothStatus.Connecting
    useEffect(() => setUpdateIdle(idle), [idle])

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