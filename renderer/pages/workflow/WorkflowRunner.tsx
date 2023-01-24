import React from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { createStyles, makeStyles } from '@material-ui/core';

import MenuButton from '../../components/Pices/MenuButton';
import EffectTask from './EffectTask';
import NodeSourceTask from './NodeSourceTask';
import ProcessorTask from './ProcessorTask';
import PuppeteerSourceTask from './PuppeteerSourceTask';

import { WorkflowRunner } from '../../types';

export const useStyles = makeStyles((theme) => createStyles({
  runnerWrapper: {
    padding: theme.spacing(.5),
  },
  footerActionButton: {

  },
}));

const TaskTypeMap = {
  [EffectTask.type]: EffectTask,
  [NodeSourceTask.type]: NodeSourceTask,
  [ProcessorTask.type]: ProcessorTask,
  [PuppeteerSourceTask.type]: PuppeteerSourceTask,
  unknown: () => <div>Unknown Task</div>,
};

interface Props extends WorkflowRunner {
  run: (id: string) => Promise<boolean>,
  stop: (id: string) => Promise<boolean>,
}

const WorkflowRunner: React.FC<Props> = ({ tasks }) => {
  const styles = useStyles();
  return (
    <div className={styles.runnerWrapper}>
      {
        tasks.map((task) => {
          const TaskComponent = TaskTypeMap[task.type] || TaskTypeMap.unknown;
          return <TaskComponent key={task.id} {...task} />;
        })
      }
      <MenuButton
          menuButton={<AddCircleIcon className={styles.footerActionButton} />}
          config={[
            {
              label: 'Source Task (puppeteer)', // puppeteer scrawler (data source)
              key: 'puppeteer',
            },
            {
              label: 'Source Task (node)', // node script, generate data from local script or remote request (data source)
              key: 'pipe',
            },
            {
              label: 'Processor Task (pipe)', // process data (processor)
              key: 'pipe',
            },
            {
              label: 'Effect Task (ui)', // run tasks on ui process, such as notification, ssr/ss parsing, etc. (effect)
              key: 'pipe',
            },
          ]}
        />
    </div>
  );
}

export default WorkflowRunner;
