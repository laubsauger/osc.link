import React, { useEffect, useState } from 'react'
import { useStores } from '../../../../hooks/useStores';
import { observer } from 'mobx-react-lite';
import CtrlText from '../../CtrlText';
import { motion, useAnimate } from 'framer-motion';
import Timer from '../Timer';
import ListItemPlayer from '../ListItemPlayer';
import PromptVote from '../PromptVote';


const Round = () => {
  const [scope, animate] = useAnimate();
  const { gameStore, socketStore } = useStores()

  const [ roundTimer, setRoundTimer ] = useState<number|undefined>(undefined)
  const { timer } = gameStore.roundData || {}

  const [ animationCompleted, setAnimationCompleted ] = useState(false)
  const [ titleAnimationCompleted, setTitleAnimationCompleted ] = useState(false)
  const [ firstRender, setFirstRender ] = useState(true)
  const [ isPlayer, setIsPlayer ] = useState(false)

  useEffect(() => {
    if (gameStore.players && socketStore.connectionState.clientId) {
      const currentPlayer = gameStore.players.filter(player => player.id === socketStore.connectionState.clientId)[0]
      if (currentPlayer) {
        setIsPlayer(true)
      } else {
        setIsPlayer(false)
      }
    }
  }, [gameStore.players, socketStore.connectionState.clientId]);

  useEffect(() => {
    if (!animationCompleted || !timer) {
      return
    }
    setFirstRender(false)
    setRoundTimer(timer)
    const decreaseTimerInterval = setInterval(() => {
      setRoundTimer(prevTimer => prevTimer && prevTimer > 0 ? prevTimer - 0.25 : 0);
    }, 250)

    return () => {
      clearInterval(decreaseTimerInterval)
    }
  }, [timer, animationCompleted]);

  async function myAnimation() {
    await animate(scope.current, { y: '40vh', scale: 1, duration: 0.5 })
    animate(
      scope.current,
      {
        y: 0,
        scale: 0.8
      },
      {
        delay: 2.5,
        ease: 'backOut',
        duration: 0.5
      }
    );
  }

  useEffect(() => {
    myAnimation();
  }, []);

  return (
    <div className="d-flex flex-column flex-grow-1" style={{ height: '100dvh', width: '100dvw' }}>
      <div className="d-flex flex-column z-index-above flex-grow-1">
        <div className="d-flex gap-4 mx-2 align-items-center justify-content-center">
          <div className="position-relative text-center">
            <motion.div
              ref={scope}
              initial={firstRender ? { scale: 0, y: '-100vh' } : false}
              onAnimationStart={() => setTitleAnimationCompleted(false)}
            >
              <div className="fw-semibold fs-2">{gameStore.roundData?.prompt}</div>
              <motion.div
                initial={firstRender ? { scale: 0, y: '-100vh'} : false}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.3, ease: 'backOut' }}
                onAnimationComplete={() => setTitleAnimationCompleted(true)}
              >
                <div className="text-secondary fs-5">{gameStore.roundData?.hint}</div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {titleAnimationCompleted
          ? <motion.div
            initial={firstRender ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5, ease: 'backOut' }}
            onAnimationStart={() => setAnimationCompleted(false)}
            onAnimationComplete={() => setAnimationCompleted(true)}
            className="mb-auto"
          >
            <Timer currentTime={roundTimer} duration={timer} />
            <div className="position-relative">
              {isPlayer
                ?
                <CtrlText
                  id={'text'}
                  label={'Text Prompt'}
                  messageField={'textPrompt'}
                  textArea={true}
                  hasSubmit={true}
                  shouldSubmit={typeof roundTimer !== 'undefined' && roundTimer <= 0}
                />
                :
                <>
                  {animationCompleted
                    ? (
                      // <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease: 'backOut', duration: 0.5 }}>
                        <div className="px-2">
                          <div className="text-center">
                            <div className="mb-3 fw-bold text-info fs-4">You're in the audience!</div>
                            <div className="fs-6 text-light">Waiting for players to submit their prompts...</div>
                          </div>

                          <hr className="mt-3"/>
                          <div className="px-4">
                            <div className="fs-5 text-light">Vote for the next prompt:
                            </div>
                            {gameStore.roundData?.audience.prompt_selection
                              ? <PromptVote items={gameStore.roundData?.audience.prompt_selection}/>
                              : null
                            }
                          </div>

                          <hr className="mt-3"/>
                          {gameStore.players ?
                            <div>
                              <div className="mb-2 d-flex justify-content-between">
                                <span className="text-dark-emphasis">Players</span>
                              </div>
                              <div className="m-0">
                                {gameStore.players?.map((player, index) => (
                                  <div key={`${player.id}_${index}`}>
                                    <ListItemPlayer player={player} index={index}/>
                                  </div>
                                ))}
                              </div>
                            </div>
                            : null
                          }
                        </div>
                      // </motion.div>
                    )
                    : null
                  }
                </>
              }
            </div>
          </motion.div>
          : null
        }
      </div>

      {animationCompleted
        ? (
          <div className="d-flex gap-2 justify-content-between text-dark mb-2 mx-2">
            <div>Players: {gameStore.players.length}</div>
            <div>Audience: {gameStore.audience.length}</div>
          </div>
        )
        : null
      }
    </div>
  )
}

export default observer(Round)