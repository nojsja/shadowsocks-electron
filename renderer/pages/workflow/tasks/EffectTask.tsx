import React from 'react';
import path from 'path';
import classNames from 'classnames';
import { orange } from '@material-ui/core/colors';

import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { WORKFLOW_TASK_FILE, type WorkflowTask } from '@renderer/types';
import TaskEditor from './TaskEditor';
import useWorkflowTaskContextMenu from '../hooks/useWorkflowTaskContextMenu';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  workflowTaskDemoDir?: string;
  index: number;
  total: number;
}

const EffectTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();
  const template = path.join(props.workflowTaskDemoDir ?? '', WORKFLOW_TASK_FILE.effectPipe);
  const { index, total, status } = props;
  const isError = status === 'failed';
  const isSuccess = status === 'success';

  const showContextMenu = useWorkflowTaskContextMenu({
    index, total, taskSymbol: 'pipe',
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
        <span style={{ color: orange[600] }}>[pipe]</span> effect
      </span>
      <TaskEditor
        {...props}
        templateCodePath={template}
      />
    </div>
  );
};

export const type = 'effect-pipe';

export default EffectTask;
