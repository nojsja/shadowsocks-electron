import React from 'react';

import { type WorkflowTask } from '@renderer/types';
import { useStylesOfWorkflow } from '@renderer/pages/styles';

import TaskEditor from './TaskEditor';

const template =`
  module.exports = async function(content, {
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

const NodeSourceTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();

  return (
    <>
      <span className={styles.textEditorTitle}>node</span>
      <TaskEditor
        {...props}
        templateCode={template}
      />
    </>
  );
};

export const type = 'node-source';

export default NodeSourceTask;
