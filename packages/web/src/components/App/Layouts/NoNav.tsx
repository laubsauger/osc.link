import React from "react";
import {Outlet} from "react-router-dom";

const NoNav = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};

export default NoNav;