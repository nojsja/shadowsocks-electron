import React, { useCallback, useEffect, useRef, useState } from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import LaunchIcon from '@material-ui/icons/Launch';
import { IconButton, Tooltip } from '@material-ui/core';
import { shell } from 'electron';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import cls from 'classnames';
import CodeIcon from '@material-ui/icons/Code';
import classNames from 'classnames';

import TextEditor, { TextEditorRef } from '@renderer/components/Pices/TextEditor';
import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { type WorkflowTask } from '@renderer/types';
import { useDidUpdate, useTaskFS } from '@renderer/hooks';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  templateCodePath: string;
}

const TaskEditor: React.FC<Props> = ({
  status,
  id,
  scriptPath,
  onTaskDelete,
  templateCodePath,
}) => {
  const styles = useStylesOfWorkflow();
  const [scriptContent, setScriptContent] = useState<string>('');
  const taskFS = useTaskFS(scriptPath);
  const editorRef = useRef<TextEditorRef>(null);
  const cursorRef = useRef<[number, number]>([0, 0]);
  const isDeleting = useRef(false);
  const [isContentTouched, setContentTouched] = useState(false);
  const isErrored = status === 'failed';

  const onTemplateScriptLoad = () => {
    taskFS.read(templateCodePath).then((templateCode) => {
      editorRef.current?.setValue(templateCode);
      setContentTouched(true);
    }).catch((e) => {
      console.log(e);
    });
  };

  const onScriptReload = () => {
    taskFS
      .read()
      .then((content) => {
        editorRef.current?.setValue(content);
        setContentTouched(false);
        setScriptContent(content);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onScriptSave = () => {
    const content = editorRef.current?.getValue() ?? '';

    taskFS
      .write(content)
      .then(() => {
        cursorRef.current = editorRef.current?.getCursor() ?? [0, 0];
        setContentTouched(false);
        setScriptContent(content);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  /**
   * @name handleKeyDown [trigger save action then press ctrl + s or cmd + s]
   * @param event [React.KeyboardEvent]
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      onScriptSave();
    }
  }, []);

  const onScriptChange = useCallback((content: string) => {
    setContentTouched(content !== scriptContent);
  }, [scriptContent]);

  const onScriptOpen = () => {
    shell.openPath(scriptPath);
  };

  const onTaskDeleteInner = () => {
    if (isDeleting.current) return;
    isDeleting.current = true;
    onTaskDelete(id).finally(() => {
      isDeleting.current = false;
    });
  };

  useEffect(() => {
    onScriptReload();
  }, []);

  useDidUpdate(() => {
    editorRef.current?.focus();
    editorRef.current?.restoreCursor(...cursorRef.current);
  }, [scriptContent]);

  return (
    <div className={styles.scriptWrapper}>
      <div className={styles.textEditorWrapper}>
        <TextEditor
          className={classNames(styles.textEditorContent, isErrored && 'error')}
          onKeyDown={handleKeyDown}
          placeholder=""
          wrap="off"
          noAutosize
          editorRef={editorRef}
          onChange={onScriptChange}
          defaultValue={scriptContent}
        />
      </div>
      <div className={styles.textEditorActions}>
        <Tooltip title="Delete">
          <IconButton onClick={onTaskDeleteInner} size="small">
            <DeleteIcon className={styles.textEditorActionButton} color="action" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Open with default external editor">
          <IconButton size="small" onClick={onScriptOpen}>
            <LaunchIcon className={styles.textEditorActionButton} color="action" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Restore">
          <IconButton size="small" onClick={onScriptReload}>
            <RotateLeftIcon className={styles.textEditorActionButton} color="action" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Save script file, you can press 'ctrl/cmd + s' instead when focus on editor.">
          <IconButton size="small" onClick={onScriptSave}>
            <SaveIcon
              className={
                cls(
                  styles.textEditorActionButton,
                  isContentTouched && styles.textEditorActionButtonActive
                )
              }
              color="action"
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Load template code">
          <IconButton size="small" onClick={onTemplateScriptLoad}>
            <CodeIcon
              className={styles.textEditorActionButton}
              color="action"
            />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default TaskEditor;
