import React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import LaunchIcon from '@material-ui/icons/Launch';
import { Tooltip } from '@material-ui/core';
import { shell } from 'electron';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';

import TextEditor from '../../../components/Pices/TextEditor';
import { useStylesOfWorkflow } from '../../styles';
import { WorkflowTask } from '../../../types';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => void;
}

const PuppeteerSourceTask: React.FC<Props> = ({
  id,
  scriptPath,
  onTaskDelete,
}) => {
  const styles = useStylesOfWorkflow();
  const onScriptChange = (content: string) => {
    console.log(content);
  };
  const onScriptOpen = () => {
    shell.openPath(scriptPath);
  };
  const onTaskDeleteInner = () => {
    onTaskDelete(id);
  };
  const onScriptReload = () => {
    console.log('reload');
  };

  return (
    <>
      puppeteer
      <div className={styles.scriptWrapper}>
        <div className={styles.textEditorWrapper}>
          <TextEditor placeholder="" onChange={onScriptChange} defaultValue="" />
        </div>
        <div className={styles.textEditorActions}>
          <Tooltip title="Delete">
            <DeleteIcon className={styles.textEditorActionButton} onClick={onTaskDeleteInner} color="action" />
          </Tooltip>
          <Tooltip title="Open with default external editor">
            <LaunchIcon className={styles.textEditorActionButton} onClick={onScriptOpen} color="action" />
          </Tooltip>
          <Tooltip title="Reload">
            <RotateLeftIcon className={styles.textEditorActionButton} onClick={onScriptReload} color="action" />
          </Tooltip>
          <Tooltip title="Save, you can press 'Ctrl + S' instead when focus on editor.">
            <SaveIcon className={styles.textEditorActionButton} color="action" />
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export const type = 'puppeteer-source';

export default PuppeteerSourceTask;
