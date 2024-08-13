import React, {useEffect, useState} from 'react';
import { observer } from 'mobx-react-lite';
import {Acceleration, useSensors} from "../../../contexts/sensorsContext";
import Axis from "./Axis";
import {useSocket} from "../../../hooks/useSocket";

const AccelerometerVis = () => {
  const socket = useSocket();
  const sensorData = useSensors();

  const [ currentData, setCurrentData ] = useState<Acceleration>({
    x: 0,
    y: 0,
    z: 0,
    rotation: {
      alpha: 0,
      beta: 0,
      gamma: 0,
    }
  });
  const rotationRateMultiplier = 5;

  useEffect(() => {
    const newData = {
      x: Math.round(sensorData.acceleration.x || 0),
      y: Math.round(sensorData.acceleration.y || 0),
      z: Math.round(sensorData.acceleration.z || 0),
      rotation: {
        alpha: Math.round(sensorData.acceleration.rotation.alpha),
        beta: Math.round(sensorData.acceleration.rotation.beta),
        gamma: Math.round(sensorData.acceleration.rotation.gamma),
      }
    };

    if ((newData.x !== currentData.x) && (newData.y !== currentData.y) && (newData.z !== currentData.z)) {
      socket.emit('OSC_CTRL_MESSAGE', {
        message: 'motion',
        ...newData,
      });
    }

    setCurrentData(newData);
  }, [ sensorData.acceleration ])

  return (
    <div>
      <div>accelerometer</div>

      <div className="d-flex">
        <div className="d-flex me-3">
          <Axis label={'x'} value={currentData.x}  />
          <Axis label={'y'} value={currentData.y}  />
          <Axis label={'z'} value={currentData.z}  />
        </div>

        <div className="d-flex">
          <Axis label={'a'} value={currentData.rotation.alpha}/>
          <Axis label={'b'} value={currentData.rotation.beta}/>
          <Axis label={'g'} value={currentData.rotation.gamma}/>
        </div>
      </div>
    </div>
  )
};

export default observer(AccelerometerVis);