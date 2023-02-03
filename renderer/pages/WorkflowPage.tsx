import React from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Container, IconButton } from '@material-ui/core';
import { MessageChannel } from 'electron-re';

import {
  type WorkflowTaskTimer,
  type WorkflowTaskType,
  type WorkflowRunner as WorkflowRunnerType,
} from '@renderer/types';

import MenuButton from '@renderer/components/Pices/MenuButton';
import NoRecord from '@renderer/components/Pices/NoRecord';
import { useRequest, type Response } from '@renderer/hooks/useRequest';

import WorkflowRunner from './workflow/WorkflowRunner';
import { useStylesOfWorkflow } from './styles';
import WorkflowHelpInfo from './workflow/WorkflowHelpInfo';

const Workflow: React.FC = () => {
  const styles = useStylesOfWorkflow();
  // const runners: WorkflowRunnerType[] = [
  //   {
  //     id: '1',
  //     enable: true,
  //     status: 'idle',
  //     timerOption: { enable: false },
  //     queue: [
  //       {
  //         id: '1-1',
  //         status: 'idle',
  //         type: 'puppeteer-source',
  //         scriptPath: '/home/nojsja/.config/shadowsocks-electron/runtime/workflow/tasks/1-1/index.js',
  //       },
  //       {
  //         id: '1-2',
  //         status: 'idle',
  //         type: 'processor-pipe',
  //         scriptPath: '/home/nojsja/.config/shadowsocks-electron/runtime/workflow/tasks/1-2/index.js',
  //       },
  //       {
  //         id: '1-3',
  //         status: 'idle',
  //         type: 'effect-pipe',
  //         scriptPath: '/home/nojsja/.config/shadowsocks-electron/runtime/workflow/tasks/1-3/index.js',
  //       }
  //     ],
  //   },
  // ];

  const { data: runnersResp, run: getWorkflowRunners, setState } = useRequest<Response<WorkflowRunnerType[]>>(
    () => MessageChannel.invoke('main', 'service:workflow', {
      action: 'getWorkflowRunners',
      params: {},
    }),
    {
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          alert('getWorkflowRunners failed');
        }
      },
      onError(error) {
        console.error(error);
        alert(error.message);
      }
    }
  );

  const { run: updateRunner } = useRequest<Response<WorkflowRunnerType>>(
    (id: string) => MessageChannel.invoke('main', 'service:workflow', {
      action: 'getWorkflowRunner',
      params: { id },
    }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          alert('getWorkflowRunner failed');
        }
        setState((result) => {
          const { result: runners } = result;
          if (!runners) return result;

          const index = runners.findIndex((runner) => runner.id === rsp.result.id);
          if (index === -1) return result;
          runners[index] = rsp.result;

          return {
            ...rsp,
            result: runners,
          };
        });
      },
      onError(error) {
        console.error(error);
        alert(error.message);
      }
    }
  );


  const { run: createRunner } = useRequest<Response<string | null>>(
    (type: WorkflowTaskType) => MessageChannel.invoke('main', 'service:workflow', {
      action: 'generateTaskOfRunner',
      params: {
        task: { type },
        runnerId: null,
      },
    }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          alert(`Fail to create runner, ${rsp.result}`);
        }
        getWorkflowRunners();
      },
      onError(error) {
        console.error(error);
        alert(error.message);
      }
    }
  );

  const { run: removeRunner } = useRequest<Response<string | null>>(
    (id: string) => MessageChannel.invoke('main', 'service:workflow', {
      action: 'removeWorkflowRunner',
      params: {
        id,
      },
    }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          alert(`Fail to remove runner, ${rsp.result}`);
        }
        getWorkflowRunners();
      },
      onError(error) {
        console.error(error);
        alert(error.message);
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
          alert(`Fail to create task, ${rsp.result}`);
        }
      },
      onError(error) {
        console.error(error);
        alert(error.message);
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
          alert(`Fail to remove task, ${rsp.result}`);
        }
      },
      onError(error) {
        console.error(error);
        alert(error.message);
      }
    }
  );

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
          alert(`Fail to start runner, ${rsp.result}`);
        }
      },
      onError(error) {
        console.error(error);
        alert(error.message);
      }
    }
  );

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
          alert(`Fail to stop runner, ${rsp.result}`);
        }
      },
      onError(error) {
        console.error(error);
        alert(error.message);
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
          alert(`Fail to enable runner, ${rsp.result}`);
        }
      },
      onError(error) {
        console.error(error);
        alert(error.message);
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
          alert(`Fail to disable runner, ${rsp.result}`);
        }
      },
      onError(error) {
        console.error(error);
        alert(error.message);
      }
    }
  );

  const { run: adjustTimerOfRunner } = useRequest<Response<string | null>>(
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
          alert(`Fail to adjust timer of runner, ${rsp.result}`);
        }
      },
      onError(error) {
        console.error(error);
        alert(error.message);
      }
    }
  );

  return (
    <Container className={styles.container}>
      <div className={styles.headerActions}>
        <WorkflowHelpInfo />
        <MenuButton
          menuButton={
            <IconButton size="small">
              <AddCircleIcon color="primary"/>
            </IconButton>
          }
          config={[
            {
              label: 'Source Task (puppeteer)', // puppeteer headless browser (data source)
              key: 'puppeteer',
              onClick: () => createRunner('puppeteer-source'),
            },
            {
              label: 'Source Task (crawler)', // web crawler (data source)
              key: 'crawler',
              onClick: () => createRunner('crawler-source'),
            },
            {
              label: 'Source Task (node)', // node script, generate data from local script or remote request (data source)
              key: 'pipe',
              onClick: () => createRunner('node-source'),
            },
          ]}
        />
      </div>
      <div>
        {
          runnersResp?.result?.map((runner) => (
            <WorkflowRunner
              {...runner}
              key={runner.id}
              startRunner={startRunner}
              stopRunner={stopRunner}
              removeRunner={removeRunner}
              updateRunner={updateRunner}
              removeTaskFromRunner={removeTaskFromRunner}
              putTaskIntoRunner={putTaskIntoRunner}
              enableRunner={enableRunner}
              disableRunner={disableRunner}
              adjustTimerOfRunner={adjustTimerOfRunner}
            />
          ))
        }
        <NoRecord hidden={!!runnersResp?.result?.length} />
      </div>
    </Container>
  );
}

export default Workflow;
