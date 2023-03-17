const utils = require("../utils.js");
const gm = require('gm').subClass({ imageMagick: '7+' });

function distracted(txt1, txt2, txt3) {
  return new Promise(async (res, rej) => {
    let rtn1, rtn2, rtn3;
    let LowestSize=30, HighestSize = 60;
    let img = gm("assets/images/distracted.png").fill('#ffffff'); //white
    rtn1 = utils.fitImageAnnotation("assets/fonts/impact.ttf", txt1, LowestSize, HighestSize, 287, 127);
    img.font("assets/fonts/impact.ttf", rtn1.fontSize)
    .stroke('#000000', rtn1.fontSize/((HighestSize+LowestSize)/2.5)) //black and stroke size
    .region(287, 127, 70, 293)
    .drawText(70, 293+rtn1.ascender, rtn1.text)
    rtn2 = utils.fitImageAnnotation("assets/fonts/impact.ttf", txt2, LowestSize, HighestSize, 195, 104);
    img.font("assets/fonts/impact.ttf", rtn2.fontSize)
    .stroke('#000000', rtn2.fontSize/((HighestSize+LowestSize)/2.5)) 
    .region(195, 104, 371, 192)
    .drawText(371, 192+rtn2.ascender, rtn2.text)
    rtn3 = utils.fitImageAnnotation("assets/fonts/impact.ttf", txt3, LowestSize, HighestSize, 161, 130);
    img.font("assets/fonts/impact.ttf", rtn3.fontSize)
    .stroke('#000000', rtn3.fontSize/((HighestSize+LowestSize)/2.5)) 
    .region(161, 130, 572, 246)
    .drawText(572, 246+rtn3.ascender, rtn3.text)
    img.toBuffer((err, buffer) => {
      if (err) rej(err);
      else res(buffer);
    });
  }); 
}

module.exports = {
  distracted: distracted
};