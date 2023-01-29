import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { createStyles, IconButton, LinearProgress, makeStyles, Tooltip } from '@material-ui/core';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import DeleteIcon from '@material-ui/icons/Delete';

import MenuButton from '@renderer/components/Pices/MenuButton';
import { type WorkflowRunner, type WorkflowTaskType } from '@renderer/types';

import EffectTask, { type as EffectTaskType } from './tasks/EffectTask';
import NodeSourceTask, { type as NodeSourceTaskType } from './tasks/NodeSourceTask';
import ProcessorTask, { type as ProcessorTaskType } from './tasks/ProcessorTask';
import PuppeteerSourceTask, { type as PuppeteerSourceTaskType } from './tasks/PuppeteerSourceTask';
import CrawlerSourceTask, { type as CrawlerSourceTaskTask } from './tasks/CrawlerSourceTask';


export const useStyles = makeStyles((theme) => createStyles({
  runnerWrapper: {
    padding: theme.spacing(.5),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(.5),
    marginRight: theme.spacing(.5),
    backgroundColor: theme.palette.type === "dark" ? '#383838' : '#ececec',
    '& textarea': {
      border: 'none',
    },
  },
  footerAction: {
    display: 'flex',
    justifyContent: 'center',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  footerActionButton: {
    cursor: 'pointer',
    color: theme.palette.secondary[theme.palette.type === 'dark' ? 'light' : 'dark'],
  },
}));

const TaskTypeMap = {
  [EffectTaskType]: EffectTask,
  [NodeSourceTaskType]: NodeSourceTask,
  [ProcessorTaskType]: ProcessorTask,
  [PuppeteerSourceTaskType]: PuppeteerSourceTask,
  [CrawlerSourceTaskTask]: CrawlerSourceTask,
  unknown: () => <div>Unknown Task</div>,
};

interface Props extends WorkflowRunner {
  start: (id: string) => Promise<boolean>;
  stop: (id: string) => Promise<boolean>;
  removeTaskFromRunner: (runnerId: string, taskId: string) => Promise<boolean>;
  putTaskIntoRunner: (runnerId: string, taskId: string) => Promise<boolean>;
}

const WorkflowRunner: React.FC<Props> = ({
  id,
  queue,
  status,
  removeTaskFromRunner,
  putTaskIntoRunner,
}) => {
  const styles = useStyles();

  const onTaskDelete = (taskId: string) => {
    removeTaskFromRunner(id, taskId);
  };
  const onTaskAdd = (taskType: WorkflowTaskType) => {
    putTaskIntoRunner(id, uuidv4());
  };

  return (
    <div className={styles.runnerWrapper}>
      {
        queue.map((task) => {
          const TaskComponent = TaskTypeMap[task.type] || TaskTypeMap.unknown;
          return (
            <TaskComponent
              key={task.id}
              {...task}
              onTaskDelete={onTaskDelete}
            />
          );
        })
      }
      <div className={styles.footerAction} >
        <Tooltip title="Delete">
          <IconButton size="small">
            <DeleteIcon className={styles.footerActionButton} color="action" />
          </IconButton>
        </Tooltip>
        <MenuButton
          menuButton={
            <Tooltip title="Add">
              <IconButton size="small">
                <AddCircleIcon className={styles.footerActionButton} />
              </IconButton>
            </Tooltip>
          }
          config={[
            {
              label: 'Source Task (puppeteer)', // puppeteer scrawler (data source)
              key: 'puppeteer',
              onClick: () => onTaskAdd('puppeteer-source'),
            },
            {
              label: 'Source Task (crawler)', // web crawler (data source)
              key: 'crawler',
              onClick: () => onTaskAdd('crawler-source'),
            },
            {
              label: 'Source Task (node)', // node script, generate data from local script or remote request (data source)
              key: 'pipe',
              onClick: () => onTaskAdd('node-source'),
            },
            {
              label: 'Processor Task (pipe)', // process data (processor)
              key: 'pipe',
              onClick: () => onTaskAdd('processor-pipe'),
            },
            {
              label: 'Effect Task (pipe)', // run tasks on ui process, such as notification, ssr/ss parsing, etc. (effect)
              key: 'pipe',
              onClick: () => onTaskAdd('effect-pipe'),
            },
          ]}
        />
        <Tooltip title="Run">
          <IconButton size="small">
            <PlayCircleFilledWhiteIcon color="action" className={styles.footerActionButton} />
          </IconButton>
        </Tooltip>
      </div>
      <LinearProgress hidden={status !== 'running'} color="secondary" />
    </div>
  );
}

export default WorkflowRunner;
