import React from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Container } from '@material-ui/core';

import { WorkflowTaskTimer, type WorkflowRunner as WorkflowRunnerType } from '@renderer/types';

import MenuButton from '@renderer/components/Pices/MenuButton';
import WorkflowRunner from './workflow/WorkflowRunner';

import { useStylesOfWorkflow } from './styles';

const Workflow: React.FC= () => {
  const styles = useStylesOfWorkflow();
  const onScriptChange = (content: string) => {
    console.log(content);
  };
  const runners: WorkflowRunnerType[] = [
    {
      id: '1',
      enable: true,
      status: 'idle',
      timerOption: { enable: false },
      queue: [
        {
          id: '1-1',
          status: 'idle',
          type: 'puppeteer-source',
          scriptPath: '/home/nojsja/.config/shadowsocks-electron/runtime/workflow/tasks/1-1/index.js',
        },
        {
          id: '1-2',
          status: 'idle',
          type: 'processor-pipe',
          scriptPath: '/home/nojsja/.config/shadowsocks-electron/runtime/workflow/tasks/1-2/index.js',
        },
        {
          id: '1-3',
          status: 'idle',
          type: 'effect-pipe',
          scriptPath: '/home/nojsja/.config/shadowsocks-electron/runtime/workflow/tasks/1-3/index.js',
        }
      ],
    },
    {
      id: '2',
      enable: true,
      status: 'idle',
      timerOption: { enable: false },
      queue: [
        {
          id: '2-1',
          status: 'idle',
          type: 'puppeteer-source',
          scriptPath: '/home/nojsja/.config/shadowsocks-electron/runtime/workflow/tasks/2-1/index.js',
        },
        {
          id: '2-2',
          status: 'idle',
          type: 'processor-pipe',
          scriptPath: '/home/nojsja/.config/shadowsocks-electron/runtime/workflow/tasks/2-2/index.js',
        },
        {
          id: '2-3',
          status: 'idle',
          type: 'effect-pipe',
          scriptPath: '/home/nojsja/.config/shadowsocks-electron/runtime/workflow/tasks/2-3/index.js',
        }
      ],
    }
  ];
  const createRunner = (type: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };
  const removeRunner = (id: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };
  const putTaskIntoRunner = (runnerId: string, taskId: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };
  const removeTaskFromRunner = (runnerId: string, taskId: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };
  const startRunner = (id: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };
  const stopRunner = (id: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };
  const enableRunner = (id: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };
  const disableRunner = (id: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };
  const adjustTimerOfRunner = (id: string, timer: WorkflowTaskTimer) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };

  return (
    <Container className={styles.container}>
      <div className={styles.headerActions}>
        <MenuButton
          menuButton={<AddCircleIcon className={styles.headerActionButton} />}
          config={[
            {
              label: 'Source Task (puppeteer)', // puppeteer headless browser (data source)
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
          ]}
        />
      </div>
      <div>
        {
          runners.map((runner) => (
            <WorkflowRunner
              {...runner}
              key={runner.id}
              start={startRunner}
              stop={stopRunner}
              removeTaskFromRunner={removeTaskFromRunner}
              putTaskIntoRunner={putTaskIntoRunner}
            />
          ))
        }
      </div>
    </Container>
  );
}

export default Workflow;
