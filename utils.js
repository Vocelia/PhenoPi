const { response } = require('express');
const opentype = require('opentype.js');

let StatusCode = {
  400: "Bad Request",
  413: "Payload Too Large",
  500: "Internal Server Error"
};

let DetailedError = {
  "TextOverFlow": {
    simplified: "Text Too Long",
    expanded: "The maximum text length allowed is /**/ character(s)"
  },
  "MissingParameters": {
    simplified: "Missing Required Parameters"
  },
  "InvalidURL": {
    simplified: "Invalid Image URL",
    expanded: "Please provide a valid URL to a PNG/JPEG image"
  },
  "InvalidIcon": {
    simplified: "Invalid icon ID",
    expanded: "Please provide a number ranging between 1 and 45"
  },
  "ImageTooLarge": {
    simplified: "Image Too Large",
    expanded: "The maximum image size allowed is /**/ MB(s)"
  },
  "ServerConflict": {
    simplified: "An Exception Has Occured"
  }
};

let getWebResponse = (code, error, value=null, details=null) => {
  try {
    let css, html;
    css = `* {
      margin: 0.1em;
    }`;
    if (typeof DetailedError[error].expanded != "undefined")
      html = `<center><h1 class="status">Error ${code.toString()}: ${StatusCode[code]}</h1></center><br/>
    <h3 class="simplified"><u>${DetailedError[error].simplified}</u></h3>
    <ul>
      <li class="expanded">${(!value) ? DetailedError[error].expanded : DetailedError[error].expanded.replace("/**/", value)}.</li>
    </ul>
    <p class="supplementary"><b>${(!details) ? `` : details}</b></p>`;
    else html = `<center><h1 class="status">Error ${code.toString()}: ${StatusCode[code]}</h1></center><br/>
    <h3 class="simplified"><u>${DetailedError[error].simplified}</u></h3>
    <p class="supplementary"><b>${(!details) ? `` : details}</b></p>`;
    return `<head>
      <style>
      ${css}
      </style>
    </head>
    ${html}`;
  } catch (err) { throw(err); }
}

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
  getWebResponse: getWebResponse,
  getHeaderObject: getHeaderObject,
  fitImageAnnotation: fitImageAnnotation
}