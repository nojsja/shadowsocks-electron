module.exports = async function(
  content, // Data from previous step
  {
    loadCrawler, // Function to load crawler module
  }
) {
  // Import node-crawler module
  const Crawler = loadCrawler();
  const result = await new Promise((resolve, reject) => {
    // See API https://github.com/bda-research/node-crawler.
    const crawler = new Crawler({
      maxConnections: 10,
      // This will be called for each crawled page, asynchronously.
      callback: (error, res, done) => {
        if (error) {
          resolve(error);
        } else {
          // $ is Cheerio - a magic tool used to parse html.
          // See API https://cheerio.js.org/.
          const $ = res.$;
          const title = $("title").text();
          resolve(title);
        }
        done();
      },
    });
    // Put a crawler task into Queue.
    crawler.queue('http://www.amazon.com');
  });

  // Return data to next step.
  // In this example, data will be 'title' of amazon.com site.
  return result;
};
