import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Form, Image, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import trainBlue from './assets/train-blue.jpg';
import trainGreen from './assets/train-green.jpg';

export default function TrainsView() {

    const {
        register,
        handleSubmit,
        getValues,
        watch,
    } = useForm<PasswordFormModel>({
        defaultValues: {
            passwordLength: 16,
            useLowerCase: true,
            useUpperCase: true,
            useDigits: true,
            useSpecial: false,
        }
    });


    return (
        <div className="container">
            <Card>
                <CardHeader>Green train</CardHeader>
                <CardBody>
                    <Row>
                        <Col sm={3}>
                            <Image src={trainGreen} fluid />
                        </Col>
                        <Col sm={9}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <Button size="lg">Beep</Button>
                                <Button size="lg" variant="dark">Light</Button>
                                <Button size="lg" variant="danger">Stop</Button>
                            </div>
                            <Form.Label>Speed</Form.Label>
                            <Form.Range min={-100} max={100} />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
            <Card>
                <CardHeader>Blue train</CardHeader>
                <CardBody>
                    <Row>
                        <Col sm={3}>
                            <Image src={trainBlue} fluid />
                        </Col>
                        <Col sm={9}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <Button size="lg">Beep</Button>
                                <Button size="lg" variant="dark">Light</Button>
                                <Button size="lg" variant="danger">Stop</Button>
                            </div>
                            <Form.Label>Speed</Form.Label>
                            <Form.Range min={-100} max={100} />
                        </Col>
                    </Row>
                </CardBody>
            </Card>



        </div>
    );
}

type PasswordFormModel = {
    passwordLength: number;
    useLowerCase: boolean;
    useUpperCase: boolean;
    useDigits: boolean;
    useSpecial: boolean;
}