module.exports = async function(
  content, // data from previous step
  {
    loadBrowserPage, // -> [puppeteer Page instance, destroy function]
    clipboard, // clipboard module of electron
  }
) {
  // see API https://pptr.dev/api/puppeteer.page.
  const [page, closeBrowser] = await loadBrowserPage('https://lncn.org/', {
    show: false, // show browser window, optional, default true.
  });

  // trigger button click event for saving data to clipborad.
  await page.click('.ssr-list-wrapper.base-box .el-button--primary');

  // see API https://www.electronjs.org/docs/latest/api/clipboard.
  const result = clipboard.readText('clipboard'); // read data from clipboard.

  // in order to avoid memory overflow, close browser when task done.
  setTimeout(() => {
    closeBrowser();
  }, 2e3);

  // pass data to next step
  return result;
};
