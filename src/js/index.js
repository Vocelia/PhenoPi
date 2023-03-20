let counter = document.getElementById("visits-counter");

fetch('/visits')
  .then(response => response.json())
  .then(data => {
    counter.innerHTML = `Thanks for visiting!<br>Visits: <font color='red'>${data.visits}</font>`;
  })
  .catch(error => console.error(error));