
import { useEffect, useMemo } from 'react';
import { knownTrains } from './KnownTrains';
import { TrainCard, useObservable } from './TrainCard';
import { ISpeechCommands, SpeechCommands } from './SpeechCommands';
import React from 'react';
import { Button, Card, CardBody } from 'react-bootstrap';

export const SpeechCommandsContext = React.createContext<ISpeechCommands | null>(null);

export default function TrainsView() {

    const speechCommands = useMemo<SpeechCommands>(() => new SpeechCommands(knownTrains, 'ru-RU'), []);
    useEffect(() => {
        speechCommands.init()

        return () => speechCommands.stop()
    }, [speechCommands])
    const recognitionStarted = useObservable(speechCommands.recognitionStarted$)

    return (
        <SpeechCommandsContext.Provider value={speechCommands}>
            <div>
                {
                    knownTrains.map(train =>
                        <TrainCard
                            key={train.name}
                            train={train} />
                    )
                }

                <Card>
                    <CardBody>
                        {
                            recognitionStarted
                                ? <Button size="lg"
                                    variant="danger"
                                    onClick={() => speechCommands.stop()}>
                                    Stop recognition
                                </Button>
                                : <Button size="lg"
                                    variant="primary"
                                    onClick={() => speechCommands.start()}>
                                    Start recognition
                                </Button>
                        }
                    </CardBody>
                </Card>
            </div>
        </SpeechCommandsContext.Provider>
    )
}