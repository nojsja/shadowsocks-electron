import React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import LaunchIcon from '@material-ui/icons/Launch';
import { Tooltip } from '@material-ui/core';
import open from 'open';

import TextEditor from '../../../components/Pices/TextEditor';
import { useStylesOfWorkflow } from '../../styles';
import { WorkflowTask } from '../../../types';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => void;
}

const NodeSourceTask: React.FC<Props> = ({ scriptPath }) => {
  const styles = useStylesOfWorkflow();
  const onScriptChange = (content: string) => {
    console.log(content);
  };
  const onScriptOpen = () => {
    open(scriptPath);
  };

  return (
    <>
      node
      <div className={styles.scriptWrapper}>
        <div className={styles.textEditorWrapper}>
          <TextEditor placeholder="" onChange={onScriptChange} defaultValue="" />
        </div>
        <div className={styles.textEditorActions}>
          <Tooltip title="Delete">
            <DeleteIcon className={styles.textEditorActionButton} color="action" />
          </Tooltip>
          <Tooltip title="Open with external editor">
            <LaunchIcon className={styles.textEditorActionButton} onClick={onScriptOpen} color="action" />
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export const type = 'node-source';

export default NodeSourceTask;
