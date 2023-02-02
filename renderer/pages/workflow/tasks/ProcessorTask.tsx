import React from 'react';

import { type WorkflowTask } from '@renderer/types';
import { useStylesOfWorkflow } from '@renderer/pages/styles';

import TaskEditor from './TaskEditor';

const template =`
  module.exports = async function(content) {
    const header = '---Header---';
    const footer = '---Footer---';

    return header + content + footer;
  };
`;

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
}

const ProcessorTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();

  return (
    <>
      <span className={styles.textEditorTitle}>processor</span>
      <TaskEditor
        {...props}
        templateCode={template}
      />
    </>
  );
};

export const type = 'processor-pipe';

export default ProcessorTask;
