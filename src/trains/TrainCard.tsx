import { Card, CardBody, CardHeader, Col, Image, Row } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import { Train, TrainStatus } from './Train';
import { TrainCommandsPanel } from './TrainCommandsPanel';
import { TrainStore } from './TrainStore';
import { BehaviorSubject } from 'rxjs';
import { TrainConnectPanel } from './TrainConnectPanel';

export function TrainCard(props: {
    train: Train
}) {
    const { train } = props;
    const trainStore = useMemo(() => new TrainStore(train), [])
    const status = useObservable(trainStore.status$)

    return (
        <Card>
            <CardHeader>{train.name}</CardHeader>
            <CardBody>
                <Row>
                    <Col sm={3}>
                        <Image src={train.imageSrc} fluid />
                    </Col>
                    <Col sm={9}>
                        {
                            status === TrainStatus.Connected
                                ? <TrainCommandsPanel
                                    commands={trainStore} />
                                : <TrainConnectPanel
                                    status={status}
                                    connect={trainStore.connect} />
                        }
                    </Col>
                </Row>
            </CardBody>
        </Card>
    )
}

function useObservable<T>(subject: BehaviorSubject<T>): T {

    const [value, setValue] = useState<T>(subject.value);

    useEffect(() => {
        const sub = subject.subscribe(setValue)

        return () => sub.unsubscribe()
    }, [subject])

    return value
}