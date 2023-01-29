import React from 'react';

import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { type WorkflowTask } from '@renderer/types';

import TaskEditor from './TaskEditor';

const template =`
  module.exports = async function(content, {
    // see https://github.com/GoogleChrome/puppeteer for API reference.
    puppeteer,
    clipboard, // electron clipboard module
    http, // nodejs http module
    https, // nodejs https module
    fs, // nodejs fs module
    path, // nodejs path module
  }) {
    const browser = await puppeteer.launch({
      headless: false,
      timeout: 30000,
    });
    const page = await browser.newPage();
    await page.goto('https://lncn.org/');

    page.click('.ssr-list-wrapper.base-box .el-button--primary');
    try {
      await browser.close();
    } catch (error) {}

    const result = clipboard.readText('clipboard');

    return result;
  };
`;

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => void;
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
