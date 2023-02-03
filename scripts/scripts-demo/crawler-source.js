module.exports = async function(
  content,
  {
    loadCrawler, // return node-crawler instance
    clipboard, // clipboard (electron)
    http, // http (nodejs)
    https, // https (nodejs)
    fs, // fs (nodejs)
    path, // path (nodejs)
  }
) {
  // load node-crawler module
  const Crawler = loadCrawler();

  // web crawler, see https://github.com/bda-research/node-crawler for API reference.
  const result = await new Promise((resolve, reject) => {
    const crawler = new Crawler({
      maxConnections: 10,
      // This will be called for each crawled page
      callback: (error, res, done) => {
        if (error) {
          console.log(error);
          resolve(error);
        } else {
          // $ is Cheerio by default
          const $ = res.$;
          const title = $("title").text();
          console.log(title);
          resolve(title);
        }
        done();
      },
    });
    // Queue just one URL, with default callback
    crawler.queue('http://www.amazon.com');
  });

  // return result to next processor
  return result;
};
