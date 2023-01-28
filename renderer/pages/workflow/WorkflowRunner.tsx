import React from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { createStyles, IconButton, LinearProgress, makeStyles, Tooltip } from '@material-ui/core';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import DeleteIcon from '@material-ui/icons/Delete';

import EffectTask from './tasks/EffectTask';
import NodeSourceTask from './tasks/NodeSourceTask';
import ProcessorTask from './tasks/ProcessorTask';
import PuppeteerSourceTask from './tasks/PuppeteerSourceTask';
import CrawlerSourceTask from './tasks/CrawlerSourceTask';
import MenuButton from '../../components/Pices/MenuButton';

import { WorkflowRunner } from '../../types';

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
    color: theme.palette.secondary.dark,
  },
}));

const TaskTypeMap = {
  [EffectTask.type]: EffectTask,
  [NodeSourceTask.type]: NodeSourceTask,
  [ProcessorTask.type]: ProcessorTask,
  [PuppeteerSourceTask.type]: PuppeteerSourceTask,
  [CrawlerSourceTask.type]: CrawlerSourceTask,
  unknown: () => <div>Unknown Task</div>,
};

interface Props extends WorkflowRunner {
  run: (id: string) => Promise<boolean>,
  stop: (id: string) => Promise<boolean>,
}

const WorkflowRunner: React.FC<Props> = ({ queue, status }) => {
  const styles = useStyles();

  return (
    <div className={styles.runnerWrapper}>
      {
        queue.map((task) => {
          const TaskComponent = TaskTypeMap[task.type] || TaskTypeMap.unknown;
          return <TaskComponent key={task.id} {...task} />;
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
            },
            {
              label: 'Source Task (crawler)', // web crawler (data source)
              key: 'crawler',
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
              label: 'Effect Task (pipe)', // run tasks on ui process, such as notification, ssr/ss parsing, etc. (effect)
              key: 'pipe',
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
