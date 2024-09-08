const config = {
  webSocketHost: process.env.NODE_ENV === 'production' ? 'https://socket.osc.link' : 'http://localhost:8080',
  CLERK_PUBLISHABLE_KEY: 'pk_test_ZnJhbmstcHVwLTQ2LmNsZXJrLmFjY291bnRzLmRldiQ',
  socketRoomPrefix: 'control',
  oscOverUDP: {
    localAddress: '0.0.0.0',
    localPort: 56121,
    remotePort: 57121,
    metadata: true,
  },
};

console.log(process.env.NODE_ENV)

export default config;