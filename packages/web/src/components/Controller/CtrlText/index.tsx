import React, { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useSocket } from "../../../hooks/useSocket";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useStores } from '../../../hooks/useStores';
import LoadingSpinner from '../../LoadingSpinner';

type Props = {
  id: string
  label?: string,
  messageField: string,
  textArea?: boolean,
  onSubmitSuccess?: (text: string | null) => void,
  singleUse?: boolean,
  hasClearBtn?: boolean,
  autoFocus?: boolean,
  shouldSubmit?: boolean,
  hasSubmit?: boolean,
  maxLength?: number
  onChangeEvent?: boolean
};

const CtrlText = (props: Props) => {
  const { gameStore } = useStores()
  const ref = useRef<HTMLInputElement | null>(null)
  const {
    onChangeEvent,
    label,
    messageField,
    textArea,
    autoFocus,
    shouldSubmit,
    hasSubmit,
    onSubmitSuccess,
    maxLength
  } = props;
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    console.log('CtrlText - useEffect', gameStore.currentPhase)

    if (gameStore.currentPhase !== 'ui-update') {
      return
    }

    if (!gameStore.uiUpdateData || !gameStore?.uiUpdateData?.controls) {
      return
    }

    const receivedUpdate = gameStore.uiUpdateData.controls.filter(control => control.id === props.id)[0]

    if (receivedUpdate) {
      setText(receivedUpdate.value as string)
    }
  }, [gameStore.currentPhase, gameStore.uiUpdateData])

  const handleChangeText = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    console.log('change', ev.target.value)
    setText(ev.target.value);

    if (hasSubmit && onChangeEvent || !hasSubmit) {
      sendText(ev.target.value)
    }
  }, []);

  const sendText = (text: string) => {
    socket.emit('OSC_CTRL_MESSAGE', {
      message: messageField,
      id: props.id,
      text: text.trim(),
    });
  }

  const sendSubmit = (text: string) => {
    setIsSubmitting(true)
    socket.emit('OSC_CTRL_MESSAGE', {
      message: messageField,
      id: 'submit',
      text: text.trim(),
    });
    setTimeout(() => {
      setIsSubmitting(false)
    }, 2000)
  }

  const sendClear = (state: number) => {
    socket.emit('OSC_CTRL_MESSAGE', {
      message: 'button',
      btnId: 'clear',
      state: state,
    });
  }

  const handleClear = () => {
    setText('')

    sendClear(1)
    setTimeout(() => {
      sendClear(0)
    }, 250)
  }


  const doSubmit = () => {
    setIsSubmitting(true)
    sendText(text)
    setSent(true);
    onSubmitSuccess && onSubmitSuccess(text)
    setTimeout(() => {
      setIsSubmitting(false)
    }, 2000)
  }

  useEffect(() => {
    if (shouldSubmit && !sent) {
      doSubmit()
    }
  }, [shouldSubmit]);

  const handleSubmit = useCallback((ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    doSubmit()
  }, [socket, text]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // @ts-ignore
      if (ref.current && !ref.current?.contains(event.target)) {
        // if clicked outside of input, remove focus
        (ref.current as HTMLInputElement).blur();
      }
    };

    // attach the listeners on component mount
    document.addEventListener("mousedown", handleClickOutside);
    // @ts-ignore
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      // remove the listeners on component cleanup
      document.removeEventListener("mousedown", handleClickOutside);
      // @ts-ignore
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div className={`CtrlText p-2 pb-0 mt-0 mb-0`}>
      <Form onSubmit={handleSubmit}>
        <Form.Group className={`d-flex ${textArea ? 'flex-column' : ''}`} controlId="formTextPrompt">
          {textArea
            ? (
              <div className="w-100">
                <Form.Control
                  //@ts-ignore
                  ref={ref}
                  as="textarea"
                  rows={4}
                  value={text}
                  placeholder={label}
                  required={true}
                  onChange={handleChangeText}
                  spellCheck={false}
                  aria-label={label}
                  autoFocus={autoFocus}
                  disabled={props.singleUse ? sent && props.singleUse : (hasSubmit ? false : sent)}
                  className={props.singleUse ? (sent && props.singleUse ? 'border-success bg-black' : '') : (hasSubmit ? '' : sent ? 'border-success bg-black' : '')}
                />
              </div>
            )
            : (
              <>
                {!sent || !hasSubmit
                  ? <InputGroup className="d-flex align-items-center">
                    <Form.Control
                      ref={ref}
                      maxLength={maxLength ? maxLength : 20}
                      type="text"
                      value={text}
                      placeholder={label}
                      required={true}
                      onChange={handleChangeText}
                      aria-label={label}
                      autoFocus={autoFocus}
                      disabled={props.singleUse ? sent && props.singleUse : (!hasSubmit ? false : sent)}
                      style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    />
                    {props.hasClearBtn
                      ? <Button variant="outline-secondary" id="button-addon2" onClick={() => setText('')}>
                        Clear
                      </Button>
                      : null
                    }
                  </InputGroup>
                  : null
                }
              </>
            )
          }
          {(!props.singleUse || !sent) && hasSubmit
            ? (
              <div>
                <div className={`${textArea ? 'mt-2' : ''}`}
                     style={textArea ? {} : { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                >
                  {onChangeEvent ? (
                    <div className="d-flex flex-nowrap w-100 gap-4 my-4">
                      <Button
                        variant="primary"
                        className="d-flex gap-2 w-100 align-items-center justify-content-center"
                        onClick={() => !isSubmitting ? sendSubmit(text) : undefined}
                        disabled={isSubmitting || (!text || (props.singleUse ? sent && props.singleUse : false))}
                        style={{ height: '64px' }}
                      >
                        {isSubmitting ? 'Sending...' : 'Submit prompt'}
                      </Button>
                      {props.hasClearBtn
                        ? <Button variant="outline-secondary" id="button-addon2" onClick={handleClear}>
                          Clear
                        </Button>
                        : null
                      }
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting || (!text || (props.singleUse ? sent && props.singleUse : sent))}
                    >
                      Submit
                    </Button>
                  )}
                </div>
              </div>
            )
            :
            (
              <>
                {textArea && hasSubmit ?
                  <div className="mt-3 mb-0 w-100 text-success">Prompt sent! Sit back, relax and wait for others to
                    submit theirs.</div> : null}
              </>
            )
          }
        </Form.Group>
      </Form>

      {sent
        ? <div className="d-flex justify-content-between align-items-center">
          {
            props.singleUse
              ? <>
                <div>
                  <strong>{text}</strong>
                </div>
                <div>
                  <Button size="sm" variant="outline-secondary" onClick={() => setSent(false)}>Change</Button>
                </div>
              </>
              : null
          }
        </div>
        : null
      }
    </div>
  )
};

export default observer(CtrlText);