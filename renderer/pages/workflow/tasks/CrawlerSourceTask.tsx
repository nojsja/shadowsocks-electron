import React from 'react';
import { type WorkflowTask } from '@renderer/types';
import { useStylesOfWorkflow } from '@renderer/pages/styles';

import TaskEditor from './TaskEditor';

const template =`
  module.exports = async function(content, {
    /* web crawler, see https://github.com/bda-research/node-crawler for API reference. */
    loadCrawler, // init node-crawler instance
    clipboard, // electron clipboard module
    http, // nodejs http module
    https, // nodejs https module
    fs, // nodejs fs module
    path, // nodejs path module
  }) {
    // load node-crawler module
    const Crawler = loadCrawler();

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
                  const title = $('title').text();
                  console.log(title);
                  resolve(title);
              }
              done();
          }
      });
      // Queue just one URL, with default callback
      crawler.queue('http://www.amazon.com');
    });

    // return result or error to next processor
    return result;
  };
`;

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
}

const CrawlerSourceTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();

  return (
    <>
      <span className={styles.textEditorTitle}>crawler</span>
      <TaskEditor
        {...props}
        templateCode={template}
      />
    </>
  );
};

export const type = 'crawler-source';

export default CrawlerSourceTask;
