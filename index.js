const app = require("express")();
const http = require("http").Server(app);
const path = require("path");
const utils = require("./utils.js");
const port = 8080;

let ship = require("./render/ship.js");
let joke = require("./render/joke.js");
let bad = require("./render/bad.js");
let brain = require("./render/brain.js");
let achievement = require("./render/achievement.js");

let getEndpoints = () => {
  let excluded = [
    "/", "/endpoints"
  ]; let endpoints =  [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route && !excluded.includes(middleware.route.path)) {
      let path = middleware.route.path;
      let methods = Object.keys(middleware.route.methods).join(",");
      endpoints.push(`${methods.toUpperCase()}    ${path}`);
    }
  });
  return endpoints;
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));

app.get("/", (req, res) => {
  //Ahem...nothing here yet.......
});

app.get("/endpoints", (req, res) => {
  res.send(getEndpoints());
});

app.get("/bad", async (req, res) => {
  let data; let url = req.query.url;  let text = req.query.text; 
  if ((typeof text != "undefined" && text.length > 256)) {
    res.status(413).send(
      "<h1>Error 413: Payload Too Large</h1><p>Text too long. The maximum text allowed is 256 characters.</p>"
    ); return;
  }
  if (!url) {
    res.status(400).send(
      "<h1>Error 400: Bad Request</h1><p>Missing required parameters.</p><p><b>/bad?url=...&text=...[OPTIONAL]</b></p>"
    ); return;
  } else {
    try { //Check if given URL is valid
      await utils.getHeaderObject(url, 'Content-Type');
    } catch (err) {
      res.status(400).send(
        "<h1>Error 400: Bad Request</h1><p>Invalid Image URL. Please provide a valid URL to a png/jpeg image.</b></p>"
      ); return; 
    }
  }
  let url_type = await utils.getHeaderObject(req.query.url, 'Content-Type');
  if (!['image/png', 'image/jpeg'].includes(url_type)) {
    res.status(400).send(
      "<h1>Error 400: Bad Request</h1><p>Invalid Image URL. Please provide a valid URL to a png/jpeg image.</b></p>"
    ); return; 
  }
  let url_len = await utils.getHeaderObject(req.query.url, 'Content-Length');
  if (url_len>(6*1024*1024)) { //Limit is set to 6 Megabytes
    res.status(413).send(
      "<h1>Error 413: Payload Too Large</h1><p>Image too large. The maximum Megabytes allowed is 6 MBs.</p>"
    ); return;
  }
  try { data = await bad.bad(url, text); }
  catch (err) { res.status(500).send(`<h1>Error 500: Internal Server Error</h1><p>Something unexpected happened.</p><p><b>${err}</b></p>`); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/brain", async (req, res) => {
  let txt1 = req.query.txt1; let txt2 = req.query.txt2; 
  let data; let txt3 = req.query.txt3; let txt4 = req.query.txt4;
  if (!(txt1 || txt2 || txt3 || txt4)) {
    res.status(400).send(
      "<h1>Error 400: Bad Request</h1><p>Missing required parameters.</p><p><b>/brain?txt1=...[OPTIONAL]&txt2=...[OPTIONAL]&txt3=...[OPTIONAL]&txt4=...[OPTIONAL]</b></p>"
    ); return;
  } else {
    if ((typeof txt1 != "undefined" && txt1.length > 256) || 
      (typeof txt2 != "undefined" && txt2.length > 256) || 
      (typeof txt3 != "undefined" && txt3.length > 256) || 
      (typeof txt4 != "undefined" && txt4.length > 256)) {
      res.status(413).send(
        "<h1>Error 413: Payload Too Large</h1><p>Text too long. The maximum text allowed is 256 characters.</p>"
      ); return;
    }
  }
  try { data = await brain.brain(txt1, txt2, txt3, txt4); }
  catch (err) { res.status(500).send(`<h1>Error 500: Internal Server Error</h1><p>Something unexpected happened.</p><p><b>${err}</b></p>`); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/joke", async (req, res) => {
  let data; let url = req.query.url;
  if (!url) {
    res.status(400).send(
      "<h1>Error 400: Bad Request</h1><p>Missing required parameters.</p><p><b>/joke?url=...</b></p>"
    ); return;
  } else {
    try { //Check if given URL is valid
      await utils.getHeaderObject(url, 'Content-Type');
    } catch (err) {
      res.status(400).send(
        "<h1>Error 400: Bad Request</h1><p>Invalid Image URL. Please provide a valid URL to a png/jpeg image.</b></p>"
      ); return; 
    }
  }
  let url_type = await utils.getHeaderObject(req.query.url, 'Content-Type');
  if (!['image/png', 'image/jpeg'].includes(url_type)) {
    res.status(400).send(
      "<h1>Error 400: Bad Request</h1><p>Invalid Image URL. Please provide a valid URL to a png/jpeg image.</b></p>"
    ); return; 
  }
  let url_len = await utils.getHeaderObject(req.query.url, 'Content-Length');
  if (url_len>(6*1024*1024)) { //Limit is set to 6 Megabytes
    res.status(413).send(
      "<h1>Error 413: Payload Too Large</h1><p>Image too large. The maximum Megabytes allowed is 6 MBs.</p>"
    ); return;
  }
  try { data = await joke.joke(url); }
  catch (err) { res.status(500).send(`<h1>Error 500: Internal Server Error</h1><p>Something unexpected happened.</p><p><b>${err}</b></p>`); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/ship", async (req, res) => {
  let data; let url1 = req.query.url1; let url2 = req.query.url2;
  if (!url1 || !url2) {
    res.status(400).send(
      "<h1>Error 400: Bad Request</h1><p>Missing required parameters.</p><p><b>/ship?url1=...&url2=...</b></p>"
    ); return;
  } else {
    try { //Check if given URLs are valid
      await utils.getHeaderObject(url1, 'Content-Type');
      await utils.getHeaderObject(url2, 'Content-Type');
    } catch (err) {
      res.status(400).send(
        "<h1>Error 400: Bad Request</h1><p>Invalid Image URL. Please provide a valid URL to a png/jpeg image.</b></p>"
      ); return; 
    }
  }
  let url1_type = await utils.getHeaderObject(req.query.url1, 'Content-Type');
  let url2_type = await utils.getHeaderObject(req.query.url2, 'Content-Type');
  if (!['image/png', 'image/jpeg'].includes(url1_type) || !['image/png', 'image/jpeg'].includes(url2_type)) {
    res.status(400).send(
      "<h1>Error 400: Bad Request</h1><p>Invalid Image URL. Please provide a valid URL to a png/jpeg image.</b></p>"
    ); return; 
  }
  let url1_len = await utils.getHeaderObject(req.query.url1, 'Content-Length');
  let url2_len = await utils.getHeaderObject(req.query.url2, 'Content-Length');
  if (url1_len>(6*1024*1024) || url2_len>(6*1024*1024)) { //Limit is set to 6 Megabytes
    res.status(413).send(
      "<h1>Error 413: Payload Too Large</h1><p>Image too large. The maximum Megabytes allowed is 6 MBs.</p>"
    ); return;
  }
  try { data = await ship.ship(url1, url2); }
  catch (err) { res.status(500).send(`<h1>Error 500: Internal Server Error</h1><p>Something unexpected happened.</p><p><b>${err}</b></p>`); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/achievement", async (req, res) => {
  let text = req.query.text;
  let data, icon = req.query.icon;
  if (text) {
    if (req.query.text.length>2048) { 
      res.status(413).send(
        "<h1>Error 413: Payload Too Large</h1><p>Text too long. The maximum text allowed is 2048 characters.</p>"
      ); return;
    }
  } else {
    res.status(400).send(
      "<h1>Error 400: Bad Request</h1><p>Missing required parameters.</p><p><b>/achievement?text=...&icon=...[OPTIONAL]</b></p>"
    ); return;
  }
  if (icon) {
    if (parseInt(icon) && (1<=icon && icon<=45)) {
      try { data = await achievement.achievement(text, icon); }
      catch (err) { res.status(500).send(`<h1>Error 500: Internal Server Error</h1><p>Something unexpected happened.</p><p><b>${err}</b></p>`); return; }
    } else if (1>icon || icon>45) {
      res.status(400).send(
        "<h1>Error 400: Bad Request</h1><p>Invalid icon ID. Please input a valid number between 1 and 45.</p>"
      ); return;
    } else {
      res.status(400).send(
        "<h1>Error 400: Bad Request</h1><p>Invalid icon ID. Please input a valid number between 1 and 45.</p>"
      ); return; 
    }
  } else {
    try { data = await achievement.achievement(text); }
    catch (err) { res.status(500).send(`<h1>Error 500: Internal Server Error</h1><p>Something unexpected happened.</p><p><b>${err}</b></p>`); return; }
  }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

http.listen(port, () => {
  console.log("Listening on: ", port);
});