import React from 'react';
import path from 'path';
import classNames from 'classnames';

import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { type WorkflowTask } from '@renderer/types';
import TaskEditor from './TaskEditor';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  workflowTaskDemoDir?: string;
}

const EffectTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();
  const template = path.join(props.workflowTaskDemoDir ?? '', 'effect-pipe.js');
  const isError = props.status === 'failed';
  const isSuccess = props.status === 'success';

  return (
    <>
      <span
        className={
          classNames(
            styles.textEditorTitle,
            styles.required,
            isError && 'error',
            isSuccess && 'success',
          )
        }
      >
        effect
      </span>
      <TaskEditor
        {...props}
        templateCodePath={template}
      />
    </>
  );
};

export const type = 'effect-pipe';

export default EffectTask;
