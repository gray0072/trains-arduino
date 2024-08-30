import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { ITrandCommands } from './ITrandCommands';

export function TrainCommandsPanel(props: {
    commands: ITrandCommands
}) {
    const { commands } = props;

    const [speed, setSpeed] = useState<number>(0);
    const [isLightOn, setIsLightOn] = useState<boolean>(false);

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
