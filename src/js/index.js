let style = document.createElement("style");
let counter = document.getElementById("visits-counter");
let memes_switch = document.querySelector("#memes-switch");


fetch('/visits')
  .then(response => response.json())
  .then(data => {
    counter.innerHTML = `Thanks for visiting!<br>Visits: <font color='red'>${data.visits}</font>`;
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