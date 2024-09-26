import React, { useCallback } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import config from "../../config";
import { useStores } from "../../hooks/useStores";

const OSCPorts = (props: any) => {
  const { socketStore } = useStores();

  const handleLocalPortNumberChange = useCallback((ev) => {
    const portNumber = Number(ev.target.value);

    if (portNumber) {
      socketStore.setOscLocalPort(portNumber);
    }
  }, [socketStore]);

  const handleRemotePortNumberChange = useCallback((ev) => {
    const portNumber = Number(ev.target.value);

    if (portNumber) {
      socketStore.setOscRemotePort(portNumber);
    }
  }, [socketStore]);

  return (
    <Row className="bg-black rounded-3 p-2 d-flex justify-content-between mt-2">
      <Col xs={12} lg={6} className="mb-2">
        <Form.Group
          className="d-flex align-items-center justify-content-between gap-2"
          controlId="remote-port-input"
        >
          <Form.Label className="flex-shrink-0 mb-0">
            Remote OSC Port (UDP)
          </Form.Label>
          <InputGroup className="ms-2 w-50">
            <Form.Control
              name="remote-port-input"
              type="number"
              min="1"
              max="65535"
              required={true}
              onChange={handleRemotePortNumberChange}
              defaultValue={socketStore.oscRemotePort}
            />
          </InputGroup>
        </Form.Group>
      </Col>
      <Col xs={12} lg={6}>
        <Form.Group
          className="d-flex align-items-center justify-content-between gap-2"
          controlId="local-port-input"
        >
          <Form.Label className="flex-shrink-0 mb-0">
            Local OSC Port (UDP)
          </Form.Label>
          <InputGroup className="ms-2 w-50">
            <Form.Control
              name="local-port-input"
              type="number"
              min="1"
              max="65535"
              required={true}
              onChange={handleLocalPortNumberChange}
              defaultValue={socketStore.oscLocalPort}
            />
          </InputGroup>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default observer(OSCPorts);
