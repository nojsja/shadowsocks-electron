import React from 'react';
import { type WorkflowTask } from '@renderer/types';
import { useStylesOfWorkflow } from '@renderer/pages/styles';

import TaskEditor from './TaskEditor';

const template =`
  module.exports = async function(content, {
    crawler, // web crawler, see https://github.com/bda-research/node-crawler for API reference.
    clipboard, // electron clipboard module
    http, // nodejs http module
    https, // nodejs https module
    fs, // nodejs fs module
    path, // nodejs path module
  }) {
    console.log(content);
    return '[source data]';
  };
`;

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => void;
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
