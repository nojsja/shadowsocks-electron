import React from 'react';

import { type WorkflowTask } from '@renderer/types';
import { useStylesOfWorkflow } from '@renderer/pages/styles';

import TaskEditor from './TaskEditor';
import path from 'path';
import classNames from 'classnames';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  workflowTaskDemoDir?: string;
}

const NodeSourceTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();
  const template = path.join(props.workflowTaskDemoDir ?? '', 'node-source.js');
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
        node
      </span>
      <TaskEditor
        {...props}
        templateCodePath={template}
      />
    </>
  );
};

export const type = 'node-source';

export default NodeSourceTask;
