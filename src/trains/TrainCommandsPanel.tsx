import { Button, Form } from 'react-bootstrap';
import { useContext, useState } from 'react';
import { ITrainCommands } from './ITrainCommands';
import { SpeechCommandsContext } from './TrainsView';
import { useObservableAction } from './TrainCard';
import { Train } from './Train';

export function TrainCommandsPanel(props: {
    train: Train
    commands: ITrainCommands
}) {
    const { train, commands } = props;

    const [speed, setSpeed] = useState<number>(0);
    const [isLightOn, setIsLightOn] = useState<boolean>(false);

    const speechCommands = useContext(SpeechCommandsContext)
    useObservableAction(speechCommands?.recognizedBeep$, async (trainName: string) => {
        if (trainName === train.name) {
            await commands.sendBeep()
        }
    })
    useObservableAction(speechCommands?.recognizedLightOn$, async (trainName: string) => {
        if (trainName === train.name) {
            setIsLightOn(true)
            await commands.sendLightOn()
        }
    })
    useObservableAction(speechCommands?.recognizedLightOff$, async (trainName: string) => {
        if (trainName === train.name) {
            setIsLightOn(false)
            await commands.sendLightOff()
        }
    })
    useObservableAction(speechCommands?.recognizedSpeed$, async ({ trainName, speed }) => {
        if (trainName === train.name) {
            setSpeed(speed);
            await commands.sendSpeed(speed)
        }
    })

    const handleBeepClick = async () => {
        await commands.sendBeep()
    };

    const handleLightClick = async () => {
        const newIsLightOn = !isLightOn
        setIsLightOn(newIsLightOn)
        newIsLightOn
            ? await commands.sendLightOn()
            : await commands.sendLightOff()
    };

    const handleSpeedChange = async (speed: number) => {
        setSpeed(speed);
        await commands.sendSpeed(speed)
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
                    variant={isLightOn ? "light" : "dark"}
                    onClick={() => handleLightClick()}>
                    <i className="bi bi-lightbulb"> </i>
                    Light
                </Button>
                <Button
                    size="lg"
                    variant="danger"
                    onClick={() => handleSpeedChange(0)}>
                    <i className="bi bi-sign-stop"> </i>
                    Stop
                </Button>
            </div>
            <Form.Label>Speed: {speed}</Form.Label>
            <Form.Range
                min={-100}
                max={100}
                step={5}
                value={speed}
                onChange={x => handleSpeedChange(Number(x.target.value))} />
        </div>
    );
}
