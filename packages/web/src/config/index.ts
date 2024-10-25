if (!import.meta.env.VITE_SERVER_API) {
  throw new Error('VITE_SERVER_API env var not specified');
}

const config = {
  // fix this
  socketServer: import.meta.env.VITE_SERVER_API,
  socketRoomPrefix: 'users',
};

export default config;