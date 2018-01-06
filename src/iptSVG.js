var p = require('potrace');
fs = require('fs')

let processPNGtoSVG = function(file, threshold, outputFile){
console.log('%%%%%%%%%%%%%%% hello world of SVG %%%%%%%%%%%%%%%%%%')

console.log(arguments[0])
console.log(arguments[1])
p.trace(file, {threshold: threshold}, function(err, svg) {
    if (err) throw err;
    return svg;
    // fs.writeFileSync(outputFile, svg);
  });
}

let processPNGtoPosterize = function(file, threshold, steps, outputFile){
    console.log('&&&&&&&&&&& hello world of Posterize &&&&&&&&&&&&&')
    
    console.log(arguments[0])
    console.log(arguments[1])
    console.log(arguments[2])
    console.log(arguments[3])
    p.posterize(file, {threshold: threshold, steps: steps}, function(err, svg) {
        if (err) throw err;
        fs.writeFileSync(outputFile, svg);
      });
    }
module.exports = {processPNGtoSVG, processPNGtoPosterize};
