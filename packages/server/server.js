const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const setupSocketServer = require('./socket');

const app = express();
const port = Number(process.env.PORT) || 8080;

const instancesConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'dummy/instances.json'), 'utf-8'));
const instances = instancesConfig.map(instanceConfig => {
  let userSlots = [];
  for (let i = 0; i < instanceConfig.settings.slots; i++) {
    userSlots.push({ slot_index: i + 1, client: null });
  }
  return {
    ...instanceConfig,
    rooms: {
      users: `users:${instanceConfig.id}`,
      control: `control:${instanceConfig.id}`,
    },
    userSlots: userSlots,
    users: [],
    lastTriedSlotIndex: 0,
  };
});

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api', express.static(path.join(__dirname, 'dummy')));

const server = http.createServer(app);
const io = setupSocketServer(server, instances);

server.listen(port, () => {
  console.log('Server listening on port ' + port);
});