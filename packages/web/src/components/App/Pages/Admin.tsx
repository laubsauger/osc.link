import React from "react";
import { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import {
  Accordion,
  Button,
  Card,
  Container,
  ListGroup,
  Stack,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import Join from "./Join";

interface Instance {
  name: string;
  description?: string;
  settings?: object;
  id: string;
}

const Admin: React.FC = (props) => {
  const { isSignedIn, getToken } = useAuth();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [availableInstances, setAvailableInstances] = useState<Instance[]>([]);
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_API}/api/instances`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setInstances(data);
      } catch (error) {
        console.error("Error fetching instances:", error);
      }
    };

    const fetchAvailableInstances = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_API}/api/instances.json`
        );
        const data = await response.json();
        setAvailableInstances(data);
      } catch (error) {
        console.error("Error fetching available instances:", error);
      }
    };

    if (isSignedIn) {
      fetchInstances();
      fetchAvailableInstances();
    }
  }, [isSignedIn]);

  const addInstanceToUser = async (instance: Instance) => {
    delete instance.id;
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:8080/api/instances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(instance),
      });

      if (response.ok) {
        const newInstance = await response.json();
        setInstances([...instances, newInstance]);
      } else {
        console.error("Error adding instance:", await response.json());
      }
    } catch (error) {
      console.error("Error adding instance:", error);
    }
  };

  const newInstance = () => {
    // defaults?
    addInstanceToUser({
      "id": "",
      "name": "New Instance",
      "description": "",
      "settings": {
        "slots": 12,
        "randomPick": false,
        "sequentialPick": true,
        "slotPick": false,
        "layout": {
          "wrapButtons": false
        },
        "controls": {
          "texts": [
          ],
          "buttons": [
          ]
        }
      }
    });
  }

  const deleteInstance = async (instance: Instance) => {
    const confirmation = confirm(
      `Are you sure you want to delete ${instance.name}? ${instance.id}`
    );
    if (!confirmation) {
      return;
    }
    try {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:8080/api/instances/${instance.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const updatedInstances = instances.filter(
          (inst) => inst.id !== instance.id
        );
        setInstances(updatedInstances);
      } else {
        console.error("Error deleting instance:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting instance:", error);
    }
  };

  return (
    <div className="pt-3">
      <h1>Admin Dashboard</h1>
      <Card className="mb-4">
        <Card.Body>
          <SignedIn>
            <UserButton showName baseTheme={["Dark"]} />
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </Card.Body>
      </Card>
      <SignedIn>
        <div>
          <h3>Your Instances</h3>
          {instances.length === 0 ? <p>No instances</p> : null}
          <div className="mb-4">
            <Join deleteInstance={deleteInstance} instances={instances} />
          </div>
          <div>
          <h4>Create New Instance</h4>
          <Button onClick={newInstance}>Create New Instance</Button>
          <Accordion className="mt-3 mb-4">
            <Accordion.Header>
              Use a template
            </Accordion.Header>
            <Accordion.Body>
              <p>Select one to add to your account.</p>
              <ListGroup>
                {availableInstances.map((instance, index) => (
                  <ListGroup.Item
                    action
                    variant={index % 2 === 0 ? "light" : ""}
                    key={instance.name}
                  >
                    <Stack direction="horizontal">
                      <Card.Title className="me-auto">
                        {instance.name}
                      </Card.Title>
                      <Button onClick={() => addInstanceToUser(instance)}>
                        Create Instance
                      </Button>
                    </Stack>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion>
          </div>
        </div>
      </SignedIn>
    </div>
  );
};

export default observer(Admin);
