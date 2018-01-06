const mongoose = require('mongoose');
const Image = require('./mongodb').Image;
const potrace = require('potrace');

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

const processImages = (req, res) => {
  Image.findOne({ _id: req.params.id }, (err, image) => {
    potrace.trace(image.url, (err, svg) => {
      if (err) throw(err);
      res.json({ id: image._id, data: svg });
    });
  })
}

module.exports = { addImage, getImages, processImages, }
