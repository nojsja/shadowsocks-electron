const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const HttpsProxyAgent = require('https-proxy-agent');

const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:1095');
const gfwListUrl =
  'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt';

(async () => {
  const isGfwlistTextExists = fs.existsSync(path.join(__dirname, 'gfwlist.txt'));

  if (isGfwlistTextExists) {
    fs.readFile(path.join(__dirname, 'gfwlist.txt'), 'utf-8',async (err, text) => {
      if (!err) {
        const str = Buffer.from(text, 'base64').toString('ascii');
        await fs.promises.writeFile(path.resolve(__dirname, '../pac/gfwlist.txt'), str);
      } else {
        console.log(err);
      }
    });
  } else {
    console.log(`Downloading from ${gfwListUrl}...`);
    const res = await fetch(gfwListUrl, { agent: proxyAgent });
    const base64 = await res.text();
    const text = Buffer.from(base64, 'base64').toString('ascii');
    await fs.promises.writeFile(path.resolve(__dirname, '../pac/gfwlist.txt'), text);
  }

  console.log("All tasks completed");
})();
