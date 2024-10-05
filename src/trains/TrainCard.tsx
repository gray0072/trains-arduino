import { Card, CardBody, Col, Image, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Train } from './Train';
import { TrainCommandsPanel } from './TrainCommandsPanel';
import { BehaviorSubject, Observable } from 'rxjs';

export function TrainCard(props: {
    train: Train
}) {
    const { train } = props;

    return (
        <Card style={{ minHeight: "50vh" }}>
            <CardBody>
                <Row>
                    <Col xs={8} sm={3} className="offset-2 offset-sm-0">
                        <Image
                            src={train.imageSrc}
                            fluid />
                    </Col>
                    <Col sm={9} className="mt-3 mt-md-0">
                        <TrainCommandsPanel
                            train={train} />
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