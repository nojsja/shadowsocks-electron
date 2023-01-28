module.exports = async function(content, {
  puppeteer, // puppeteer headless browser, see https://github.com/GoogleChrome/puppeteer for API reference.
  clipboard, // electron.clipboard
  http, // nodejs http module
  https, // nodejs https module
  fs, // nodejs fs module
  path, // nodejs path module
}) {
  const browser = await puppeteer.launch({
    headless: false,
    timeout: 30000,
  });
  const page = await browser.newPage();
  await page.goto('https://lncn.org/');

  page.click('.ssr-list-wrapper.base-box .el-button--primary');
  try {
    await browser.close();
  } catch (error) {}

  console.log(result);
  const result = clipboard.readText('clipboard');

  return result;
};
