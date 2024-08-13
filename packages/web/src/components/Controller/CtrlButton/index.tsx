import React, { MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';

import './styles.scss';
import { useSocket } from "../../../hooks/useSocket";
import { PlayerColor } from '../index';
import { getIcon } from '../../../utils/icons';

type Props = {
  label?: string,
  icon?: string,
  type: 'div' | 'button',
  variant?: PlayerColor
  channelName: string,
  released?: boolean,
  children?: ReactNode
  onClick?: () => void
  style?: any
  size?: "small" | "medium" | "large",
  className?: string
  fill?: boolean
};

const CtrlButton = (props: Props) => {
  const { fill, icon, label, variant, channelName, released, type, children, onClick, className, style } = props;
  const [pressed, setPressed] = useState(false);
  const socket = useSocket();
  const buttonRef: MutableRefObject<HTMLDivElement | HTMLButtonElement | undefined> = useRef()
  const handleBtnPress = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    e.preventDefault()
    setPressed(true);
    socket.emit('OSC_CTRL_MESSAGE', {
      message: 'button',
      btnId: channelName,
      state: 1,
    });
    onClick && onClick()
  }, [socket, channelName]);

  useEffect(() => {
    if (!buttonRef?.current) {
      return
    }

    const contextMenuHandler = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
      e.preventDefault();
    }

    // attach contextmenu event listener to button ref
    //@ts-ignore
    buttonRef.current.addEventListener('contextmenu', contextMenuHandler)

    return () => {
      //@ts-ignore
      buttonRef?.current?.removeEventListener('contextmenu', contextMenuHandler)
    }
  }, [buttonRef]);

  useEffect(() => {
    // console.log('useEffect', { released, pressed, channelName })
    if (typeof released === 'undefined') {
      return
    }

    // console.log('trigger delayed release')
    const delayedReleaseHandler = setTimeout(() => {
      if (pressed && released) {
        // console.log('send event')
        socket.emit('OSC_CTRL_MESSAGE', {
          message: 'button',
          btnId: channelName,
          state: 0,
        });

        setPressed(false);
      }
    }, 250)

    return () => {
      clearTimeout(delayedReleaseHandler);
    }
  }, [socket, pressed, released, channelName]);

  const styles = {
    ...style,
    ...(props.size ? props.size === 'large' ? { "height": "6rem" } : '' : {})
  }

  const IconComponent = icon ? getIcon(icon) : undefined

  if (type === 'div') {
    return (
      <div
        ref={buttonRef as MutableRefObject<HTMLDivElement>}
        className={className}
        onMouseDown={handleBtnPress}
        style={styles}
      >
        {children ? children : (
          <div className={IconComponent ? 'hasIcon d-flex align-items-center justify-content-center' : ''}>
            {label ? <span className={`button-text ${IconComponent ? 'me-2' : ''}`}>{label}</span> : null}
            {IconComponent ? <IconComponent color={'#fff'} size={24}/> : null}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      ref={buttonRef as MutableRefObject<HTMLButtonElement>}
      className={`CtrlButton ${variant ? `CtrlButton-${variant}` : ''} ${fill ? 'w-100' : 'flex-shrink-0'}`}
      onMouseDown={handleBtnPress}
      style={styles}
    >
      <div className={IconComponent ? 'hasIcon d-flex align-items-center justify-content-center' : ''}>
        {label ? <span className={`button-text ${IconComponent ? 'me-2' : ''}`}>{label}</span> : null}
        {IconComponent ? <IconComponent color={'#fff'} size={24}/> : null}
      </div>
    </button>
  )
};

export default observer(CtrlButton);