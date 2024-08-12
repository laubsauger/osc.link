import { Button, Modal } from 'react-bootstrap';
import React, { useState } from 'react';
import ListGameMode from './ListGameMode';
import { useSocket } from '../../../../hooks/useSocket';

const ConfirmStartModal = () => {
  const socket = useSocket()
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleSubmit = () => {
    socket.emit('OSC_CTRL_MESSAGE', {
      message: 'game_start',
      mode: 'one-shot-prompts',
    });
    handleClose()
  };
  const handleShow = () => setShowModal(true);

  return (
    <>
      <Button variant="outline-info" size="sm" onClick={handleShow}>
        Launch
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton className="bg-body">
          <Modal.Title>Do you want to start a new game?</Modal.Title>
        </Modal.Header>
        <Modal.Body className=" bg-black">
          <div>
            <div className="mb-2">Select Mode</div>
            <ListGameMode />
          </div>
          {/*<hr className="my-2 mb-0" />*/}
          <div className="py-2 fw-semibold text-warning">Make sure everyone has joined and is ready to go before proceeding</div>
        </Modal.Body>
        <Modal.Footer className="d-flex gap-2 justify-content-between bg-body">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="outline-success" onClick={handleSubmit}>
            Let's Go!
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ConfirmStartModal