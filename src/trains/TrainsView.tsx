
import { knownTrains } from './KnownTrains';
import { TrainCard } from './TrainCard';

export default function TrainsView() {

    return (
        <div>
            {
                knownTrains.map(train =>
                    <TrainCard
                        key={train.name}
                        train={train} />
                )
            }
        </div>
    )
}