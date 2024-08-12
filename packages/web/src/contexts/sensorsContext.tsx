import {createContext, useCallback, useContext, useEffect, useState} from "react";

type Orientation = {
  landscape: boolean,
  angle: null|number,
}

export type Acceleration = {
  rotation: {
    alpha: number,
    beta: number,
    gamma: number,
  },
  x: null|number,
  y: null|number,
  z: null|number,
}

export const SensorsContext = createContext({
  orientation: {
    landscape: false,
    angle: 0,
  } as Orientation,
  acceleration: {
    rotation: {
      alpha: 0,
      beta: 0,
      gamma: 0,
    },
    x: 0,
    y: 0,
    z: 0,
  } as Acceleration
});

function getOrientation():Orientation {
  const { orientation } = window;

  return {
    landscape: Math.abs(orientation) === 90,
    angle: orientation,
  };
}

type Props = {
  useGravity: boolean,
  multiplier: number,
  children?: any,
};

const SensorsProvider = (props:Props) => {
  const { useGravity, multiplier, children } = props;

  const [ orientation, setOrientation ] = useState<Orientation>(getOrientation());

  const [ acceleration, setAcceleration ] = useState<Acceleration>({
    rotation: {
      alpha: 0,
      beta: 0,
      gamma: 0,
    },
    x: 0,
    y: 0,
    z: 0,
  });

  const orientationChangeListener = useCallback((event:any) => {
    setOrientation(getOrientation());
  }, []);

  const accelerationListener = useCallback((event:any) => {
    // console.log(event)
    const { landscape } = orientation;
    const acceleration = useGravity ? event.accelerationIncludingGravity : event.acceleration;
    const rotation = event.rotationRate || null;
    const { x, y, z } = acceleration;

    setAcceleration({
      rotation,
      x: (landscape ? y : x) * multiplier,
      y: (landscape ? x : y) * multiplier,
      z: z * multiplier
    });
  }, [ orientation, multiplier, useGravity ]);

  useEffect(() => {
    window.addEventListener('devicemotion', accelerationListener);
    window.addEventListener('orientationchange', orientationChangeListener);

    return () => {
      window.removeEventListener('devicemotion', accelerationListener);
      window.removeEventListener('orientationchange', orientationChangeListener);
    }
  }, [ accelerationListener, orientationChangeListener]);

  return (
    //@ts-ignore
    <SensorsContext.Provider value={{ orientation, acceleration }}>
      {children}
    </SensorsContext.Provider>
  );
};

export const useSensors = () => useContext(SensorsContext);

export default SensorsProvider;