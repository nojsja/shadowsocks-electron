import React, { useCallback, useEffect, useRef, useState } from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import LaunchIcon from '@material-ui/icons/Launch';
import { IconButton, Tooltip, useMediaQuery } from '@material-ui/core';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import cls from 'classnames';
import CodeIcon from '@material-ui/icons/Code';
import classNames from 'classnames';

import useMonacoEditorModal from '@/renderer/hooks/useMonacoEditorModal';
import TextEditor, { TextEditorRef } from '@renderer/components/Pices/TextEditor';
import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { type WorkflowTask } from '@renderer/types';
import { useDidUpdate, usePreviousValue, useTaskFS } from '@renderer/hooks';
import { useTranslation } from 'react-i18next';

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => Promise<void>;
  templateCodePath: string;
}

const TaskEditor: React.FC<Props> = ({
  id,
  scriptPath,
  onTaskDelete,
  templateCodePath,
}) => {
  const styles = useStylesOfWorkflow();
  const { t } = useTranslation();
  const [scriptContent, setScriptContent] = useState<string>('');
  const taskFS = useTaskFS(scriptPath);
  const editorRef = useRef<TextEditorRef>(null);
  const cursorRef = useRef<[number, number]>([0, 0]);
  const isDeleting = useRef(false);
  const [isContentTouched, setContentTouched] = useState(false);
  const matchMaxWidth = useMediaQuery('(max-width: 500px)');
  const matchMaxHeight = useMediaQuery('(max-width: 700px)');
  const preScriptContent = usePreviousValue(scriptContent || null);
  const { openModal, /* closeModal, */setValue } = useMonacoEditorModal();

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

  const onScriptSave = useCallback((content: string) => {
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
  }, []);

  const onScriptChange = useCallback((content: string) => {
    setContentTouched(content !== scriptContent);
  }, [scriptContent]);

  const onScriptOpen = () => {
    openModal({
      onConfirm(value) {
        onScriptSave(value);
      },
    });
    setValue(scriptContent);
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
    editorRef.current?.setValue(scriptContent);
    if (preScriptContent !== null) { // not first load
      editorRef.current?.focus();
      editorRef.current?.restoreCursor(...cursorRef.current);
    }
  }, [scriptContent, preScriptContent]);

  return (
    <div className={styles.scriptWrapper}>
      <div
        className={
          classNames(
            styles.textEditorWrapper,
            matchMaxWidth && 'wide',
            matchMaxHeight && 'high',
          )
        }
      >
        <TextEditor
          className={styles.textEditorContent}
          onContentSave={onScriptSave}
          placeholder=""
          wrap="off"
          noAutosize
          editorRef={editorRef}
          onChange={onScriptChange}
          defaultValue=""
        />
      </div>
      <div className={styles.textEditorActions}>
        <Tooltip title={t('delete')}>
          <IconButton onClick={onTaskDeleteInner} size="small">
            <DeleteIcon className={styles.textEditorActionButton} color="action" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('open_with_code_editor')}>
          <IconButton size="small" onClick={onScriptOpen}>
            <LaunchIcon className={styles.textEditorActionButton} color="action" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('restore')}>
          <IconButton size="small" onClick={onScriptReload}>
            <RotateLeftIcon className={styles.textEditorActionButton} color="action" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('save_editor_content_tips')}>
          <IconButton size="small" onClick={() => onScriptSave(editorRef.current?.getValue() ?? '')}>
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
        <Tooltip title={t('load_template_code')}>
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
