import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useSocket } from "../../../hooks/useSocket";
import { Button } from 'react-bootstrap';
import { Result } from './Phases/Voting';

type Props = {
  label?: string,
  className?: string,
  released?: boolean,
  onClick?: () => void
  selectedResult: Result|null,
  resultInView: Result|null,
};

const VoteButton = (props:Props) => {
  const { released, onClick, selectedResult, resultInView, className} = props;
  const [ pressed, setPressed ] = useState(false);
  const socket = useSocket();

  const handleBtnPress = useCallback(() => {
    if (!resultInView) {
      return
    }

    setPressed(true);
    socket.emit('OSC_CTRL_MESSAGE', {
      message: 'button',
      btnId: `b${resultInView.player_index}`,
      state: 1,
    });

    setTimeout(() => {
      socket.emit('OSC_CTRL_MESSAGE', {
        message: 'button',
        btnId: `b${resultInView.player_index}`,
        state: 0,
      });
    }, 100)

    setPressed(false);
    onClick && onClick()
  }, [ onClick, socket, resultInView ]);

  if (!resultInView) {
    return null
  }

  return (
    <Button
      className={`w-100 ${className ? className : ''}`}
      onClick={handleBtnPress}
      variant={selectedResult ? (selectedResult.player_index !== resultInView.player_index ? "outline-success" : "success") : "outline-success"}
    >
      {selectedResult ? (selectedResult.player_index !== resultInView.player_index ? "Vote for this" : "Voted!") : "Vote for this"}
    </Button>
  )
};

export default observer(VoteButton);