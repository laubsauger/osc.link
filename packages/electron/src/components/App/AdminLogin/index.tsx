import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import React from "react";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";

const AdminLogin = (props: any) => {
  const { isSignedIn, getToken } = useAuth();

  return (
    <div>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};

export default AdminLogin;
