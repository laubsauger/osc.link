import React from "react";
import { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth
} from "@clerk/clerk-react";
// import { useStores } from '../../../hooks/useStores';

const Admin: React.FC = (props) => {
  // const { userStore } = useStores();
  const { isSignedIn, getToken } = useAuth();

  const [instances, setInstances] = useState([]);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const token = await getToken();
        const response = await fetch("http://localhost:8080/api/instances", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setInstances(data);
      } catch (error) {
        console.error("Error fetching instances:", error);
      }
    };
    if (isSignedIn) {
      fetchInstances();
    }
  }, [isSignedIn]);

  return (
    // <div>Functional Component for { userStore.name }</div>
    <div>
      Admin Dashboard
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>

      <div>

      </div>
    </div>
  );
};

export default observer(Admin);
