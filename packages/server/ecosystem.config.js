// https://pm2.keymetrics.io/docs/usage/application-declaration/
require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "beta-osc-link",
      script: "./dist/server.js",
      env: {
        PORT: process.env.SERVER_PORT,
        CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      },
    },
  ],
};
