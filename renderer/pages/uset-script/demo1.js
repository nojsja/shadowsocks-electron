const puppeteer = require('puppeteer');
const { clipboard } = require('electron');

async function main(puppeteer, clipboard) {
  const browser = await puppeteer.launch({
    headless: false,
    timeout: 30000,
  });
  const page = await browser.newPage();

  await page.goto('https://lncn.org/');
  page.click('.ssr-list-wrapper.base-box .el-button--primary');
  await browser.close();
  const result = clipboard.readText('clipboard');
  console.log(result);
}

main(puppeteer, clipboard);