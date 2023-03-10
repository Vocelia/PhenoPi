let getHeaderObject = (url, obj) => {
  return new Promise((res, rej) => {
    fetch(url)
    .then((response) => { return response.headers.get(obj) })
    .then((type) => { res(type); })
    .catch((err) => { rej(err); });
  });
}

module.exports = {
  getHeaderObject: getHeaderObject
}