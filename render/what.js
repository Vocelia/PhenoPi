const jimp = require("jimp");

function what(url) {
  return new Promise(async (res, rej) => {
    let img;
    try {
      img = await jimp.read({url: url, header: {}});
    } catch (err) { rej(err); }
    let what = await jimp.read("assets/images/what.png");
    img.resize(890, 710);
    let main = new jimp(what.getWidth(), what.getHeight(), 0x00000000);
    main
    .composite(img, 40, 40)
    .composite(what, 0, 0)
    .getBuffer(jimp.MIME_PNG, (err, buffer) => {
      if (err) rej(err);
      else res(buffer);
    });
  }); 
}

module.exports = {
  what: what
};