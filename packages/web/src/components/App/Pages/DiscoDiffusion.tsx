import React, { ChangeEvent, FormEvent, FormEventHandler, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {Button, Card, Col, Form } from "react-bootstrap";
import {useSocket} from "../../../hooks/useSocket";
import {useStores} from "../../../hooks/useStores";

const DiscoDiffusion: React.FC = (props) => {
  const socket = useSocket();
  const { socketStore } = useStores();
  const [ sent, setSent ] = useState(false);

  const [ text, setText ] = useState('');
  const [ image, setImage ] = useState('');
  const [ email, setEmail ] = useState('');
  const [ name, setName ] = useState('');

  const handleConnected = useCallback(() => {
    console.log('socket::connected');
    socketStore.updateConnectionState({
      clientId: socket.id,
      connected: true,
      connecting: false,
      failed: false,
      failReason: '',
    });
  }, []);

  const handleDisconnected = useCallback((data:any) => {
    console.log('socket::disconnected', data);
    socketStore.resetConnectionState();
  }, []);

  const handleSubmit = useCallback((ev:FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const data = {
      text: text,
      imageURL: image,
      email: email,
      name: name,
    };

    console.log('socket::emit', data);
    socket.emit('DISCO_DIFFUSION_PROMPT', data);
    setSent(true);
  }, [ socket, text, image, email, name ]);

  useEffect(() => {
    socket.on('connect', handleConnected);
    socket.on('disconnect', handleDisconnected);

    return () => {
      socket.off('connect', handleConnected);
      socket.off('disconnect', handleDisconnected);
    };
  }, [socket, socketStore, handleConnected]);

  const handleChangeText = useCallback((ev:ChangeEvent<HTMLInputElement>) => {
    setText(ev.target.value);
  }, []);

  const handleChangeImage = useCallback((ev:ChangeEvent<HTMLInputElement>) => {
    setImage(ev.target.value);
  }, []);

  const handleChangeName = useCallback((ev:ChangeEvent<HTMLInputElement>) => {
    setName(ev.target.value);
  }, []);

  const handleChangeEmail = useCallback((ev:ChangeEvent<HTMLInputElement>) => {
    setEmail(ev.target.value);
  }, []);

  return (
    <Col className="mt-4 offset-lg-2 col-lg-8 col-md-12">
      <Card>
        <Card.Body>
          <Card.Title>DiscoDiffusion</Card.Title>
          <Card.Text>Generate an image based on your inputs</Card.Text>

          { sent ?
              <div className="text-center">
                <div className="py-3 text-muted">Request sent successfully</div>
                <Button variant="outline-info" type="button" onClick={() => setSent(false) }>
                  Send another one?
                </Button>
              </div>
            :
            <React.Fragment>

              { !socketStore.connectionState.connected &&
                <div className="text-center text-muted">Connecting...</div>
              }
              { socketStore.connectionState.connected &&
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formTextPrompt">
                    <Form.Label>Text prompt *</Form.Label>
                    <Form.Control type="text" placeholder="Enter a text" required={true} onChange={handleChangeText}/>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formImage">
                    <Form.Label>Image URL (optional)</Form.Label>
                    <Form.Control type="url" pattern="https://.*" placeholder="Link to a .JPG or .PNG image" onChange={handleChangeImage}/>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Name (optional)</Form.Label>
                    <Form.Control type="text" placeholder="Your name" onChange={handleChangeName}/>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email (optional)</Form.Label>
                    <Form.Control type="email" placeholder="Your email" onChange={handleChangeEmail}/>
                  </Form.Group>

                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </Form>
              }
            </React.Fragment>
          }
        </Card.Body>
      </Card>
    </Col>
  )
};

export default observer(DiscoDiffusion);