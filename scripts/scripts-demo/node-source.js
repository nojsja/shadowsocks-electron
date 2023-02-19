module.exports = async function (
  content, // data from previous step
) {
  // see API https://nodejs.org/dist/latest-v16.x/docs/api/https.html.
  // import native nodejs module you need, such as http/https/fs/os/path.
  const https = require('https');
  const data = await new Promise((resolve) => {
    https.get('https://nodejs.org/en/', (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        resolve(rawData);
      });
      res.on('error', (error) => {
        resolve(null);
      });
    });
  });

  // pass data to next step
  return data.slice(0, 100);
};
