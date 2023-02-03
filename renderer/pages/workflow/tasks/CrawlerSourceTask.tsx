import React from 'react';
import { type WorkflowTask } from '@renderer/types';
import { useStylesOfWorkflow } from '@renderer/pages/styles';

import TaskEditor from './TaskEditor';
import path from 'path';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  workflowTaskDemoDir?: string;
}

const CrawlerSourceTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();
  const template = path.join(props.workflowTaskDemoDir ?? '', 'crawler-source.js');

  return (
    <>
      <span className={styles.textEditorTitle}>crawler</span>
      <TaskEditor
        {...props}
        templateCodePath={template}
      />
    </>
  );
};

export const type = 'crawler-source';

export default CrawlerSourceTask;
