import React from 'react';
import path from 'path';
import classNames from 'classnames';

import { WORKFLOW_TASK_FILE, type WorkflowTask } from '@renderer/types';
import { useStylesOfWorkflow } from '@renderer/pages/styles';

import TaskEditor from './TaskEditor';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  workflowTaskDemoDir?: string;
}

const ProcessorTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();
  const template = path.join(props.workflowTaskDemoDir ?? '', WORKFLOW_TASK_FILE.processorPipe);
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
        processor
      </span>
      <TaskEditor
        {...props}
        templateCodePath={template}
      />
    </>
  );
};

export const type = 'processor-pipe';

export default ProcessorTask;
