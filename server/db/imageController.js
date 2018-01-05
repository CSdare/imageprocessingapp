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
  Image.find((err, images) => {
    if (err) throw err;
    let result = images.map((elem) => elem._id)
    res.json(result)

  });
}

module.exports = { addImage, getImages, processImages, }
