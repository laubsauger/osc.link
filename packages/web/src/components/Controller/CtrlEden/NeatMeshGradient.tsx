import React, { useEffect, useRef, useState } from 'react';
import { NeatConfig, NeatGradient } from '../../../utils/neatGradient';

export const neatMeshGradientConfig: NeatConfig = {
  "colors": [
    {
      "color": "#ffbe0b",
      "enabled": true
    },
    {
      "color": "#fb5607",
      "enabled": true
    },
    {
      "color": "#ff006e",
      "enabled": true
    },
    {
      "color": "#8338ec",
      "enabled": true
    },
    {
      "color": "#3a86ff",
      "enabled": false
    }
  ],
  "speed": 4,
  "horizontalPressure": 2,
  "verticalPressure": 2,
  "waveFrequencyX": 1,
  "waveFrequencyY": 2,
  "waveAmplitude": 7,
  "shadows": 6,
  "highlights": 4,
  "colorBrightness": 1.15,
  "colorSaturation": -3,
  "wireframe": true,
  "colorBlending": 5,
  "backgroundColor": "#000000",
  "backgroundAlpha": 1,
  "resolution": 0.3
}

const NeatMeshGradient = () => {
  const [ neatInstance, setNeatInstance ] = useState<NeatGradient>()
  const ref = useRef(null)

  useEffect(() => {
    let neat

    if (ref && ref.current) {
      neat = new NeatGradient({
        ref: ref.current,
        ...neatMeshGradientConfig
      })

      setNeatInstance(neat)
    }
  }, [ref]);

  useEffect(() => {
    if (neatInstance) {
      neatInstance.speed = 3
    }

    return () => {
      neatInstance?.destroy()
    }
  }, [neatInstance]);

  console.log({ neatInstance })

  return (
    <canvas ref={ref} className="position-absolute h-100 w-100" style={{ inset: 0 }}>
      alt
    </canvas>
  )
}

export default NeatMeshGradient