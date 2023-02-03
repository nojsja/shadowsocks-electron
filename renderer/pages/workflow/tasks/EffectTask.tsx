import React from 'react';

import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { type WorkflowTask } from '@renderer/types';
import TaskEditor from './TaskEditor';
import path from 'path';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  workflowTaskDemoDir?: string;
}

const EffectTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();
  const template = path.join(props.workflowTaskDemoDir ?? '', 'effect-pipe.js');

  return (
    <>
      <span className={styles.textEditorTitle}>effect</span>
      <TaskEditor
        {...props}
        templateCodePath={template}
      />
    </>
  );
};

export const type = 'effect-pipe';

export default EffectTask;
