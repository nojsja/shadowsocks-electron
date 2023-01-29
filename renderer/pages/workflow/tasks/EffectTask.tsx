import React, { useCallback, useEffect, useRef, useState } from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import LaunchIcon from '@material-ui/icons/Launch';
import { Tooltip } from '@material-ui/core';
import { shell } from 'electron';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import cls from 'classnames';
import CodeIcon from '@material-ui/icons/Code';

import TextEditor, { TextEditorRef } from '@renderer/components/Pices/TextEditor';
import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { type WorkflowTask } from '@renderer/types';
import useDidUpdate from '@/renderer/hooks/useDidUpdate';

import useTaskFS from '../hooks/useTaskFS';

const template =
  `module.exports = async function(content, {
    // see https://github.com/GoogleChrome/puppeteer for API reference.
    puppeteer,
    clipboard,
    http,
    https,
    fs,
    path,
  }) {
    const browser = await puppeteer.launch({
      headless: false,
      timeout: 30000,
    });
    const page = await browser.newPage();
    await page.goto('https://lncn.org/');

    page.click('.ssr-list-wrapper.base-box .el-button--primary');
    try {
      await browser.close();
    } catch (error) {}

    const result = clipboard.readText('clipboard');

    return result;
  };
`;

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => void;
}

const EffectTask: React.FC<Props> = ({
  id,
  scriptPath,
  onTaskDelete,
}) => {
  const styles = useStylesOfWorkflow();
  const [scriptContent, setScriptContent] = useState<string>('');
  const taskFS = useTaskFS(scriptPath);
  const editorRef = useRef<TextEditorRef>(null);
  const cursorRef = useRef<[number, number]>([0, 0]);
  const [isContentTouched, setContentTouched] = useState(false);

  const onTemplateScriptLoad = () => {
    editorRef.current?.setValue(template);
    setContentTouched(true);
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
    onTaskDelete(id);
  };

  useEffect(() => {
    onScriptReload();
  }, []);

  useDidUpdate(() => {
    editorRef.current?.focus();
    editorRef.current?.restoreCursor(...cursorRef.current);
  }, [scriptContent]);

  return (
    <>
      effect
      <div className={styles.scriptWrapper}>
        <div className={styles.textEditorWrapper}>
          <TextEditor
            className={styles.textEditorContent}
            onKeyDown={handleKeyDown}
            placeholder=""
            noAutosize
            wrap="off"
            ref={editorRef}
            onChange={onScriptChange}
            defaultValue={scriptContent}
          />
        </div>
        <div className={styles.textEditorActions}>
          <Tooltip title="Delete">
            <DeleteIcon className={styles.textEditorActionButton} onClick={onTaskDeleteInner} color="action" />
          </Tooltip>
          <Tooltip title="Open with default external editor">
            <LaunchIcon className={styles.textEditorActionButton} onClick={onScriptOpen} color="action" />
          </Tooltip>
          <Tooltip title="Restore">
            <RotateLeftIcon className={styles.textEditorActionButton} onClick={onScriptReload} color="action" />
          </Tooltip>
          <Tooltip title="Save script file, you can press 'ctrl/cmd + s' instead when focus on editor.">
            <SaveIcon
              className={cls(styles.textEditorActionButton, isContentTouched && styles.textEditorActionButtonActive)}
              onClick={onScriptSave}
              color="action"
            />
          </Tooltip>
          <Tooltip title="Load template script">
            <CodeIcon
              className={styles.textEditorActionButton}
              onClick={onTemplateScriptLoad}
              color="action"
            />
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export const type = 'effect-pipe';

export default EffectTask;
