import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { MessageChannel } from 'electron-re';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import {
  createStyles, IconButton,
  LinearProgress, makeStyles,
  Switch, Tooltip
} from '@material-ui/core';
import {
  TimerTwoTone as TimerIcon,
  Delete as DeleteIcon,
  PlayCircleFilledWhite as PlayCircleFilledWhiteIcon,
  Cancel as CancelIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import MenuButton from '@renderer/components/Pices/MenuButton';
import { Response, useRequest } from '@/renderer/hooks/useRequest';
import { Message } from '@/renderer/hooks/useNotifier';
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
import NoRecord from '@/renderer/components/Pices/NoRecord';
import { useDialogConfirm } from '@/renderer/hooks';

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
  updateRunner: (runnerId: string) => Promise<Response<WorkflowRunner>>
  removeRunner: (runnerId: string) => Promise<Response<string | null>>;
}

const WorkflowRunner: React.FC<Props> = ({
  enable,
  id,
  status,
  queue,
  timerOption,
  removeRunner,
  updateRunner,
}) => {
  const enableStatus = enable ? 'Enabled' : 'Disabled';
  const styles = useStyles();
  const isRunning = status === 'running';
  const { t } = useTranslation();
  const [openDialog] = useDialogConfirm();
  const isEmptyRunner = !queue?.length;
  const dialogOptions = {
    title: t('warning'),
  };

  const { run: startRunner } = useRequest<Response<string | null>>(
    (runnerId: string) => MessageChannel.invoke('main', 'service:workflow', {
      action: 'runWorkflowRunner',
      params: {
        id: runnerId,
      },
    }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          Message.error(`${i18n.t<string>('fail_to_run_workflow')}: ${rsp.result}`);
        }
      },
      onError(error) {
        Message.error(error.message);
      }
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { run: stopRunner } = useRequest<Response<string | null>>(
    (runnerId: string) => MessageChannel.invoke('main', 'service:workflow', {
      action: 'stopWorkflowRunner',
      params: {
        id: runnerId,
      },
    }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          Message.error(`${i18n.t<string>('fail_to_stop_workflow')}: ${rsp.result}`);
        }
      },
      onError(error) {
        Message.error(error.message);
      }
    }
  );

  const { run: putTaskIntoRunner } = useRequest<Response<string | null>>(
    (runnerId: string, taskId: string, taskType: WorkflowTaskType) => MessageChannel.invoke('main', 'service:workflow', {
      action: 'generateTaskOfRunner',
      params: {
        task: { type: taskType, id: taskId },
        runnerId: runnerId,
      },
    }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          Message.error(`${i18n.t<string>('fail_to_create_workflow_task')}: ${rsp.result}`);
        }
      },
      onError(error) {
        Message.error(error.message);
      }
    }
  );

  const { run: removeTaskFromRunner } = useRequest<Response<string | null>>(
    (runnerId: string, taskId: string) => MessageChannel.invoke('main', 'service:workflow', {
      action: 'removeTaskOfRunner',
      params: {
        runnerId,
        taskId,
      },
    }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          Message.error(`${i18n.t<string>('fail_to_remove_workflow_task')}: ${rsp.result}`);
        }
      },
      onError(error) {
        Message.error(error.message);
      }
    }
  );

  const { run: enableRunner } = useRequest<Response<string | null>>(
    (runnerId: string) => MessageChannel.invoke('main', 'service:workflow', {
      action: 'enableWorkflowRunner',
      params: {
        id: runnerId,
      },
    }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          Message.error(`${i18n.t<string>('fail_to_enable_workflow')}: ${rsp.result}`);
        }
      },
      onError(error) {
        Message.error(error.message);
      }
    }
  );

  const { run: disableRunner } = useRequest<Response<string | null>>(
    (runnerId: string) => MessageChannel.invoke('main', 'service:workflow', {
      action: 'disableWorkflowRunner',
      params: {
        id: runnerId,
      },
    }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          Message.error(`${i18n.t<string>('fail_to_disable_workflow')}: ${rsp.result}`);
        }
      },
      onError(error) {
        Message.error(error.message);
      }
    }
  );

  const { run: editTimerOfRunner } = useRequest<Response<string | null>>(
    (runnerId: string, timer: WorkflowTaskTimer) => MessageChannel.invoke('main', 'service:workflow', {
      action: 'editWorkflowRunner',
      params: {
        id: runnerId,
        options: {
          timer,
        },
      },
    }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          Message.error(`Fail to adjust timer of runner, ${rsp.result}`);
        } else {
          Message.success(t('workflow_timed_execution_rule_updated'));
        }
      },
      onError(error) {
        Message.error(error.message);
      }
    }
  );

  const onRemoveRunner = () => {
    openDialog({
      ...dialogOptions,
      content: t('sure_to_delete_runner_tips'),
      onConfirm: async () => {
        await removeRunner(id);
      },
    });
  };

  const { data: workflowTaskDemoRsp } = useRequest<Response<string>>(() => {
    return MessageChannel.invoke('main', 'service:workflow', {
      action: 'getWorkflowTaskDemoDir',
      params: {},
    });
  }, {
    onError(error) {
      Message.error(`${i18n.t<string>('fail_to_load_workflow_demo_script')}: ${error.message}`);
    },
  });

  const onTaskDelete = async (taskId: string) => {
    openDialog({
      ...dialogOptions,
      content: t('sure_to_delete_task_tips'),
      onConfirm: async () => {
        await removeTaskFromRunner(id, taskId);
        await updateRunner(id);
      }
    });
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
    if (isEmptyRunner) return;
    startRunner(id);
  };

  const stopRunnerInner = () => {
    if (isEmptyRunner) return;
    stopRunner(id);
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
      {
        isEmptyRunner && (
          <NoRecord title="No Tasks" />
        )
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
          <IconButton size="small" onClick={onRemoveRunner}>
            <DeleteIcon className={styles.footerActionButton} color="action" />
          </IconButton>
        </Tooltip>
        <WorkflowSchedule
          renderButton={() => <TimerIcon className={styles.footerActionButton} color="action" />}
          timerOption={timerOption}
          editTimerOfRunner={editTimerOfRunner}
          updateRunner={updateRunner}
          runnerId={id}
          runnerEnabled={enable}
        />
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
        {
          !isRunning && (
            <Tooltip title="Run">
              <IconButton size="small" disabled={!enable || isEmptyRunner} onClick={startRunnerInner}>
                <PlayCircleFilledWhiteIcon color="action" className={classNames(styles.footerActionButton, (!enable || isEmptyRunner) && 'disabled')} />
              </IconButton>
            </Tooltip>
          )
        }
        {
          isRunning && (
            <Tooltip title="Stop">
              <IconButton size="small" disabled={!enable} onClick={stopRunnerInner}>
                <CancelIcon color="action" className={classNames(styles.footerActionButton, !enable && 'disabled')} />
              </IconButton>
            </Tooltip>
          )
        }
      </div>
      <LinearProgress className={classNames((!isRunning) && styles.noVisible)} color="secondary" />
    </div>
  );
}

export default WorkflowRunner;
