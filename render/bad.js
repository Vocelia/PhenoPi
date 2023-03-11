const jimp = require("jimp");
const utils = require("../utils.js");
const gm = require('gm').subClass({ imageMagick: '7+' });

function bad(url, text) {
  return new Promise(async (res, rej) => {
    let img, rtn, LowestSize = 20, HighestSize = 40;
    try { img = await jimp.read({url: url, header: {}}); }
    catch (err) { rej(err); }
    let bad = await jimp.read("assets/images/bad.jpg");
    img.resize(128, 128);
    bad.composite(img, 50, 215)
    .getBuffer(jimp.MIME_PNG, (err, buffer) => {
      if (err) rej(err);
      else {
        if (typeof text != "undefined") rtn = utils.fitImageAnnotation("assets/fonts/Arial.ttf", text, LowestSize, HighestSize, 222, 170);
        else { res(buffer); return; }
        gm(buffer).font("assets/fonts/Arial.ttf", rtn.fontSize)
        .fill('#000000') //black
        .region(222, 170, 15, 20)
        .drawText(15, 20+rtn.ascender, rtn.text)
        .toBuffer((err, buffer) => {
          if (err) rej(err);
          else res(buffer);
        });
      }
    });
  }); 
}

module.exports = {
  bad: bad
};