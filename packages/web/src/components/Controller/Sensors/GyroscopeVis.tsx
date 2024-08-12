import React from 'react';
import { observer } from 'mobx-react-lite';
import { useSensors } from "../../../contexts/sensorsContext";

const GyroscopeVis = () => {
  const sensorData = useSensors();

  return (
    <div>
      <div>gyroscope</div>
      <div className="text-muted small font-monospace">
        <div>
          orientation: { sensorData.orientation.landscape ? 'landscape' : 'portrait' }
        </div>
        <div>
          angle: { sensorData.orientation.angle }
        </div>
      </div>
    </div>
  )
};

export default observer(GyroscopeVis);