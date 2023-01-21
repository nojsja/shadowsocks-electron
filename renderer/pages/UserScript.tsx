import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';

import TextEditor from '../components/Pices/TextEditor';
import MenuButton from '../components/Pices/MenuButton';

const useStyles = makeStyles((theme) => createStyles({
  pageWrapper: {
    padding: theme.spacing(.5),
  },
  headerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(1),
    padding: `0 ${theme.spacing(.5)}px`,
  },
  headerActionButton: {
    cursor: 'pointer',
  },
  scriptWrapper: {

  },
  textEditorWrapper: {
    maxHeight: '30vh',
    overflowY: 'scroll',
  },
  textEditorActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  textEditorActionButton: {
    marginTop: theme.spacing(.5),
    marginRight: theme.spacing(1),
    cursor: 'pointer',
  }
}));

const UserScript: React.FC= () => {
  const styles = useStyles();
  const onScriptChange = (content: string) => {
    console.log(content);
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
            {
              label: 'Processor Task (pipe)', // process data (processor)
              key: 'pipe',
            },
            {
              label: 'Effect Task (ui)', // run tasks on ui process, such as notification, ssr/ss parsing, etc. (effect)
              key: 'pipe',
            },
          ]}
        />
      </div>
      <div className={styles.scriptWrapper}>
        <div className={styles.textEditorWrapper}>
          <TextEditor placeholder="[puppeteer / clipboard] api is injected already." onChange={onScriptChange} defaultValue="1" />
        </div>
        <div className={styles.textEditorActions}>
          <DeleteIcon className={styles.textEditorActionButton} color="action" />
          <PlayCircleFilledWhiteIcon className={styles.textEditorActionButton} color="action" />
        </div>
      </div>
    </div>
  );
}

export default UserScript;
