module.exports = async function (
  content, // data from previous step
  {
    http, // http (nodejs)
    https, // https (nodejs)
    clipboard, // clipboard (electron)
    fs, // fs (nodejs)
    path, // path (nodejs)
  }
) {
  return new Promise((resolve) => {
    http.get('http://www.google.com', (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        resolve(rawData);
      });
      res.on('error', (error) => {
        console.log(error);
        resolve(null);
      });
    });
  });
};
