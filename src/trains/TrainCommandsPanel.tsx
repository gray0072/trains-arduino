import { Button } from 'react-bootstrap';
import { useContext } from 'react';
import { SpeechCommandsContext } from './TrainsView';
import { useObservableAction } from './TrainCard';
import { Train } from './Train';
import { TrainCommandsContext } from '../App';

export function TrainCommandsPanel(props: {
    train: Train
}) {
    const { train } = props;

    const speechCommands = useContext(SpeechCommandsContext)
    const trainCommands = useContext(TrainCommandsContext)
    useObservableAction(speechCommands?.recognizedBeep$, async (trainId: number) => {
        if (trainId === train.id) {
            await trainCommands?.sendBeep(trainId)
        }
    })
    useObservableAction(speechCommands?.recognizedStop$, async (trainId: number) => {
        if (trainId === train.id) {
            await trainCommands?.sendStop(trainId)
        }
    })
    useObservableAction(speechCommands?.recognizedSpeedUp$, async (trainId: number) => {
        if (trainId === train.id) {
            await trainCommands?.sendSpeedUp(trainId)
        }
    })
    useObservableAction(speechCommands?.recognizedSpeedDown$, async (trainId: number) => {
        if (trainId === train.id) {
            await trainCommands?.sendSpeedDown(trainId)
        }
    })
    useObservableAction(speechCommands?.recognizedLightToggle$, async (trainId: number) => {
        if (trainId === train.id) {
            await trainCommands?.sendLightToggle(trainId)
        }
    })

    const handleBeepClick = async () => {
        await trainCommands?.sendBeep(train.id)
    };

    const handleStopClick = async () => {
        await trainCommands?.sendStop(train.id)
    };

    const handleSpeedUpClick = async () => {
        await trainCommands?.sendSpeedUp(train.id)
    };

    const handleSpeedDownClick = async () => {
        await trainCommands?.sendSpeedDown(train.id)
    };

    const handleLightToggleClick = async () => {
        await trainCommands?.sendLightToggle(train.id)
    };

    return (
        <div>
            <div className="d-flex gap-3 mb-4 justify-content-center justify-content-sm-start">
                <Button size="lg"
                    onClick={() => handleBeepClick()}>
                    <i className="bi bi-volume-up"> </i>
                    Beep
                </Button>
                <Button
                    size="lg"
                    variant={"light"}
                    onClick={() => handleLightToggleClick()}>
                    <i className="bi bi-lightbulb"> </i>
                    Light
                </Button>
            </div>
            <div className="d-flex gap-3 mb-4 justify-content-center justify-content-sm-start">
                <Button
                    size="lg"
                    variant="success"
                    onClick={() => handleSpeedUpClick()}>
                    <i className="bi bi-arrow-up"> </i>
                    Speed up
                </Button>
                <Button
                    size="lg"
                    variant="warning"
                    onClick={() => handleSpeedDownClick()}>
                    <i className="bi bi-arrow-down"> </i>
                    Speed down
                </Button>
            </div>
            <div className="d-flex gap-3 mb-4 justify-content-center justify-content-sm-start">
                <Button
                    size="lg"
                    variant="danger"
                    onClick={() => handleStopClick()}>
                    <i className="bi bi-sign-stop"> </i>
                    Stop
                </Button>
            </div>
        </div>
    );
}
