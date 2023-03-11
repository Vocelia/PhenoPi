const utils = require("../utils.js");
const gm = require('gm').subClass({ imageMagick: '7+' });

function brain(txt1, txt2, txt3, txt4) {
  return new Promise((res, rej) => {
    let HighestSize = 60; //font size
    let LowestSize = 20; //font size
    let rtn1 = utils.fitImageAnnotation("assets/fonts/impact.ttf", txt1, LowestSize, HighestSize, 247, 174);
    let rtn2 = utils.fitImageAnnotation("assets/fonts/impact.ttf", txt2, LowestSize, HighestSize, 247, 177);
    let rtn3 = utils.fitImageAnnotation("assets/fonts/impact.ttf", txt3, LowestSize, HighestSize, 245, 159);
    let rtn4 = utils.fitImageAnnotation("assets/fonts/impact.ttf", txt4, LowestSize, HighestSize, 247, 179);
    let img = gm("assets/images/brain.png");
    img //txt1
    .font("assets/fonts/impact.ttf", rtn1.fontSize)
    .fill('#ffffff') //white
    .stroke('#000000', rtn1.fontSize/((HighestSize+LowestSize)/2.5)) //black and stroke size
    .region(247, 174, 0, 0)
    .drawText(0, rtn1.ascender, rtn1.text)
    img //txt2
    .font("assets/fonts/impact.ttf", rtn2.fontSize)
    .stroke('#000000', rtn2.fontSize/((HighestSize+LowestSize)/2.5)) 
    .region(247, 177, 0, 176)
    .drawText(0, 176+rtn2.ascender, rtn2.text)
    img //txt3
    .font("assets/fonts/impact.ttf", rtn3.fontSize)
    .stroke('#000000', rtn3.fontSize/((HighestSize+LowestSize)/2.5)) 
    .region(245, 159, 0, 356)
    .drawText(0, 356+rtn3.ascender, rtn3.text)
    img //txt4
    .font("assets/fonts/impact.ttf", rtn4.fontSize)
    .stroke('#000000', rtn4.fontSize/((HighestSize+LowestSize)/2.5))
    .region(247, 179, 0, 522)
    .drawText(0, 522+rtn4.ascender, rtn4.text)
    .toBuffer((err, buffer) => {
      if (err) rej(err);
      else res(buffer);
    });
  }); 
}

module.exports = {
  brain: brain
};