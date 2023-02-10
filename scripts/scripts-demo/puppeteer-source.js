module.exports = async function(
  content, // Data from previous step
  {
    loadBrowserPage, // -> [puppeteer Page instance, destroy function]
    clipboard, // Clipboard module of electron
  }
) {
  // See API https://github.com/GoogleChrome/puppeteer.
  const [page, closeBrowser] = await loadBrowserPage('https://lncn.org/', {
    show: false, // Show browser window, optional, default true.
  });

  // Trigger button click event for saving data to clipborad.
  page.click('.ssr-list-wrapper.base-box .el-button--primary');

  // See API https://www.electronjs.org/docs/latest/api/clipboard.
  const result = clipboard.readText('clipboard'); // read data from clipboard.

  // In order to avoid memory overflow, close browser when task done.
  closeBrowser();

  // Pass data to next step
  return result;
};
