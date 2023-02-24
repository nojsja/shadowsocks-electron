import React from 'react';
import path from 'path';
import classNames from 'classnames';
import { green } from '@material-ui/core/colors';

import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { WORKFLOW_TASK_FILE, type WorkflowTask } from '@renderer/types';

import TaskEditor from './TaskEditor';
import useWorkflowTaskContextMenu from '../hooks/useWorkflowTaskContextMenu';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskMoveUp: (taskId: string) => Promise<void>;
  onTaskMoveDown: (taskId: string) => Promise<void>;
  workflowTaskDemoDir?: string;
  index: number;
  total: number;
}

const PuppeteerSourceTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();
  const template = path.join(props.workflowTaskDemoDir ?? '', WORKFLOW_TASK_FILE.puppeteerSource);
  const { index, total, status } = props;
  const isError = status === 'failed';
  const isSuccess = status === 'success';

  const showContextMenu = useWorkflowTaskContextMenu({
    index, total, taskSymbol: 'source', id: props.id,
    deleteTask: props.onTaskDelete,
    moveUpTask: props.onTaskMoveUp,
    moveDownTask: props.onTaskMoveDown,
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
        <span style={{ color: green[600] }}>[source]</span> puppeteer
      </span>
      <TaskEditor
        {...props}
        templateCodePath={template}
      />
    </div>
  );
};

export const type = 'puppeteer-source';

export default PuppeteerSourceTask;
