import React from 'react';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import DeleteIcon from '@material-ui/icons/Delete';

import TextEditor from '../../components/Pices/TextEditor';
import { useStylesOfWorkflow } from '../styles';

const ProcessorTask = () => {
  const styles = useStylesOfWorkflow();
  const onScriptChange = (content: string) => {
    console.log(content);
  };

  return (
    <div>
      <div className={styles.scriptWrapper}>
        <div className={styles.textEditorWrapper}>
          <TextEditor placeholder="[puppeteer / clipboard] api is injected already." onChange={onScriptChange} defaultValue="" />
        </div>
        <div className={styles.textEditorActions}>
          <DeleteIcon className={styles.textEditorActionButton} color="action" />
          <PlayCircleFilledWhiteIcon className={styles.textEditorActionButton} color="action" />
        </div>
      </div>
    </div>
  );
};

ProcessorTask.type = 'processor-pipe';

export default ProcessorTask;
