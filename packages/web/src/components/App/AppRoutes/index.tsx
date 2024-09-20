import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { observer } from "mobx-react-lite";
import LoadingSpinner from "../../LoadingSpinner";
import DefaultLayout from "../Layouts/Default";
import NoNavLayout from "../Layouts/NoNav";

const HomePage = lazy(() => import("../Pages/Home"));
const JoinPage = lazy(() => import("../Pages/Join"));
const SessionPage = lazy(() => import("../Pages/Session"));
const EditInstance = lazy(() => import("../Pages/EditInstance"));
const DiscoDiffusionPage = lazy(() => import("../Pages/DiscoDiffusion"));
const AdminPage = lazy(() => import("../Pages/Admin"));
const NotFoundPage = lazy(() => import("../Pages/NotFound"));

const AppRoutes = () => {
  return (
    <Routes>
      {/*
      
        Todo:
          - Fix url scheme - should be /session/:instanceId/edit?
          - slotId should be a query param. Other things will be configurable via query param, so should standardize
        
      */}
      <Route path="/session/edit/:instanceId" element={<NoNavLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <EditInstance />
            </Suspense>
          }
        />
      </Route>
      <Route path="/session/:instanceId/:slotId" element={<NoNavLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <SessionPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="/join" element={<DefaultLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <JoinPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="/" element={<DefaultLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminPage />
            </Suspense>
          }
        />
        {/* NOT FOUND catch all */}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
};

export default observer(AppRoutes);
