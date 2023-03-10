const jimp = require("jimp");

function joke(url) {
  return new Promise(async (res, rej) => {
    let img;
    try { img = await jimp.read({url: url, header: {}}); }
    catch (err) { rej(err); }
    let joke = await jimp.read("assets/images/thejoke.png");
    let main = new jimp(joke.getWidth(), joke.getHeight(), 0x00000000);
    img.resize(138, 138);
    main
    .composite(img, 127, 125)
    .composite(joke, 0, 0)
    .getBuffer(jimp.MIME_PNG, (err, buffer) => {
      if (err) rej(err);
      else res(buffer);
    });
  }); 
}

module.exports = {
  joke: joke
};