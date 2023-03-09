const jimp = require("jimp");

function ship(url1, url2) {
  return new Promise(async (res, rej) => {
    let img1, img2;
    try {
      img1 = await jimp.read({url: url1, header: {}});
      img2 = await jimp.read({url: url2, header: {}});
    } catch (err) { rej(err); }
    let heart = await jimp.read("assets/images/heart.png");
    img1.resize(heart.getWidth(), heart.getHeight());
    img2.resize(heart.getWidth(), heart.getHeight());
    let img = new jimp(img1.getWidth()+img2.getWidth()+heart.getWidth()+40, heart.getHeight(), 0x00000000); //20 as padding left and right the heart image
    img
    .composite(img1, 0, 0)
    .composite(heart, img1.getWidth()+20, 0)
    .composite(img2, img1.getWidth()+40+heart.getWidth(), 0)
    .getBuffer(jimp.MIME_PNG, (err, buffer) => {
      if (err) rej(err);
      else res(buffer);
    });
  }); 
}

module.exports = {
  ship: ship
};