require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const WebSocket = require('ws');


//-- WEBSOCKET -----------------------------------------------------//
var server = new WebSocket.Server({ port: 9000 });

server.on('connection', (ws) => {
  const connectionTime = Date.now();
  let connectionInfo;
  ws.on('message', (message) => {
    const responseTime = Date.now();
    const pingTime = responseTime - connectionTime;
    connectionInfo = JSON.parse(message);
    connectionInfo.pingTime = pingTime;
    ws.send(JSON.stringify({ connectionInfo }));
  });
  ws.on('close', () => console.log(connectionInfo, '---- WEBSOCKET CLOSED ----'));
});
//-----------------------------------------------------------------//

const imageController = require('./db/imageController');

const port = 4000;
const app = express();

app.use(express.static(__dirname + '/../build/')); // do we need this? all static files should be bundled
app.use(bodyParser.json({ limit: '16mb' }));
app.use(bodyParser.urlencoded({ limit: '16mb', extended: true }));

app.get('/read', imageController.getImages);
app.post('/create', imageController.addImage);
app.post('/process', imageController.processImage);

mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@ds237947.mlab.com:37947/imagesdb`);
mongoose.connection.once('open', () => {
  console.log('connected with MLab database')
});

app.listen(port);