const mongoose = require('mongoose');
const Image = require('./mongodb').Image;
const { makeSVG } = require('../../functions/makeSVG')

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
    if (err) throw('Error gettting image from DB:', err);
    makeSVG(image.url)
      .then((svg) => res.json({ _id: image._id, url: svg }))
      .catch((err) => console.log(err));
  });
}

module.exports = { addImage, getImages, processImages, }
