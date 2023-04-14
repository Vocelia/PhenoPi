let entries;
let style = document.createElement("style");
let counter = document.getElementById("visits-counter");
let memes_switch = document.querySelector("#memes-switch");
let meme_selector = document.querySelector(".meme-selector");
let controls = document.getElementsByClassName("controls");

fetch('/visits')
  .then(response => response.json())
  .then(data => {
    counter.innerHTML = `Thanks for visiting!<br>Visits: <font color='red'>${data.visits}</font>`;
  })
  .catch(error => console.error(error));

fetch('/entries.json')
  .then(response => response.json())
  .then(data => entries = data)
  .catch(error => console.error(error));

fetch('/endpoints')
  .then(response => response.json())
  .then(data => {
    for (i=0; i<data.length; i++) {
      let element = document.createElement("option");
      element.innerHTML = entries[data[i].substring(data[i].indexOf('/')+1)].name;
      meme_selector.appendChild(element);
    }
  })
  .catch(error => console.error(error));

memes_switch.addEventListener("change", (event) => {
  if (!event.target.checked) {
    if (prompt("How do you like this feature?", "")=="free") {
      alert("You're saved for now!");
      document.head.removeChild(style);
      return;
    }
    style.innerHTML = `*:hover { display: none; }`;
    document.head.appendChild(style);
  }
});

meme_selector.addEventListener("change", (event) => {
  
});