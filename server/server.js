require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const imageController = require('./db/imageController');

const port = 4000;
const app = express();

app.use(express.static(__dirname + '/../')); // do we need this? all static files should be bundled
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/read', imageController.getImages);
app.post('/create', imageController.addImage);

mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@ds237947.mlab.com:37947/imagesdb`);
mongoose.connection.once('open', () => {
  console.log('connected with MLab database')
});

app.listen(port);