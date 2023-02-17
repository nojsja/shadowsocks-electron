module.exports = async function (
  content, // data from previous step
) {
  // import native nodejs module you need, such as http/https/fs/os/path.
  // see API https://nodejs.org/docs/latest-v16.x/api/http.html.
  const http = require('http');
  const data = await new Promise((resolve) => {
    http.get('http://www.github.com', (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        resolve(rawData);
      });
      res.on('error', (error) => {
        resolve(null);
      });
    });
  });

  // pass data to next step
  return data;
};
