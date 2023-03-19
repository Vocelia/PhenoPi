const utils = require("../utils.js");
const gm = require('gm').subClass({ imageMagick: '7+' });

function scroll(txt1, txt2) {
  return new Promise(async (res, rej) => {
    let rtn1, rtn2;
    let LowestSize=12, HighestSize = 40;
    let scroll = gm("assets/images/scroll.png").fill('#000000'); //black
    rtn1 = utils.fitImageAnnotation("assets/fonts/Arial.ttf", txt1, LowestSize, HighestSize, 108, 122);
    scroll.font("assets/fonts/Arial.ttf", rtn1.fontSize)
    .region(108, 122, 92, 284)
    .drawText(92, 284+rtn1.ascender, rtn1.text)
    if (txt2) {
      rtn2 = utils.fitImageAnnotation("assets/fonts/Arial.ttf", txt2, LowestSize, HighestSize, 229, 63);
      scroll.font("assets/fonts/Arial.ttf", rtn2.fontSize)
      .region(229, 63, 262, 416)
      .drawText(262, 416+rtn2.ascender, rtn2.text)
    }
    scroll.toBuffer((err, buffer) => {
      if (err) rej(err);
      else res(buffer);
    });
  }); 
}

module.exports = {
  scroll: scroll
};