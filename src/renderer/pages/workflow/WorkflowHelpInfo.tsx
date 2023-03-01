import { shell } from 'electron';
import React, { memo, useEffect, useState } from 'react';
import Popover from '@material-ui/core/Popover';
import { createStyles, IconButton, Link, makeStyles, useTheme } from '@material-ui/core';
import HelpOutlinedIcon from '@material-ui/icons/HelpOutlined';
import i18n from 'i18next';
import { CopyBlock, dracula, tomorrowNightBright } from 'react-code-blocks';
import { MessageChannel } from 'electron-re';
import path from 'path';
import { useTranslation } from 'react-i18next';

import { Message, useRequest, useTaskFS } from '@renderer/hooks';
import { Response } from '@renderer/hooks/useRequest';
import { WORKFLOW_TASK_FILE } from '@renderer/types';
import { scrollBarStyle, useStylesOfWorkflow } from '@renderer/pages/styles';

const useStyles = makeStyles((theme) => createStyles({
  scrollWrapper: {
    '& *': scrollBarStyle(6, 0, theme)
  }
}));

interface InstrunctionProps {
  codeScripts: { [key: string]: string };
}

const openLink = (url: string) => {
  shell.openExternal(url);
};

const InstrunctionEnUs: React.FC<InstrunctionProps> = ({ codeScripts }) => {
  const styles = useStylesOfWorkflow();
  const innerStyles = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();
  const isDarkMode = theme.palette.type === 'dark';

  return (
    <div className={styles.headerHelpInfoWrapper}>
      {t('workflow_task_text_00_01')}
      <p>
        {t('workflow_task_text_00_02')}
      </p>
      <p>
        {t('workflow_task_text_00_03')}
      </p>
      <p>
        {t('workflow_task_text_00_04')}
      </p>
      <h1>{t('workflow_task_text_01_01_title')}</h1>
      <p>
        {t('workflow_task_text_01_01_block_01')}
      </p>
      <h2>{t('workflow_task_text_01_01_01_title')}</h2>
      <p>
        <Link
          onClick={() => openLink('https://github.com/puppeteer/puppeteer')}
        >
          Puppeteer
        </Link> - {t('workflow_task_text_01_01_01_01')}
        <p className={innerStyles.scrollWrapper}>
          <CopyBlock
            language="javascript"
            text={codeScripts[WORKFLOW_TASK_FILE.puppeteerSource]}
            showLineNumbers
            theme={isDarkMode ? dracula : tomorrowNightBright}
            wrapLines
            codeBlock
          />
        </p>
      </p>
      <p>
        {t('workflow_task_text_01_01_01_02')}
      </p>
      <h2>{t('workflow_task_text_01_01_02_title')}</h2>
      <p>
        <Link
          onClick={() => openLink("https://github.com/bda-research/node-crawler")}
        >
          Crawler
        </Link> - {t('workflow_task_text_01_01_02_01')}
        <p className={innerStyles.scrollWrapper}>
          <CopyBlock
            language="javascript"
            text={codeScripts[WORKFLOW_TASK_FILE.crawlerSource]}
            showLineNumbers
            theme={isDarkMode ? dracula : tomorrowNightBright}
            wrapLines
            codeBlock
          />
        </p>
      </p>
      <h2>{t('workflow_task_text_01_01_03_title')}</h2>
      <p>
        {t('workflow_task_text_01_01_03_01')}
        <p className={innerStyles.scrollWrapper}>
          <CopyBlock
            language="javascript"
            text={codeScripts[WORKFLOW_TASK_FILE.nodeSource]}
            showLineNumbers
            theme={isDarkMode ? dracula : tomorrowNightBright}
            wrapLines
            codeBlock
          />
        </p>
      </p>
      <h1>{t('workflow_task_text_01_02_title')}</h1>
      <p>
        {t('workflow_task_text_01_02_block_01')}
        <p className={innerStyles.scrollWrapper}>
          <CopyBlock
            language="javascript"
            text={codeScripts[WORKFLOW_TASK_FILE.processorPipe]}
            showLineNumbers
            theme={isDarkMode ? dracula : tomorrowNightBright}
            wrapLines
            codeBlock
          />
        </p>
      </p>
      <h1>{t('workflow_task_text_01_03_title')}</h1>
      <p>
        <p>
          {t('workflow_task_text_01_03_block_01')}
        </p>
        <p>
          {t('workflow_task_text_01_03_block_02')}
        </p>
        <p className={innerStyles.scrollWrapper}>
          <CopyBlock
            language="javascript"
            text={codeScripts[WORKFLOW_TASK_FILE.effectPipe]}
            showLineNumbers
            theme={isDarkMode ? dracula : tomorrowNightBright}
            wrapLines
            codeBlock
          />
        </p>
      </p>
    </div>
  )
};

function WorkflowHelpInfo() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const styles = useStylesOfWorkflow();
  const open = Boolean(anchorEl);
  const id = open ? 'help-popover' : undefined;
  const taskFS = useTaskFS();
  const [taskDemoScripts, setTaskDemoScripts] = useState({
    [WORKFLOW_TASK_FILE.puppeteerSource]: '',
    [WORKFLOW_TASK_FILE.crawlerSource]: '',
    [WORKFLOW_TASK_FILE.nodeSource]: '',
    [WORKFLOW_TASK_FILE.processorPipe]: '',
    [WORKFLOW_TASK_FILE.effectPipe]: '',
  });

  const { data: workflowTaskDemoRsp } = useRequest<Response<string>>(() => {
    return MessageChannel.invoke('main', 'service:workflow', {
      action: 'getWorkflowTaskDemoDir',
      params: {},
    });
  }, {
    onError(error) {
      Message.error(`${i18n.t<string>('fail_to_load_workflow_demo_script')}: ${error.message}`);
    },
    cacheKey: 'main/service:workflow/workflowTaskDemoDir',
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const loadDemoScripts = (parentDir: string) => {
    Object.keys(WORKFLOW_TASK_FILE).forEach((taskType) => {
      const taskFile = (WORKFLOW_TASK_FILE as any)[taskType];
      taskFS
        .read(path.join(parentDir, taskFile))
        .then((templateCode) => {
          setTaskDemoScripts((prev) => {
            return {
              ...prev,
              [taskFile]: templateCode,
            };
          });
        }).catch((e) => {
          console.log(e);
        });
    });
  };

  useEffect(() => {
    const templateCodePath = workflowTaskDemoRsp?.result;
    if (workflowTaskDemoRsp?.code === 200 && templateCodePath) {
      loadDemoScripts(templateCodePath);
    }
  }, [workflowTaskDemoRsp]);

  return (
    <div>
      <IconButton size="small" onClick={handleClick}>
        <HelpOutlinedIcon
          className={`${styles.headerActionButton}`}
          aria-describedby={id}
          color="action"
        />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <InstrunctionEnUs codeScripts={taskDemoScripts} />
      </Popover>
    </div>
  );
}

export default memo(WorkflowHelpInfo);