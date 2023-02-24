import React from 'react';

import { WORKFLOW_TASK_FILE, type WorkflowTask } from '@renderer/types';
import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { green } from '@material-ui/core/colors';
import path from 'path';
import classNames from 'classnames';

import TaskEditor from './TaskEditor';
import useWorkflowTaskContextMenu from '../hooks/useWorkflowTaskContextMenu';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  workflowTaskDemoDir?: string;
  index: number;
  total: number;
}

const NodeSourceTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();
  const template = path.join(props.workflowTaskDemoDir ?? '', WORKFLOW_TASK_FILE.nodeSource);
  const { index, total, status } = props;
  const isError = status === 'failed';
  const isSuccess = status === 'success';

  const showContextMenu = useWorkflowTaskContextMenu({
    index, total, taskSymbol: 'source',
  });

  return (
    <div onContextMenu={showContextMenu}>
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
        <span style={{ color: green[600] }}>[source]</span> node
      </span>
      <TaskEditor
        {...props}
        templateCodePath={template}
      />
    </div>
  );
};

export const type = 'node-source';

export default NodeSourceTask;
