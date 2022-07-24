const fs = require('fs');
const sharp = require('sharp');

let options = { height: 1080 }
sharp("I:/emulationStation/.emulationstation/media/images/1on1gov.png")
  .resize(options)
  .toFile('output.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });