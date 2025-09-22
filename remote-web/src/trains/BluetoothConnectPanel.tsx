import { Alert, Button, Spinner } from 'react-bootstrap';
import { BluetoothStatus } from './BluetoothStore';

export function BluetoothConnectPanel(props: {
    status: BluetoothStatus
    connect: () => void
}) {
    const { status, connect } = props;

    const handleConnectClick = async () => {
        connect()
    };

    return (
        <div>
            <Alert variant={status === BluetoothStatus.Error ? "danger" : "info"} >
                {status}
            </Alert>
            <div className="px-2">
                {
                    [BluetoothStatus.NotConnected, BluetoothStatus.Error].includes(status) &&
                    <Button size="lg"
                        variant="primary"
                        onClick={handleConnectClick}>
                        Connect
                    </Button>
                }
                {
                    status === BluetoothStatus.Connecting &&
                    <Spinner size="sm" />
                }
            </div>
        </div>
    );
}
