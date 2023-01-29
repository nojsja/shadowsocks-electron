import React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import LaunchIcon from '@material-ui/icons/Launch';

import TextEditor from '../../../components/Pices/TextEditor';
import { useStylesOfWorkflow } from '../../styles';
import { Tooltip } from '@material-ui/core';

const ProcessorTask = () => {
  const styles = useStylesOfWorkflow();
  const onScriptChange = (content: string) => {
    console.log(content);
  };

  return (
    <>
      <div className={styles.scriptWrapper}>
        <div className={styles.textEditorWrapper}>
          <TextEditor placeholder="" onChange={onScriptChange} defaultValue="" />
        </div>
        <div className={styles.textEditorActions}>
          <Tooltip title="Delete">
            <DeleteIcon className={styles.textEditorActionButton} color="action" />
          </Tooltip>
          <Tooltip title="Open with external editor">
            <LaunchIcon className={styles.textEditorActionButton} color="action" />
          </Tooltip>
        </div>
      </div>
    </>
  );
};

ProcessorTask.type = 'processor-pipe';

export default ProcessorTask;
