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

interface Instance {
  name: string;
  description?: string;
  settings?: object;
  id: string
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

  const deleteInstance = async (instance: Instance) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8080/api/instances/${instance.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedInstances = instances.filter(inst => inst.id !== instance.id);
        setInstances(updatedInstances);
      } else {
        console.error("Error deleting instance:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting instance:", error);
    }
  };


  return (
    // <div>Functional Component for { userStore.name }</div>
    <div>
      Admin Dashboard
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
        <div>
          <h3>Added Instances</h3>
          {instances.length === 0 ? (
            <p>No instances</p>
          ): null}
          {instances.map((instance) => (
            <div key={instance.id}>
              <h4>{instance.name}</h4>
              <h5><a href={`/session/${instance.id}`}>
              {`${window.location.origin}/session/${instance.id}`}
              </a></h5>
              <button onClick={() => deleteInstance(instance)}>Delete Instance</button>
              <code>{JSON.stringify(instance.settings)}</code>
            </div>
          ))}
          <h3>Available Instance Templates</h3>
          <p>Select one to add to your account.</p>
          {availableInstances.map((instance) => (
            <div key={instance.name}>
              <h4>{instance.name}</h4>
              <button onClick={() => addInstanceToUser(instance)}>Add to My Account</button>
            </div>
          ))}
        </div>
      </SignedIn>
      <div></div>
    </div>
  );
};

export default observer(Admin);
