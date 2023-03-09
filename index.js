const app = require("express")();
const http = require("http").Server(app);
const path = require("path");
const port = 8080;

let ship = require("./render/ship.js");
let achievement = require("./render/achievement.js");

let getHeaderObject = (url, obj) => {
  return new Promise((res, rej) => {
    fetch(url)
    .then((response) => { return response.headers.get(obj) })
    .then((type) => { res(type); })
    .catch((err) => { rej(err); });
  });
}

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
  //No page to display yet
});

app.get("/endpoints", (req, res) => {
  res.send(getEndpoints());
});

app.get("/ship", async (req, res) => {
  let data; let url1 = req.query.url1; let url2 = req.query.url2;
  if (!url1 || !url2) {
    res.status(400).send(
      "<h1>Error 400: Bad Request</h1><p>Missing required parameters.</p><p><b>/ship?url1=...&url2=...</b></p>"
    ); return;
  } else {
    try { //Check if given URLs are valid
      await getHeaderObject(url1, 'Content-Type');
      await getHeaderObject(url2, 'Content-Type');
    } catch (err) {
      res.status(400).send(
        "<h1>Error 400: Bad Request</h1><p>Invalid Image URL. Please provide a valid URL to a png/jpeg image.</b></p>"
      ); return; 
    }
  }
  let url1_type = await getHeaderObject(req.query.url1, 'Content-Type');
  let url2_type = await getHeaderObject(req.query.url2, 'Content-Type');
  if (!['image/png', 'image/jpeg'].includes(url1_type) || !['image/png', 'image/jpeg'].includes(url2_type)) {
    res.status(400).send(
      "<h1>Error 400: Bad Request</h1><p>Invalid Image URL. Please provide a valid URL to a png/jpeg image.</b></p>"
    ); return; 
  }
  let url1_len = await getHeaderObject(req.query.url1, 'Content-Length');
  let url2_len = await getHeaderObject(req.query.url2, 'Content-Length');
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