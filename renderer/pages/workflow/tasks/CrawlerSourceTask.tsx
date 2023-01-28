import React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';

import TextEditor from '../../../components/Pices/TextEditor';
import { useStylesOfWorkflow } from '../../styles';
import { Tooltip } from '@material-ui/core';

const CrawlerSourceTask = () => {
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
          <Tooltip title="Save">
            <SaveIcon className={styles.textEditorActionButton} color="action" />
          </Tooltip>
        </div>
      </div>
    </>
  );
};

CrawlerSourceTask.type = 'crawler-source';

export default CrawlerSourceTask;
