/**
 * API of Crawler Source Task
 * {function} loadCrawler - used to load node-crawler module (external https://www.npmjs.com/package/crawler).
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
async () => {
  const Crawler = loadCrawler();
  const crawler = new Crawler({
    maxConnections: 10,
  });
  const result = await new Promise((resolve) => {
    // put a crawler task into Queue.
    crawler.queue({
      uri: 'http://www.amazon.com',
      callback: (error, res, done) => {
        if (error) {
          reject(error);
        } else {
          // $ is Cheerio - a magic tool used to parse html.
          // see API https://cheerio.js.org/.
          const $ = res.$;
          const title = $("title").text();
          resolve(title);
        }
        done();
      },
    });
  });

  // pass data to next step.
  // in this example, data will be 'title' of amazon.com site.
  return result;
};
