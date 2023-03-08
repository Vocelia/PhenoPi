const app = require("express")();
const http = require("http").Server(app);
const path = require("path");
const port = 8080;

let achievement = require("./render/achievement.js")

let getEndpoints = () => {
  let excluded = [
    "/", "/endpoints"
  ]; let endpoints =  [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route && !excluded.includes(middleware.route.path)) {
      let path = middleware.route.path;
      let methods = Object.keys(middleware.route.methods).join(",");
      endpoints.push(`${methods}    ${path}`);
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
})

app.get("/achievement", async (req, res) => {
  let text = req.query.text;
  let data, icon = req.query.icon;
  if (text) {
    if (req.query.text.length>2048) res.status(413).send("<h1>Error 413: Payload Too Large</h1><p>Text too long. The maximum text allowed is 2048 characters.</p>");
  } else res.status(400).send("<h1>Error 400: Bad Request</h1><p>Missing required parameters.</p> <p><b>/achievement?text=...&icon=...[OPTIONAL]</b></p>");
  if (icon) {
    if (parseInt(icon) && (1<=icon && icon<=45)) data = await achievement.achievement(text, icon);
    else if (1>icon || icon>45) { res.status(400).send("<h1>Error 400: Bad Request</h1><p>Invalid icon ID. Please input a valid number between 1 and 45.</p>"); return; }
    else { res.status(400).send("<h1>Error 400: Bad Request</h1><p>Invalid icon ID. Please input a valid number between 1 and 45.</p>"); return; }
  } else data = await achievement.achievement(text);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'inline');
  res.send(Buffer.from(data));
});

http.listen(port, () => {
  console.log("Listening on: ", port);
});