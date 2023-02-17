module.exports = async function(
  content, // data from previous step
  { loadCrawler },
) {
  // import node-crawler module
  const Crawler = loadCrawler();
  // see API https://github.com/bda-research/node-crawler.
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
