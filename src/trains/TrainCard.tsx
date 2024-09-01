import { Card, CardBody, Col, Image, Row } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import { Train, TrainStatus } from './Train';
import { TrainCommandsPanel } from './TrainCommandsPanel';
import { TrainStore } from './TrainStore';
import { BehaviorSubject, Observable } from 'rxjs';
import { TrainConnectPanel } from './TrainConnectPanel';

export function TrainCard(props: {
    train: Train
}) {
    const { train } = props;
    const trainStore = useMemo(() => new TrainStore(train), [train])
    const status = useObservable(trainStore.status$)
    const speed = useObservable(trainStore.speed$)

    return (
        <Card style={{ minHeight: "50vh" }}>
            {/*
            <CardHeader>{train.name}</CardHeader>
            */}
            <CardBody>
                <Row>
                    <Col xs={8} sm={3} className="offset-2 offset-sm-0">
                        <Image
                            src={train.imageSrc}
                            fluid
                            style={speed < 0 ? { transform: "scaleX(-1)" } : {}} />
                    </Col>
                    <Col sm={9} className="mt-3 mt-md-0">
                        {
                            status === TrainStatus.Connected
                                ? <TrainCommandsPanel
                                    train={train}
                                    commands={trainStore} />
                                : <TrainConnectPanel
                                    status={status}
                                    connect={trainStore.connect} />
                        }
                    </Col>
                </Row>
            </CardBody>
        </Card >
    )
}

export function useObservable<T>(subject: BehaviorSubject<T>): T {

    const [value, setValue] = useState<T>(subject.value);

    useEffect(() => {
        const sub = subject.subscribe(setValue)

        return () => sub.unsubscribe()
    }, [subject])

    return value
}

export function useObservableAction<T>(subject: Observable<T> | null | undefined, action: (value: T) => void): void {
    useEffect(() => {
        if (subject) {
            const sub = subject.subscribe(action)

            return () => sub.unsubscribe()
        }
    }, [subject, action])
}