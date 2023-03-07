import React from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Container, IconButton } from '@material-ui/core';
import { MessageChannel } from 'electron-re';
import i18n from 'i18next';
import useBus, { EventAction } from 'use-bus';
import { useTranslation } from 'react-i18next';

import type {
  WorkflowTaskType,
  WorkflowRunner as WorkflowRunnerType,
} from '@renderer/types';

import { Message } from '@renderer/hooks';
import MenuButton from '@renderer/components/Pices/MenuButton';
import NoRecord from '@renderer/components/Pices/NoRecord';
import StatusBar from '@renderer/components/StatusBar';
import { useRequest } from '@renderer/hooks/useRequest';
import type { Response } from '@renderer/hooks/useRequest';
import { MonacoEditorModalContextProvider } from '@renderer/hooks/useMonacoEditorModal';

import WorkflowRunner from './workflow/WorkflowRunner';
import { useStylesOfWorkflow } from './styles';
import WorkflowHelpInfo from './workflow/WorkflowHelpInfo';

const Workflow: React.FC = () => {
  const styles = useStylesOfWorkflow();
  const { t } = useTranslation();

  const { data: runnersResp, run: getWorkflowRunners, setState } = useRequest<
    Response<WorkflowRunnerType[]>
  >(
    () =>
      MessageChannel.invoke('main', 'service:workflow', {
        action: 'getWorkflowRunners',
        params: {},
      }),
    {
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          Message.error(i18n.t<string>('fail_to_get_workflow_list'));
        }
      },
      onError(error) {
        Message.error(error.message);
      },
    },
  );

  const { run: updateRunner } = useRequest<Response<WorkflowRunnerType>>(
    (id: string) =>
      MessageChannel.invoke('main', 'service:workflow', {
        action: 'getWorkflowRunner',
        params: { id },
      }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          Message.error(i18n.t<string>('fail_to_get_workflow_detail'));
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
        Message.error(error.message);
      },
    },
  );

  const { run: createRunner } = useRequest<Response<string | null>>(
    (type: WorkflowTaskType) =>
      MessageChannel.invoke('main', 'service:workflow', {
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
          Message.error(
            `${i18n.t<string>('fail_to_create_workflow')}: ${rsp.result}`,
          );
        }
        getWorkflowRunners();
      },
      onError(error) {
        Message.error(error.message);
      },
    },
  );

  const { run: removeRunner } = useRequest<Response<string | null>>(
    (id: string) =>
      MessageChannel.invoke('main', 'service:workflow', {
        action: 'removeWorkflowRunner',
        params: {
          id,
        },
      }),
    {
      manual: true,
      onSuccess(rsp) {
        if (rsp.code !== 200) {
          Message.error(
            `${i18n.t<string>('fail_to_remove_workflow')}: ${rsp.result}`,
          );
        }
        getWorkflowRunners();
      },
      onError(error) {
        Message.error(error.message);
      },
    },
  );

  useBus(
    'event:stream:workflow:task-status',
    (event: EventAction) => {
      const { payload } = event;
      const { runnerId, taskId, status } = payload;

      setState((result) => {
        let { result: runners } = result;
        let index = -1;

        if (!runners) return result;
        runners = runners.slice();
        index = runners.findIndex((runner) => runner.id === runnerId);
        if (index === -1) return result;
        runners[index].queue = runners[index].queue.map((task) => {
          if (task.id === taskId) {
            task.status = status;
          }
          return task;
        });

        return {
          ...result,
          result: runners,
        };
      });
    },
    [setState],
  );

  useBus(
    'event:stream:workflow:status',
    (event: EventAction) => {
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
    },
    [setState],
  );

  return (
    <MonacoEditorModalContextProvider>
      <Container className={styles.container}>
        <div className={styles.headerActions}>
          <WorkflowHelpInfo />
          <MenuButton
            menuButton={
              <IconButton size="small">
                <AddCircleIcon color="primary" />
              </IconButton>
            }
            config={[
              {
                label: `${t('source_task')} (puppeteer)`, // puppeteer headless browser (data source)
                key: 'puppeteer',
                onClick: () => createRunner('puppeteer-source'),
              },
              {
                label: `${t('source_task')} (crawler)`, // web crawler (data source)
                key: 'crawler',
                onClick: () => createRunner('crawler-source'),
              },
              {
                label: `${t('source_task')} (node)`, // node script, generate data from local script or remote request (data source)
                key: 'pipe',
                onClick: () => createRunner('node-source'),
              },
            ]}
          />
        </div>
        <div>
          {runnersResp?.result?.map((runner) => (
            <WorkflowRunner
              {...runner}
              key={runner.id}
              removeRunner={removeRunner}
              updateRunner={updateRunner}
            />
          ))}
          <NoRecord hidden={!!runnersResp?.result?.length} />
        </div>
        <StatusBar />
      </Container>
    </MonacoEditorModalContextProvider>
  );
};

export default Workflow;
