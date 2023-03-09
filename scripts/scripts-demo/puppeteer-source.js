/**
 * API of Puppeteer Source Task
 * {any} $content - data from previous step, if current task is in first place, it will be undefined.
 * {function} loadBrowserPage - used to load web pages with puppeteer (external https://pptr.dev/api/puppeteer.page).
 * {native} fs - filesystem (nodejs).
 * {native} http - HTTP server and client (nodejs).
 * {native} https - HTTPS server and client (nodejs).
 * {native} path - utilities for file and directory paths (nodejs).
 * {native} crypto - provides cryptographic functionality (nodejs).
 * {native} os - operating system information (nodejs).
 * {native} url - utilities for URL resolution and parsing (nodejs).
 * {native} net - creating TCP/IPC servers/clients an (nodejs).
 * {native} fetch - nodejs port fetch API of browser (external https://www.npmjs.com/package/node-fetch)
 * {native} app - app (electron https://www.electronjs.org/docs/latest/api/app)
 * {native} clipboard - clipboard (electron https://www.electronjs.org/docs/api/clipboard)
 */

/**
 * @name loadBrowserPage [load web pages with puppeteer-in-electron]
 * @param {string} url [web page url you want visit in].
 * @param {object} options [options to create Electron BrowserWindow]
 * @param {boolean} options.show [show browser window, optional, default true]
 * @param {number} options.width [browser window width, optional, default 800]
 * @param {number} options.height [browser window height, optional, default 600]
 * @demo see more details in https://www.electronjs.org/docs/latest/api/browser-window
 */

async () => {
  console.log('>> puppeteer task start...');

  // for this web site, maybe you should open PAC mode of client to let puppeteer visit in,
  // or it will be blocked by firewall in some areas.
  const [page, closeBrowser] = await loadBrowserPage.bind(this)('https://lncn.org/', {
    show: false,
  });

  // trigger button click event for saving data to clipborad.
  await page.click('.ssr-list-wrapper.base-box .el-button--primary');
  const result = clipboard.readText('clipboard'); // read data from clipboard.

  // to avoid memory overflow, close browser when task done.
  closeBrowser();

  console.log('>> puppeteer task ended...');

  // pass data to next step
  return result;
};
