const express = require("express");
const app = require("express")();
const http = require("http").Server(app);
const path = require("path");
const fs = require("fs");
const utils = require("./utils.js");
const port = 8080;

let bad = require("./render/bad.js");
let ship = require("./render/ship.js");
let joke = require("./render/joke.js");
let what = require("./render/what.js");
let brain = require("./render/brain.js");
let scroll = require("./render/scroll.js");
let distracted = require("./render/distracted.js");
let achievement = require("./render/achievement.js");
let alwayshasbeen = require("./render/always_has_been.js");

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
app.use("/src", express.static(path.join(__dirname, "src")));

app.get("/", (req, res) => {
  let visitsFile = fs.readFileSync("./data/visits.json", "utf-8");
  let visits = JSON.parse(visitsFile);
  visits["visits"]++;
  visitsFile = JSON.stringify(visits, null, 4);
  fs.writeFileSync("./data/visits.json", visitsFile, "utf-8");
  res.render("index");
});

app.get("/visits", (req, res) => {
  let visitsFile = fs.readFileSync("./data/visits.json", "utf-8");
  let visits = JSON.parse(visitsFile);
  res.send(visits);
});

app.get("/endpoints", (req, res) => {
  res.send(getEndpoints());
});

app.get("/scroll", async (req, res) => {
  let data; let txt1 = req.query.txt1; let txt2 = req.query.txt2;
  if (!txt1) {
    res.status(400).send(utils.getWebResponse(400, "MissingParameters", null, "/scroll?txt1=...&txt2=...[OPTIONAL]")); return;
  } else if (txt1.length > 256 || (typeof txt2 != "undefined" && txt2.length > 256)) {
      res.status(413).send(utils.getWebResponse(413, "TextOverFlow", "256", null)); return;
  }
  try { data = await scroll.scroll(txt1, txt2); }
  catch (err) { res.status(500).send(utils.getWebResponse(500, "ServerConflict", null, err)); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/alwayshasbeen", async (req, res) => {
  let data;
  let txt1 = req.query.txt1; let txt2 = req.query.txt2;
  let txt3 = req.query.txt3; let txt4 = req.query.txt4;
  if (!(txt1 && txt2)) {
    res.status(400).send(utils.getWebResponse(400, "MissingParameters", null, "/alwayshasbeen?txt1=...&txt2=...&txt3=...[OPTIONAL]&txt4=...[OPTIONAL]")); return;
  } else if (txt1.length > 256 || txt2.length > 256 ||
      (typeof txt3 != "undefined" && txt3.length > 256) || 
      (typeof txt4 != "undefined" && txt4.length > 256)) {
      res.status(413).send(utils.getWebResponse(413, "TextOverFlow", "256", null)); return;
  }
  try { data = await alwayshasbeen.alwayshasbeen(txt1, txt2, txt3, txt4); }
  catch (err) { res.status(500).send(utils.getWebResponse(500, "ServerConflict", null, err)); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/distracted", async (req, res) => {
  let data; let txt1 = req.query.txt1;
  let txt2 = req.query.txt2; let txt3 = req.query.txt3;
  if (!(txt1 && txt2 && txt3)) {
    res.status(400).send(utils.getWebResponse(400, "MissingParameters", null, "/distracted?txt1=...&txt2=...&txt3=...")); return;
  } else if (txt1.length > 128 || txt2.length > 128 || txt3.length > 128) {
      res.status(413).send(utils.getWebResponse(413, "TextOverFlow", "128", null)); return;
  }
  try { data = await distracted.distracted(txt1, txt2, txt3); }
  catch (err) { res.status(500).send(utils.getWebResponse(500, "ServerConflict", null, err)); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/what", async (req, res) => {
  let data, url_type;
  let url = req.query.url;
  if (!url) {
    res.status(400).send(utils.getWebResponse(400, "MissingParameters", null, "/what?url=...")); return;
  } else { //Check if given URL is valid
    try { url_type = await utils.getHeaderObject(req.query.url, 'Content-Type'); }
    catch (err) { res.status(400).send(utils.getWebResponse(400, "InvalidURL", null, err)); return; }
  }
  if (!['image/png', 'image/jpeg'].includes(url_type)) {
    res.status(400).send(utils.getWebResponse(400, "InvalidURL", null, null)); return; 
  }
  let url_len = await utils.getHeaderObject(req.query.url, 'Content-Length');
  if (url_len>(6*1024*1024)) { //Limit is set to 6 Megabytes
    res.status(413).send(utils.getWebResponse(413, "ImageTooLarge", "6", null)); return;
  }
  try { data = await what.what(url); }
  catch (err) { res.status(500).send(utils.getWebResponse(500, "ServerConflict", null, err)); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/bad", async (req, res) => {
  let data; let url = req.query.url;  let text = req.query.text; 
  if ((typeof text != "undefined" && text.length > 256)) {
    res.status(413).send(utils.getWebResponse(413, "TextOverFlow", "256", null)); return;
  }
  if (!url) {
    res.status(400).send(utils.getWebResponse(400, "MissingParameters", null, "/bad?url=...&text=...[OPTIONAL]")); return;
  } else {
    try { //Check if given URL is valid
      await utils.getHeaderObject(url, 'Content-Type');
    } catch (err) {
      res.status(400).send(utils.getWebResponse(400, "InvalidURL", null, null)); return; 
    }
  }
  let url_type = await utils.getHeaderObject(req.query.url, 'Content-Type');
  if (!['image/png', 'image/jpeg'].includes(url_type)) {
    res.status(400).send(utils.getWebResponse(400, "InvalidURL", null, null)); return; 
  }
  let url_len = await utils.getHeaderObject(req.query.url, 'Content-Length');
  if (url_len>(6*1024*1024)) { //Limit is set to 6 Megabytes
    res.status(413).send(utils.getWebResponse(413, "ImageTooLarge", "6", null)); return;
  }
  try { data = await bad.bad(url, text); }
  catch (err) { res.status(500).send(utils.getWebResponse(500, "ServerConflict", null, err)); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/brain", async (req, res) => {
  let txt1 = req.query.txt1; let txt2 = req.query.txt2; 
  let data; let txt3 = req.query.txt3; let txt4 = req.query.txt4;
  if (!(txt1 || txt2 || txt3 || txt4)) {
    res.status(400).send(utils.getWebResponse(400, "MissingParameters", null, "/brain?txt1=...[OPTIONAL]&txt2=...[OPTIONAL]&txt3=...[OPTIONAL]&txt4=...[OPTIONAL] (Provide at least one parameter)")); return;
  } else if ((typeof txt1 != "undefined" && txt1.length > 256) || 
      (typeof txt2 != "undefined" && txt2.length > 256) || 
      (typeof txt3 != "undefined" && txt3.length > 256) || 
      (typeof txt4 != "undefined" && txt4.length > 256)) {
      res.status(413).send(utils.getWebResponse(413, "TextOverFlow", "256", null)); return;
  }
  try { data = await brain.brain(txt1, txt2, txt3, txt4); }
  catch (err) { res.status(500).send(utils.getWebResponse(500, "ServerConflict", null, err)); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/joke", async (req, res) => {
  let data; let url = req.query.url;
  if (!url) {
    res.status(400).send(utils.getWebResponse(400, "MissingParameters", null, "/joke?url=...")); return;
  } else {
    try { //Check if given URL is valid
      await utils.getHeaderObject(url, 'Content-Type');
    } catch (err) {
      res.status(400).send(utils.getWebResponse(400, "InvalidURL", null, null)); return; 
    }
  }
  let url_type = await utils.getHeaderObject(req.query.url, 'Content-Type');
  if (!['image/png', 'image/jpeg'].includes(url_type)) {
    res.status(400).send(utils.getWebResponse(400, "InvalidURL", null, null)); return; 
  }
  let url_len = await utils.getHeaderObject(req.query.url, 'Content-Length');
  if (url_len>(6*1024*1024)) { //Limit is set to 6 Megabytes
    res.status(413).send(utils.getWebResponse(413, "ImageTooLarge", "6", null)); return;
  }
  try { data = await joke.joke(url); }
  catch (err) { res.status(500).send(utils.getWebResponse(500, "ServerConflict", null, err)); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/ship", async (req, res) => {
  let data; let url1 = req.query.url1; let url2 = req.query.url2;
  if (!url1 || !url2) {
    res.status(400).send(utils.getWebResponse(400, "MissingParameters", null, "/ship?url1=...&url2=...")); return;
  } else {
    try { //Check if given URLs are valid
      await utils.getHeaderObject(url1, 'Content-Type');
      await utils.getHeaderObject(url2, 'Content-Type');
    } catch (err) {
      res.status(400).send(utils.getWebResponse(400, "InvalidURL", null, null)); return; 
    }
  }
  let url1_type = await utils.getHeaderObject(req.query.url1, 'Content-Type');
  let url2_type = await utils.getHeaderObject(req.query.url2, 'Content-Type');
  if (!['image/png', 'image/jpeg'].includes(url1_type) || !['image/png', 'image/jpeg'].includes(url2_type)) {
    res.status(400).send(utils.getWebResponse(400, "InvalidURL", null, null)); return; 
  }
  let url1_len = await utils.getHeaderObject(req.query.url1, 'Content-Length');
  let url2_len = await utils.getHeaderObject(req.query.url2, 'Content-Length');
  if (url1_len>(6*1024*1024) || url2_len>(6*1024*1024)) { //Limit is set to 6 Megabytes
    res.status(413).send(utils.getWebResponse(413, "ImageTooLarge", "6", null)); return;
  }
  try { data = await ship.ship(url1, url2); }
  catch (err) { res.status(500).send(utils.getWebResponse(500, "ServerConflict", null, err)); return; }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

app.get("/achievement", async (req, res) => {
  let text = req.query.text;
  let data, icon = req.query.icon;
  if (text) {
    if (req.query.text.length>2048) { 
      res.status(413).send(utils.getWebResponse(413, "TextOverFlow", "2048", null)); return;
    }
  } else {
    res.status(400).send(utils.getWebResponse(400, "MissingParameters", null, "/achievement?text=...&icon=...[OPTIONAL]")); return;
  }
  if (icon) {
    if (parseInt(icon) && (1<=icon && icon<=45)) {
      try { data = await achievement.achievement(text, icon); }
      catch (err) { res.status(500).send(utils.getWebResponse(500, "ServerConflict", null, err)); return; }
    } else if (1>icon || icon>45) {
      res.status(400).send(utils.getWebResponse(400, "InvalidIcon", null, null)); return;
    } else {
      res.status(400).send(utils.getWebResponse(400, "InvalidIcon", null, null)); return; 
    }
  } else {
    try { data = await achievement.achievement(text); }
    catch (err) { res.status(500).send(utils.getWebResponse(500, "ServerConflict", null, err)); return; }
  }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

http.listen(port, () => {
  console.log("Listening on: ", port);
});