import React, {useCallback, useState} from 'react';
import { observer } from 'mobx-react-lite';
import Slider from 'react-input-slider';
import throttle from 'lodash.throttle';

import './styles.scss';
import { useSocket } from "../../../hooks/useSocket";

type Props = {
  label: string,
  variant?: 'black'|'red'|'green'|'blue'|'yellow'
  channelName: string,
};

const CtrlFader = (props:Props) => {
  const { label, variant, channelName } = props;
  const [ value, setValue ] = useState(0);
  const socket = useSocket();

  const sendValue = throttle(useCallback((val) => {
    socket.emit('OSC_CTRL_MESSAGE', {
      message: 'fader',
      id: channelName,
      state: val,
    });
  }, [ socket, channelName ]), 250);

  const handleMove = useCallback((val:number) => {
    setValue(val);
    sendValue(val);
  }, [ sendValue, socket, channelName ]);

  return (
    <div className={`CtrlFader ${variant ? `CtrlFader-${variant}` : ''} position-relative h-100 overflow-hidden font-monospace`}>
      <Slider
        axis="y"
        y={value}
        ymax={255}
        yreverse={true}
        onChange={({ y }) => { handleMove(y) }}
        styles={{
          track: {
            height: '100%',
            width: "100%",
            backgroundColor: 'none'
          },
          active: {
            backgroundColor: 'inherit'
          },
          thumb: {
            width: 10,
            height: 17,
            borderRadius: 4,
          },
          disabled: {
            opacity: 0.5
          }
        }}
      />
      <div className="position-absolute bottom-50 text-muted fw-bold z-index-above w-100 text-center pointer-events-none" style={{ textShadow: '0px 0 8px black' }}>{ value }</div>
    </div>
  )
};

export default observer(CtrlFader);