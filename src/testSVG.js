
const processPNGtoSVG = require('./iptSVG').processPNGtoSVG;
const processPNGtoPosterize = require('./iptSVG').processPNGtoPosterize;
console.log('***************************************************************************')

processPNGtoSVG('./trinity.png', 140, './testOutput2.svg')

processPNGtoPosterize('https://vignette.wikia.nocookie.net/matrix/images/4/4d/Agent-smith-the-matrix-movie-hd-wallpaper-2880x1800-4710.png/revision/latest?cb=20140504013834', 144, 5, 'posterize1.svg')

  processPNGtoSVG('https://vignette.wikia.nocookie.net/matrix/images/b/bb/Neo_main_page.png/revision/latest?cb=20130502002158', 120, './testOutput1.svg')