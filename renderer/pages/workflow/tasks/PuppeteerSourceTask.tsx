import React from 'react';

import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { type WorkflowTask } from '@renderer/types';

import TaskEditor from './TaskEditor';

const template =`
  module.exports = async function(content, {
    // see https://github.com/GoogleChrome/puppeteer for API reference.
    loadBrowserPage, // function - return puppeteer page instance and distroy function
    clipboard, // electron clipboard module
    http, // nodejs http module
    https, // nodejs https module
    fs, // nodejs fs module
    path, // nodejs path module
  }) {
    const [page, closeBrowser] = await loadBrowserPage(
      'https://lncn.org/',
      {
        show: false, // whether show browser window, optional, default is true.
        width: 800, // browser window width, optional.
        height: 600, // browser window height, optional.
      }
    );

    page.click('.ssr-list-wrapper.base-box .el-button--primary'); // powered by puppeteer API

    try {
      closeBrowser();
    } catch (error) {}

    const result = clipboard.readText('clipboard');

    return result;
  };
`;

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
}

const PuppeteerSourceTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();

  return (
    <>
      <span className={styles.textEditorTitle}>puppeteer</span>
      <TaskEditor
        {...props}
        templateCode={template}
      />
    </>
  );
};

export const type = 'puppeteer-source';

export default PuppeteerSourceTask;
