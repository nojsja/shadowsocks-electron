import React, { useEffect } from 'react';
import {
  Terminal,
  useEventQueue,
  textLine,
  textWord,
  commandWord
} from 'crt-terminal';
import {
  createStyles,
  DialogContent,
  makeStyles,
} from '@material-ui/core';

import { AdaptiveDialog } from '@renderer/components/Pices/Dialog';
import { CONSOLE_BUFFER_SIZE, TaskConsoleData } from '@renderer/hooks/useWorkflowTaskTerminal';
import { useTerminalVisitor } from '@renderer/hooks';

interface Props {
  open: boolean;
  taskId: string | null;
  taskIdList: string[];
  onCloseDialog: () => void;
  onRunnerStart: () => void;
}

const bannerText = "< type 'help' to get tips >";
const helpInfo = [
  'You are in task terminal now.',
  'Command List:',
  '[help/h]: show help info.',
  '[id/i]: get ID of current task.',
  '[ls/l]: list tasks of workflow.',
  '[run/r]: run whole workflow.',
  '[clear/c]: clear the terminal.',
  '[wipe/w]: wipe the terminal.',
  '[exit/e]: exit the terminal.',
];

const banner = [
  textLine({ words: [textWord({ characters: bannerText })] }),
];

const commandAliasMap: { [key: string]: string } = {
  h: 'help',
  i: 'id',
  l: 'ls',
  c: 'clear',
  w: 'wipe',
  e: 'exit',
  r: 'run',
};

const useStyles = makeStyles((theme) => createStyles({
  text: {
    '&.error': {
      color: '#e97bb2'
    },
    '&.info': {
      color: '#88abda'
    },
    '&.log': {
      color: '#d0fc7e'
    },
    '&.warn': {
      color: '#e9b97b'
    },
    '&.unknown': {
      color: '#a2a2ca'
    },
    '&.help': {
      fontStyle: 'italic'
    }
  },
  crtTerminalWrapper: {
    padding: 0,
    height: '70vh',
    '&:first-child': {
      paddingTop: 0,
    },
    '& .crt-terminal': {
      maxHeight: '70vh',
      borderRadius: 0,
      boxShadow: '0 0 1.8571428571rem #252925, inset 0 0 2rem 1.4285714286rem #000;'
    },
    '& .crt-terminal__overflow-container': {
      '&::-webkit-scrollbar-thumb': {
        background: '#8aa950 !important',
      }
    }
  }
}));

const WorkflowTaskTerminal: React.FC<Props> = ({
  open,
  taskId,
  taskIdList,
  onCloseDialog,
  onRunnerStart,
}) => {
  const eventQueue = useEventQueue();
  const styles = useStyles();
  const { print, clear } = eventQueue.handlers;
  const {
    get,
    wipe,
    registry,
    unregistry
  } = useTerminalVisitor();

  const onCommand = (command: string) => {
    const commandString = commandAliasMap[command.trim()] || command.trim();

    switch (commandString) {
      case 'help':
        print(helpInfo.map((info) => textLine({
          words: [textWord({ className: `${styles.text} help`, characters: info })]
        })));
        break;
      case 'run':
        onRunnerStart();
        break;
      case 'id':
        print([
          textLine({
            words: [textWord({ characters: taskId ?? 'null' })]
          })
        ]);
        break;
      case 'ls':
        print(taskIdList.map((id) => textLine({
          words: [textWord({ characters: id })]
        })));
        break;
      case 'exit':
        onCloseDialog();
      break;
      case 'clear':
        clear();
      break;
      case 'wipe':
        taskId && wipe(taskId);
        clear();
      break;
      default:
        print([
          textLine({
            words: [
              commandWord({
                className: `${styles.text} unknown`,
                characters: command,
                prompt: '-> unknown command: '
              }),
            ],
          }),
        ]);
      break;
    }
  };

  useEffect(() => {
    if (!open || !taskId) {
      clear();
      return;
    }
    const consoleInfo = get(taskId);
    const printListener = (info: TaskConsoleData) => {
      print([
        textLine({
          words: [
            textWord({ className: `${styles.text} ${info.type}`, characters: info.data }),
          ],
        }),
      ]);
    };

    clear();
    print(consoleInfo.map((info) => {
      return textLine({
        words: [
          textWord({ className: `${styles.text} ${info.type}`, characters: info.data }),
        ],
      });
    }));
    registry(taskId, printListener);

    return () => {
      unregistry(taskId, printListener);
    };
  }, [taskId, open]);

  return (
    <AdaptiveDialog
      open={open}
      onClose={onCloseDialog}
      fullWidth
      maxWidth="md"
    >
      <DialogContent className={styles.crtTerminalWrapper}>
        <Terminal
          queue={eventQueue}
          maxHistoryCommands={CONSOLE_BUFFER_SIZE}
          printer={{
            printerSpeed: 8,
            charactersPerTick: 20,
          }}
          banner={banner}
          onCommand={onCommand}
        />
      </DialogContent>
    </AdaptiveDialog>
  );
}

export default WorkflowTaskTerminal;
