import React from 'react';
import path from 'path';

import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { type WorkflowTask } from '@renderer/types';

import TaskEditor from './TaskEditor';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  workflowTaskDemoDir?: string;
}

const PuppeteerSourceTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();
  const template = path.join(props.workflowTaskDemoDir ?? '', 'puppeteer-source.js');

  return (
    <>
      <span className={styles.textEditorTitle}>puppeteer</span>
      <TaskEditor
        {...props}
        templateCodePath={template}
      />
    </>
  );
};

export const type = 'puppeteer-source';

export default PuppeteerSourceTask;
