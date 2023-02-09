module.exports = async function(
  content, // data from previous step
  {
    loadBrowserPage, // return -> [puppeteer page instance, destroy function]
    clipboard, // clipboard (electron)
    http, // http (nodejs)
    https, // https (nodejs)
    fs, // fs (nodejs)
    path, // path (nodejs)
  }
) {
  // see https://github.com/GoogleChrome/puppeteer for API reference.
  const [page, closeBrowser] = await loadBrowserPage('https://lncn.org/', {
    show: false, // show browser window, optional, default true.
    width: 800, // browser window width, optional.
    height: 600, // browser window height, optional.
  });

  // powered by puppeteer page API
  page.click('.ssr-list-wrapper.base-box .el-button--primary');

  closeBrowser();

  // see https://www.electronjs.org/docs/latest/api/clipboard for API reference.
  const result = clipboard.readText('clipboard');

  return result;
};
