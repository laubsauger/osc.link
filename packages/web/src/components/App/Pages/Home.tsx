import React from "react";
import { observer } from "mobx-react-lite";
import { Button, Card, Col, ButtonGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import Footer from "../Footer";

const Home: React.FC = (props) => {
  return (
    <Col className="mt-4 offset-lg-2 col-lg-8 col-md-12">
      <Card>
        <Card.Body className="text-center">
          <Card.Title>OSC control at your fingertips</Card.Title>
          <Card.Text>Participate in live projection mapping</Card.Text>
          <ButtonGroup>
            <Button as={Link} to="/join" variant="outline-info">
              Join session
            </Button>
            <Button as={Link} to="/admin" variant="outline-info">
              Admin Login
            </Button>
          </ButtonGroup>
        </Card.Body>
      </Card>
      <Footer />
    </Col>
  );
};

export default observer(Home);
