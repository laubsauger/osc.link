import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import { StoreProvider } from "./contexts/storeContext";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-dark-5/dist/css/bootstrap-night.css";
import { ClerkProvider } from '@clerk/clerk-react'

import "./index.scss";
import App from "./components/App";
import { RootStore } from "./stores/rootStore";
// @ts-ignore
import reportWebVitals from "./reportWebVitals";
import config from "./config";

/**
 * Setup user auth
 */
const PUBLISHABLE_KEY = config.CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider store={new RootStore()}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <HashRouter>
          <App />
        </HashRouter>
      </ClerkProvider>
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
