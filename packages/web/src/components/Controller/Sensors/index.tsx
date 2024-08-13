import React from 'react';
import { observer } from 'mobx-react-lite';
import AccelerometerVis from "./AccelerometerVis";
import GyroscopeVis from "./GyroscopeVis";

type Props = {
  gyroscope: boolean,
  accelerometer: boolean,
}

const Sensors = (props: Props) => {
  const { gyroscope, accelerometer } = props;

  return (
    <div>
      { gyroscope && <GyroscopeVis />}
      { accelerometer && <AccelerometerVis />}
    </div>
  )
};

export default observer(Sensors);