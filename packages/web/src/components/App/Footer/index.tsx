import React from 'react';
import { Col, Container, Row } from "react-bootstrap";

const Footer = () => (
  <Container>
    <Row>
      <Col>
        <div className="mt-3 small text-muted d-flex justify-content-center">
          <div className="d-flex gap-2 flex-wrap">
            <div>OSC.Link - Made by {' '}
              <a href='https://github.com/laubsauger' target="_blank"
                 rel="nofollow noopener noreferrer">laubsauger
              </a>
            </div>
            |
            <div>
              Contributions by {' '}
              <a href='https://github.com/drmbt' target="_blank"
                 rel="nofollow noopener noreferrer">
                drmbt
              </a>
              {' & '}
              <a href='https://github.com/thornebrandt' target="_blank"
                 rel="nofollow noopener noreferrer">
                thornebrandt
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-2">Powered by <a href='https://github.com/laubsauger/socketosc' target="_blank"
                           rel="nofollow noopener noreferrer">socketosc</a> & <a
          href='https://app.eden.art' target="_blank"
          rel="nofollow noopener noreferrer">Eden.art</a></div>
      </Col>
    </Row>
  </Container>
);

export default Footer;