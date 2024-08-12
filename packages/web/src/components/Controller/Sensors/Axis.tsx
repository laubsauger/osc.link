import React, {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";

type AxisProps = {
  label: string,
  value: null|number,
  multiplier?: number
}

const Axis = (props:AxisProps) => {
  const { label, value, multiplier } = props;

  const [ normalizedValue, setNormalizedValue ] = useState(0);

  useEffect(() => {
    if (value !== null) {
      setNormalizedValue(Math.round(Math.abs(value * (multiplier || 1))));
    }
  }, [ value ]);

  return (
    <>
      { value === null ?
        <div className="text-muted small">-</div>
        :
        <div className="position-relative">
          <div className="position-relative bg-black d-flex flex-column justify-content-around p-1"
               style={{ width: '32px', height: '128px' }}
          >
            <div className="h-100 mx-1 d-flex align-items-end">
              { value > 0.5 &&
              <div style={{ height: `${normalizedValue}%` }}
                   className="w-100 border border-info border-bottom-0">
                <div className="w-100 h-100 bg-info bg-opacity-50"/>
              </div>
              }
            </div>
            <div className="bg-info" style={{ height: '1px', width: '100%' }}/>
            <div className="h-100 mx-1">
              { value < -0.5 &&
              <div style={{ height: `${normalizedValue}%` }}
                   className="w-100 border border-info border-top-0">
                <div className="w-100 h-100 bg-info bg-opacity-50"/>
              </div>
              }
            </div>
          </div>

          <div className="position-absolute font-monospace top-0 text-muted text-center w-100 pt-1" style={{ fontSize: '8px' }}>
            <div style={{ top: 0 }}>{ label }</div>
            <div style={{ bottom: 0 }}>{ normalizedValue }</div>
          </div>
        </div>
      }
    </>
  );
}

export default observer(Axis);