import { Alert, Button, Spinner } from 'react-bootstrap';
import { TrainStatus } from './Train';

export function TrainConnectPanel(props: {
    status: TrainStatus
    connect: () => void
}) {
    const { status, connect } = props;

    const handleConnectClick = async () => {
        connect()
    };

    return (
        <div>
            <Alert variant={status === TrainStatus.Error ? "danger" : "info"} >
                {status}
            </Alert>
            {
                [TrainStatus.NotConnected, TrainStatus.Error].includes(status) &&
                <Button size="lg"
                    variant="primary"
                    onClick={handleConnectClick}>
                    Connect
                </Button>
            }
            {
                status === TrainStatus.Connecting &&
                <Spinner size="sm" />
            }
        </div>
    );
}
