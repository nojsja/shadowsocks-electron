const puppeteer = require('puppeteer');
const { clipboard } = require('electron');

module.exports = async function(content, {
  crawler, // web crawler, see https://github.com/bda-research/node-crawler for API reference.
  clipboard, // electron clipboard module
  http, // nodejs http module
  https, // nodejs https module
  fs, // nodejs fs module
  path, // nodejs path module
}) {
  console.log(content);
  return '[source data]';;
};
