import ListGroup from 'react-bootstrap/ListGroup';
import React from 'react';

const ListGameMode = () => {
  const onGameModeSelect = () => {
    console.log('selected mode')
  }

  return (
    <ListGroup>
      <ListGroup.Item action variant="success" onClick={onGameModeSelect} className="d-flex justify-content-between">
        <div>
          One-shot Prompts
        </div>
        <div className="fs-6 fw-bold">
          Selected
        </div>
      </ListGroup.Item>
      <ListGroup.Item action variant="dark" disabled className="d-flex justify-content-between">
        <div className="text-dark">
          Fill the gap
        </div>
        <div className="fs-6 text-dark">
          Coming soon
        </div>
      </ListGroup.Item>
      <ListGroup.Item action variant="dark" disabled className="d-flex justify-content-between">
        <div className="text-dark">
          Fibbage
        </div>
        <div className="fs-6 text-dark">
          Coming soon
        </div>
      </ListGroup.Item>
    </ListGroup>
)
}

export default ListGameMode