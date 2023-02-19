import React from 'react';
import { WORKFLOW_TASK_FILE, type WorkflowTask } from '@renderer/types';
import { useStylesOfWorkflow } from '@renderer/pages/styles';
import path from 'path';
import classNames from 'classnames';

import TaskEditor from './TaskEditor';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  workflowTaskDemoDir?: string;
}

const CrawlerSourceTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();
  const template = path.join(props.workflowTaskDemoDir ?? '', WORKFLOW_TASK_FILE.crawlerSource);
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
      >crawler</span>
      <TaskEditor
        {...props}
        templateCodePath={template}
      />
    </>
  );
};

export const type = 'crawler-source';

export default CrawlerSourceTask;
