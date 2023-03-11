const opentype = require('opentype.js');

let getHeaderObject = (url, obj) => {
  return new Promise((res, rej) => {
    fetch(url)
    .then((response) => { return response.headers.get(obj) })
    .then((type) => { res(type); })
    .catch((err) => { rej(err); });
  });
}

let fitImageAnnotation = (font, text, minSize, maxSize, regionW, regionH) => {
  //initialise all variables
  let glyph, height;
  let low = minSize;
  let mid = maxSize;
  let high = maxSize;
  let resultantText = "";
  let scale, lineW, linebreak;
  let fontIns = opentype.loadSync(font);
  while (true) {
    //reset all variables on each loop
    resultantText = "";
    lineW = 0; linebreak = 0;
    scale = mid/fontIns.unitsPerEm; //get the scale responsible for pixel calculations
    for (let i=0; i<text.length; i++) {
      //if text reaches the end of the line
      if (lineW+(fontIns.charToGlyph(text[i]).advanceWidth*scale)>regionW) {
        resultantText += `\n${text[i]}`; lineW = 0;
      } else { //if it doesn't reach the end of the line
        resultantText += text[i];
      }
      glyph = fontIns.charToGlyph(text[i]);
      lineW += glyph.advanceWidth * scale; //get the width of the current character and add it to the width of the line
      height = (glyph.yMax-glyph.yMin) * scale; //get the height of the current character and assign it as the linebreak
      linebreak = (linebreak<(height+(height/2))) ? (height+(height/2)) : linebreak;
      //This method is unreliable, so I might change it in the future
    }
    resultantText += '\n';
    //if text overflows out of boundary
    if (regionH<=(resultantText.split('\n').length-1)*linebreak) {
      high = mid;
      mid = Math.floor((high+low)/2);
      //if text already reached the minimum size
      if (mid<=minSize) return {
        fontSize: mid,
        text: resultantText,
        ascender: (fontIns.ascender/fontIns.unitsPerEm)*mid
      };
    } else return {
      fontSize: mid,
      text: resultantText,
      ascender: (fontIns.ascender/fontIns.unitsPerEm)*mid
    };
  }
}

module.exports = {
  getHeaderObject: getHeaderObject,
  fitImageAnnotation: fitImageAnnotation
}