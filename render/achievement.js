const jimp = require("jimp");
const gm = require('gm').subClass({ imageMagick: '7+' });

let icons = {
  "1": "Grass block", "2": "Diamond", "3": "Diamond sword",
  "4": "Creeper", "5": "Pig", "6": "TNT",
  "7": "Cookie", "8": "Heart", "9": "Bed",
  "10": "Cake", "11": "Sign", "12": "Rail",
  "13": "Crafting bench", "14": "Redstone", "15": "Fire",
  "16": "Cobweb", "17": "Chest", "18": "Furnace",
  "19": "Book", "20": "Stone block", "21": "Wooden plank block",
  "22": "Iron ingot", "23": "Gold ingot", "24": "Wooden door",
  "25": "Iron Door", "26": "Diamond chestplate", "27": "Flint and steel",
  "28": "Glass bottle", "29": "Splash potion", "30": "Creeper spawnegg",
  "31": "Coal", "32": "Iron sword", "33": "Bow",
  "34": "Arrow", "35": "Iron chestplate", "36": "Bucket",
  "37": "Bucket with water", "38": "Bucket with lava", "39": "Bucket with milk",
  "40": "Diamond boots", "41": "Wooden hoe", "42": "Bread", "43": "Wooden sword",
  "44": "Bone", "45": "Oak log"
};

async function achievement(text, icon=null) {
  //215 is set as the minimum width
  //each character is approximately 10.5 wide and 50 for padding
  let textW = (Math.round(text.length * 10.5)<215) ? 215 : Math.round(text.length * 10.5)+50;
  icon = (!icon) ? Math.floor(Math.random()* 45)+1 : icon;
  let main = await jimp.read(`assets/achievement/${icon}.png`);
  let achmid = await jimp.read("assets/achievement/achmid.png");
  let achend = await jimp.read("assets/achievement/achend.png");
  let img = new jimp(main.getWidth()+textW+achend.getWidth(), main.getHeight(), 0x00000000); //Creates new image
  img.composite(main, 0, 0);
  for (let i=0; i<textW; i++) img.composite(achmid, main.getWidth()+(achmid.getWidth()*i), 0);
    return new Promise((res, rej) => {
      img
      .composite(achend, main.getWidth()+textW, 0)
      .getBuffer(jimp.MIME_PNG, (err, buffer) => {
        if (err) rej(err);
        else {
          gm(buffer)
          .font("assets/fonts/Minecraft.ttf", 16)
          .fill('#ffff00') //yellow
          .drawText(60, 25, "Achievement get!")
          .fill('#ffffff') //white
          .drawText(60, 45, text)
          .toBuffer((err, buffer) => {
            if (err) rej(err);
            else res(buffer);
          });
        }
      });
    });
}

module.exports = {
  icons: icons,
  achievement: achievement
};