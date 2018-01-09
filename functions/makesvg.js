window.Buffer = require('buffer/').Buffer;
const potrace = require('potrace');
// const btoa = require('btoa');


const makeSVG = (url) => {
  return new Promise((resolve, reject) => {
    potrace.trace(url, (err, svg) => {
      if (err) reject(new Error('Error creating SVG:', err));
      const base64 = 'data:image/svg+xml;base64,' + window.btoa(svg);
      resolve(base64);
    });
  });
}
// export default makeSVG;
module.exports = { makeSVG };