import React, {useCallback, useEffect, useState} from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import './styles.scss';
import config from '../../config';
import CtrlButton from './CtrlButton';
import CtrlXY from './CtrlXY';
import { useSocket } from '../../hooks/useSocket';
import { useStores } from '../../hooks/useStores';
import CtrlText from "./CtrlText";
import CtrlFader from "./CtrlFader";
import CtrlEden from './CtrlEden';
import { Player } from '../../stores/socketStore';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useSocketHandlers } from './useSocketHandlers';
import LogoBackground from '../LogoBackground';
import CtrlToggle from './CtrlToggle';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
export type PlayerColor = 'black'|'red'|'green'|'blue'|'yellow';

export const buttonColors: PlayerColor[] = [ 'red', 'green', 'blue', 'yellow' ]

const Controller = () => {
  useWakeLock();
  // todo: slotId should be coming from search
  const { instanceId, slotId } = useParams();
  useSocketHandlers(instanceId, slotId);

  const socket = useSocket();
  const { socketStore, gameStore } = useStores();
  const { getToken } = useAuth();
  const [ firedMouseUp, setFiredMouseUp ] = useState(false);
  const [ alreadyConnected, setAlreadyConnected ] = useState(socketStore.connectionState.connected);


  useEffect(() => {
    const fetchInstances = async () => {
      const token = await getToken();
      fetch(`${import.meta.env.VITE_SERVER_API}/api/instances/${instanceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => response.json())
        .then(data => {
          console.log('success')
          socketStore.setCurrentInstance(data);
        }).catch(() => {
          socketStore.setCurrentInstance(undefined);
        });
    }
    fetchInstances();
  },[]);

  const sendJoinRequest = useCallback(() => {
    if (!socketStore.currentInstance) {
      return;
    }

    console.log(socketStore.currentInstance)

    socket.emit('USER_JOIN_REQUEST', {
      instanceId: instanceId,
      room: `${config.socketRoomPrefix}:${instanceId}`,
      wantsSlot: slotId,
    });

    socketStore.updateConnectionState({
      joining: true,
    });
  }, [ socket, socketStore, slotId, instanceId, socketStore.currentInstance ]);

  useEffect(() => {
    if (socketStore.currentInstance && socketStore.connectionState.connected) {
      console.log('sending join request')
      sendJoinRequest();
    }
  }, [ alreadyConnected, sendJoinRequest, socketStore.connectionState.connected, socketStore.currentInstance ]);

  useEffect(() => {
    document.body.classList.add('prevent-scroll-drag');
    return () => {
      document.body.classList.remove('prevent-scroll-drag');
    };
  }, []);

  const handleMouseUp = useCallback((data:any) => {
    console.log('UI::mouseUp', data);
    setFiredMouseUp(true);

    setTimeout(() => {
      setFiredMouseUp(false);
    }, 400)
  }, []);


  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleMouseUp)
    };
  }, [ handleMouseUp ])

  const location = useLocation();
  const [ isAdminMode, setIsAdminMode ] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsAdminMode(!!params.get('admin'))
  }, [location.search]);

  return (
    <div className='Controller d-flex flex-column w-100 h-100' style={{ height: '100%', width: '100%' }}>
      { !socketStore.currentInstance?.settings?.controls?.eden ? <LogoBackground /> : null }
      { socketStore.connectionState.joined &&
        <React.Fragment>
          { socketStore.currentInstance &&
            <>
              <div className="w-100 h-100 d-flex flex-column">
                {/*{(socketStore.currentInstance.settings.controls.sensors ) ?*/}
                {/*  <Sensors*/}
                {/*    gyroscope={socketStore.currentInstance.settings.controls.gyroscope || false}*/}
                {/*    accelerometer={socketStore.currentInstance.settings.controls.accelerometer || false}*/}
                {/*  />*/}
                {/*  : null*/}
                {/*}*/}
                {socketStore.currentInstance.settings.controls.faders && socketStore.currentInstance.settings.controls.faders.length > 0
                  ? (
                    <div className="d-flex justify-content-between py-2 px-2 w-100 h-100">
                      { socketStore.currentInstance.settings.controls.faders.map((fader) =>
                        <CtrlFader
                          key={fader.id}
                          channelName={fader.id}
                          label={fader.options?.label || ''}
                          variant={fader.options?.variant}
                        />
                      ) }
                    </div>
                  )
                  : null
                }
                {socketStore.currentInstance.settings.controls.texts && socketStore.currentInstance.settings.controls.texts.length > 0
                  ? (
                    <>
                      { socketStore.currentInstance.settings.controls.texts.map(text =>
                        <CtrlText
                          id={text.id}
                          key={text.id}
                          messageField={'textPrompt'}
                          textArea={text.options.multiline}
                          hasSubmit={!!text.options.submit}
                          {...text.options}
                        />
                      ) }
                    </>
                  )
                  : null
                }
                {socketStore.currentInstance.settings.controls.xy
                  ? (
                  <>
                    { socketStore.currentInstance.settings.controls.xy.map(xyControl =>
                      <CtrlXY
                        key={xyControl.id}
                        channelNames={{ x: `x`, y: `y` }}
                        released={firedMouseUp}
                        feedback={xyControl.options.mode === 'paint'}
                      />
                    ) }
                  </>
                  )
                  : null
                }
                {socketStore.currentInstance.settings.controls.eden
                  ? <CtrlEden firedMouseUp={firedMouseUp}/>
                  : null
                }
                {socketStore.currentInstance.settings.controls.buttons && socketStore.currentInstance.settings.controls.buttons.length > 0
                  ? <div
                      className={`d-flex ${socketStore.currentInstance.settings.layout?.wrapButtons === false ? '' : 'flex-wrap' } justify-content-between py-2 px-2 w-100 bg-black border-bottom border-top align-items-center gap-2`}
                      style={{ zIndex: 10, borderTop: '1px solid black' }}
                    >
                    { socketStore.currentInstance.settings.controls.buttons.map((btn) => {
                      if (btn.options && btn.options.admin && !isAdminMode) {
                        return
                      }

                      if (btn.type === 'toggle') {
                        return (
                          <CtrlToggle
                            key={btn.id}
                            type='button'
                            channelName={btn.id}
                            released={firedMouseUp}
                            style={{ minWidth: '82px' }}
                            {...btn.options}
                          />
                        )
                      }

                      return (
                        <CtrlButton
                          key={btn.id}
                          type='button'
                          channelName={btn.id}
                          released={firedMouseUp}
                          style={{ minWidth: '64px' }}
                          {...btn.options}
                        />
                      )}
                      )
                    }
                  </div>
                  : null
                }
              </div>
            </>
          }
        </React.Fragment>
      }

      {/*<div className="position-absolute mt-auto z-index-above">*/}
      {/*  <SessionInfo />*/}
      {/*</div>*/}
    </div>
  )
};

export default observer(Controller);
