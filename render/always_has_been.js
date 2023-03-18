const utils = require("../utils.js");
const gm = require('gm').subClass({ imageMagick: '7+' });

function alwayshasbeen(txt1, txt2, txt3, txt4) {
  return new Promise(async (res, rej) => {
    let rtn1, rtn2, rtn3, rtn4;
    let LowestSize=12, HighestSize = 60;
    let img = gm("assets/images/always_has_been.png").fill('#ffffff'); //white
    rtn1 = utils.fitImageAnnotation("assets/fonts/Arial.ttf", txt1, LowestSize, HighestSize, 370, 92);
    img.font("assets/fonts/Arial.ttf", rtn1.fontSize)
    .region(370, 92, 217, 128)
    .drawText(217, 128+rtn1.ascender, rtn1.text)
    rtn2 = utils.fitImageAnnotation("assets/fonts/Arial.ttf", txt2, LowestSize, HighestSize, 300, 83);
    img.font("assets/fonts/Arial.ttf", rtn2.fontSize)
    .region(300, 83, 551, 0)
    .drawText(551, rtn2.ascender, rtn2.text)
    if (txt3) {
      rtn3 = utils.fitImageAnnotation("assets/fonts/Arial.ttf", txt3, LowestSize, HighestSize, 150, 75);
      img.font("assets/fonts/Arial.ttf", rtn3.fontSize)
      .region(150, 75, 360, 350)
      .drawText(360, 350+rtn3.ascender, rtn3.text)
    }
    if (txt4) {
      rtn4 = utils.fitImageAnnotation("assets/fonts/Arial.ttf", txt4, LowestSize, HighestSize, 210, 114);
      img.font("assets/fonts/Arial.ttf", rtn4.fontSize)
      .region(210, 114, 664, 261)
      .drawText(664, 261+rtn4.ascender, rtn4.text)
    }
    img.toBuffer((err, buffer) => {
      if (err) rej(err);
      else res(buffer);
    });
  }); 
}

module.exports = {
  alwayshasbeen: alwayshasbeen
};