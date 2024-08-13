const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const setupSocketServer = require('./socket'); // Adjust the path as necessary



const app = express();
const port = Number(process.env.PORT) || 8080;

const headerConfig = (req, res, next) => {
  // allow external requests
  // if (process.env.NODE_ENV === 'production') {
  //   const origin = req.headers.origin;
  //   if (crossOriginDomainsProd.indexOf(origin) > -1) {
  //     res.append('Access-Control-Allow-Origin', origin);
  //   }
  // } else {
  //   const origin = req.headers.origin;
  //   if (crossOriginDomainsTest.indexOf(origin) > -1) {
  //     res.append('Access-Control-Allow-Origin', origin);
  //   }
  // }

  // Access-Control-Allow-Credentials
  res.append('Access-Control-Allow-Credentials', 'true');
  // allow rest http verbs
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  // allow content type header
  res.append('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
  next();
};

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
app.use(headerConfig);
app.use('/api', express.static(path.join(__dirname, 'dummy')));

const server = http.createServer(app).listen(port, (e) => {
  console.log('listening on ' + port);
});
let io = require('socket.io')({
  cors: true
}).listen(server);

setupSocketServer(io, instances);
