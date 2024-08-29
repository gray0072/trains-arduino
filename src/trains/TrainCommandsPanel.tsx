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
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <Button size="lg"
                    onClick={() => handleBeepClick()}>
                    Beep
                </Button>
                <Button
                    size="lg"
                    variant={isLightOn ? "light" : "dark"}
                    onClick={() => handleLightClick()}>
                    Light
                </Button>
                <Button
                    size="lg"
                    variant="danger"
                    onClick={() => handleSpeedChange(0)}>
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
