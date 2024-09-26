import React, {useCallback} from 'react';
import { observer } from 'mobx-react-lite';
import {Card, Col, Form, InputGroup, Row} from "react-bootstrap";
import SessionList from "../../SessionList";
import {useStores} from "../../../hooks/useStores";
import { Link } from 'react-router-dom';
import AdminLogin from '../AdminLogin';
import OSCPorts from '../../../components/OSCPorts';

const Home: React.FC = (props) => {

  return (
    <Col className="mt-4">
      <Card>
        <Card.Body className="text-center">
          <AdminLogin />
          <Card.Title>Select session to join</Card.Title>
          <div>
            <div>Requires proper local setup to connect to your devices via OSC-over-UDP</div>
            <a href={'https://github.com/laubsauger/socketosc/blob/main/README.md'} target="_blank" rel={'nofollow noopener noreferrer'} className="text-muted">
              Learn more
            </a>
          </div>

          <OSCPorts />
          <SessionList />

        </Card.Body>
      </Card>
    </Col>
  )
};

export default observer(Home);