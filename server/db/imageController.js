const mongoose = require('mongoose');
const Image = require('./mongodb').Image;

const addImage = (req, res) => {
  Image.create({ url: req.body.url }, (err, image) => {
    if (err) throw err;
    res.json(image);
  });
}

const getImages = (req, res) => {
  Image.find((err, images) => {
    if (err) throw err;
    res.json(images);
  });
}

module.exports = { addImage, getImages }
