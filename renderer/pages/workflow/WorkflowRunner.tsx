import React, { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { MessageChannel } from 'electron-re';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { createStyles, IconButton, LinearProgress, makeStyles, Switch, Tooltip } from '@material-ui/core';
import {
  TimerTwoTone as TimerIcon,
  Delete as DeleteIcon,
  PlayCircleFilledWhite as PlayCircleFilledWhiteIcon,
} from '@material-ui/icons';

import MenuButton from '@renderer/components/Pices/MenuButton';
import { Response, useRequest } from '@/renderer/hooks/useRequest';
import {
  WorkflowTaskTimer,
  type WorkflowRunner,
  type WorkflowTaskType,
} from '@renderer/types';

import EffectTask, { type as EffectTaskType } from './tasks/EffectTask';
import NodeSourceTask, { type as NodeSourceTaskType } from './tasks/NodeSourceTask';
import ProcessorTask, { type as ProcessorTaskType } from './tasks/ProcessorTask';
import PuppeteerSourceTask, { type as PuppeteerSourceTaskType } from './tasks/PuppeteerSourceTask';
import CrawlerSourceTask, { type as CrawlerSourceTaskTask } from './tasks/CrawlerSourceTask';
import WorkflowSchedule from './WorkflowSchedule';

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
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  footerActionFixed: {
    position: 'absolute',
    bottom: theme.spacing(.4),
    left: theme.spacing(1),
  },
  footerActionButton: {
    cursor: 'pointer',
    color: theme.palette.secondary[theme.palette.type === 'dark' ? 'light' : 'dark'],
    '&.disabled': {
      color: theme.palette.secondary.main,
    }
  },
  noVisible: {
    opacity: 0,
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
  startRunner: (id: string) => Promise<Response<string | null>>;
  stopRunner: (id: string) => Promise<Response<string | null>>;
  removeTaskFromRunner: (runnerId: string, taskId: string) => Promise<Response<string | null>>;
  putTaskIntoRunner: (runnerId: string, taskId: string, taskType: WorkflowTaskType) => Promise<Response<string | null>>;
  adjustTimerOfRunner: (runnerId: string, timer: WorkflowTaskTimer) => Promise<Response<string | null>>;
  updateRunner: (runnerId: string) => Promise<Response<WorkflowRunner>>
  enableRunner: (runnerId: string) => Promise<Response<string | null>>;
  disableRunner: (runnerId: string) => Promise<Response<string | null>>;
  removeRunner: (runnerId: string) => Promise<Response<string | null>>;
}

const WorkflowRunner: React.FC<Props> = ({
  enable,
  id,
  queue,
  startRunner,
  removeTaskFromRunner,
  putTaskIntoRunner,
  removeRunner,
  disableRunner,
  enableRunner,
  updateRunner,
}) => {
  const enableStatus = enable ? 'Enabled' : 'Disabled';
  const styles = useStyles();
  const [running, setRunning] = useState(false);
  const isStarting = useRef(false);

  const { data: workflowTaskDemoRsp } = useRequest<Response<string>>(() => {
    return MessageChannel.invoke('main', 'service:workflow', {
      action: 'getWorkflowTaskDemoDir',
      params: {},
    });
  }, {
    onError(error) {
      alert(error);
    },
  });

  const onTaskDelete = async (taskId: string) => {
    if (queue.length === 1) {
      await removeRunner(id);
    } else {
      await removeTaskFromRunner(id, taskId);
      await updateRunner(id);
    }
  };

  const onTaskAdd = async (taskType: WorkflowTaskType) => {
    await putTaskIntoRunner(id, uuidv4(), taskType);
    await updateRunner(id);
  };

  const toggleEnable = async () => {
    if (enable) {
      await disableRunner(id);
    } else {
      await enableRunner(id);
    }
    await updateRunner(id);
  };

  const startRunnerInner = () => {
    if (isStarting.current) return;
    isStarting.current = true;

    setRunning(true);
    startRunner(id).finally(() => {
      setRunning(false);
      isStarting.current = false;
    });
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
              workflowTaskDemoDir={workflowTaskDemoRsp?.result}
            />
          );
        })
      }
      <div className={styles.footerAction} >
        <div className={styles.footerActionFixed}>
          <Tooltip title={enableStatus}>
            <IconButton size="small" onClick={toggleEnable}>
              <Switch checked={enable} size="small" color="primary" className={styles.footerActionButton} />
            </IconButton>
          </Tooltip>
        </div>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => removeRunner(id)}>
            <DeleteIcon className={styles.footerActionButton} color="action" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Timer">
          <WorkflowSchedule renderButton={() => <TimerIcon className={styles.footerActionButton} color="action" />} />
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
              key: 'node',
              onClick: () => onTaskAdd('node-source'),
            },
            {
              label: 'Processor Task (pipe)', // process data (processor)
              key: 'processor',
              onClick: () => onTaskAdd('processor-pipe'),
            },
            {
              label: 'Effect Task (pipe)', // run tasks on ui process, such as notification, ssr/ss parsing, etc. (effect)
              key: 'effect',
              onClick: () => onTaskAdd('effect-pipe'),
            },
          ]}
        />
        <Tooltip title="Run">
          <IconButton size="small" disabled={!enable} onClick={startRunnerInner}>
            <PlayCircleFilledWhiteIcon color="action" className={classNames(styles.footerActionButton, !enable && 'disabled')} />
          </IconButton>
        </Tooltip>
      </div>
      <LinearProgress className={classNames((!running) && styles.noVisible)} color="secondary" />
    </div>
  );
}

export default WorkflowRunner;
