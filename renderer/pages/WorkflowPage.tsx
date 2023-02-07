import React from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Container, IconButton } from '@material-ui/core';
import { MessageChannel } from 'electron-re';

import {
  type WorkflowTaskType,
  type WorkflowRunner as WorkflowRunnerType,
} from '@renderer/types';

import MenuButton from '@renderer/components/Pices/MenuButton';
import NoRecord from '@renderer/components/Pices/NoRecord';
import { useRequest, type Response } from '@renderer/hooks/useRequest';

import WorkflowRunner from './workflow/WorkflowRunner';
import { useStylesOfWorkflow } from './styles';
import WorkflowHelpInfo from './workflow/WorkflowHelpInfo';
import useBus, { EventAction } from 'use-bus';

const Workflow: React.FC = () => {
  const styles = useStylesOfWorkflow();

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
          let { result: runners } = result;
          let index = -1;

          if (!runners) return result;
          runners = runners.slice();
          index = runners.findIndex((runner) => runner.id === rsp.result.id);
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

  useBus('event:stream:workflow-status', (event: EventAction) => {
    const { payload } = event;
    const { runnerId, status } = payload;

    setState((result) => {
      let { result: runners } = result;
      let index = -1;

      if (!runners) return result;
      runners = runners.slice();
      index = runners.findIndex((runner) => runner.id === runnerId);
      if (index === -1) return result;
      runners[index].status = status;

      return {
        ...result,
        result: runners,
      };
    });
  }, [setState]);

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
              removeRunner={removeRunner}
              updateRunner={updateRunner}
            />
          ))
        }
        <NoRecord hidden={!!runnersResp?.result?.length} />
      </div>
    </Container>
  );
}

export default Workflow;
