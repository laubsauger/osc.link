import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StoreProvider } from "./contexts/storeContext";
import SensorsProvider from "./contexts/sensorsContext";
import { ClerkProvider } from '@clerk/clerk-react'

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-dark-5/dist/css/bootstrap-night.css";
import "./index.scss";
import App from "./components/App";
import { RootStore } from "./stores/rootStore";
// @ts-ignore
import reportWebVitals from "./reportWebVitals";
import { dark } from "@clerk/themes";

/**
 * Setup user auth
 */
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}


export default function Index() {
  return (
    <React.StrictMode>
      <SensorsProvider multiplier={3} useGravity={false}>
        <StoreProvider store={new RootStore()}>
          <BrowserRouter>
            <ClerkProvider appearance={{
              baseTheme: dark
            }} publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
              <App />
            </ClerkProvider>
          </BrowserRouter>
        </StoreProvider>
      </SensorsProvider>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
