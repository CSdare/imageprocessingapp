const mongoose = require('mongoose');
const Image = require('./mongodb').Image;
const processPNGtoSVG = require('../../src/iptSVG').processPNGtoSVG;

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
    console.log(image.url)
  })
}

module.exports = { addImage, getImages, processImages, }
