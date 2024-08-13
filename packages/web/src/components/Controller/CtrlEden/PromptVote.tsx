import React, { useCallback } from 'react';
import { PromptItem } from '../../../stores/gameStore';
import { useSocket } from '../../../hooks/useSocket';
import { Form, Row } from 'react-bootstrap';

const PromptVote = ({ items }: { items: PromptItem[] }) => {
  const socket = useSocket();

  const handleVote = useCallback((id: PromptItem['id']) => {
    console.log('handleVote', id)
    socket.emit('OSC_CTRL_MESSAGE', {
      message: 'action',
      type: 'promptvote',
      value: id
    });
  }, [])

  return (
    <Form>
      {items.map((item: PromptItem) => (
        <Form.Group as={Row} key={item.id}>
          <Form.Label column sm={10} htmlFor={`vote_${item.id}`} className="d-flex align-items-center">
            <Form.Check
              type="radio"
              id={`vote_${item.id}`}
              name="promptVote"
              onChange={() => handleVote(item.id)}
              inline
            />
            <div>
              <div>{item.prompt}</div>
              <div className="text-muted">{item.hint}</div>
            </div>
          </Form.Label>
        </Form.Group>
      ))}
    </Form>
  )
}

export default PromptVote;