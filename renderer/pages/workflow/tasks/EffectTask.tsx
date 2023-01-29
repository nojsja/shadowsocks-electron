import React from 'react';

import { useStylesOfWorkflow } from '@renderer/pages/styles';
import { type WorkflowTask } from '@renderer/types';
import TaskEditor from './TaskEditor';

const template =`
  module.exports = function(content, {
    /**
    * @name dispatch [trigger event to renderer process]
    * @param action reconnect-server | add-server | disconnect-server | notifycation
    * @param args unknown
    * @returns void
    * @example
    * * demo1: connect client to server
    * > dispatch('reconnect-server');
    * * demo2-1: add server (ss) to client
    * > dispatch('add-server', 'ss://xxx');
    * * demo2-2: add server (ssr) to client
    * > dispatch('add-server', 'ssr://xxx');
    * * demo3: disconnect client from server
    * > dispatch('disconnect-server');
    * * demo4: send notifycation
    * > dispatch('notifycation', {
    *     message: 'xxx',
    *     type: 'default', // type - 'default' | 'error' | 'success' | 'warning' | 'info'
    *   });
    */
    dispatch,
  }) {
    dispatch('notifycation', {
      message: content,
      type: 'success',
    });
  };
`;

interface Props extends WorkflowTask {
  onTaskDelete: (taskId: string) => void;
}

const EffectTask: React.FC<Props> = (props) => {
  const styles = useStylesOfWorkflow();

  return (
    <>
      <span className={styles.textEditorTitle}>effect</span>
      <TaskEditor
        {...props}
        templateCode={template}
      />
    </>
  );
};

export const type = 'effect-pipe';

export default EffectTask;
