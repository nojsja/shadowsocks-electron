import React from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';

import MenuButton from '../components/Pices/MenuButton';
import WorkflowRunner from './workflow/WorkflowRunner';

import { useStylesOfWorkflow } from './styles';
import { WorkflowTask, WorkflowTaskTimer, type WorkflowRunner as WorkflowRunnerType } from '../types';

const Workflow: React.FC= () => {
  const styles = useStylesOfWorkflow();
  const onScriptChange = (content: string) => {
    console.log(content);
  };
  const runners: WorkflowRunnerType[] = [];
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
  const putTaskIntoRunner = (id: string, task: WorkflowTask) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };
  const removeTaskFromRunner = (id: string, task: WorkflowTask) => {
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
    <div className={styles.pageWrapper}>
      <div className={styles.headerActions}>
        <MenuButton
          menuButton={<AddCircleIcon className={styles.headerActionButton} />}
          config={[
            {
              label: 'Source Task (puppeteer)', // puppeteer scrawler (data source)
              key: 'puppeteer',
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
              run={startRunner}
              stop={stopRunner}
            />
          ))
        }
      </div>
    </div>
  );
}

export default Workflow;
