import React, { useEffect } from 'react';
import {
  Terminal,
  useEventQueue,
  textLine,
  textWord,
  commandWord,
} from 'crt-terminal';
import { createStyles, DialogContent, makeStyles } from '@material-ui/core';

import { AdaptiveDialog } from '@renderer/components/Pices/Dialog';
import {
  CONSOLE_BUFFER_SIZE,
  TaskConsoleData,
} from '@renderer/hooks/useWorkflowTaskTerminal';
import { useTerminalVisitor } from '@renderer/hooks';
import useTerminalCommand from './hooks/useTerminalCommand';
import { useAIPrompt } from './hooks/useAIPrompt';

interface Props {
  open: boolean;
  taskId: string | null;
  taskIdList: string[];
  onCloseDialog: () => void;
  onRunnerStart: () => void;
  onRunnerStop: () => void;
  onRunnerTaskStart: (taskId: string) => void;
  onRunnerTaskStop: () => void;
}

const bannerText = "<type 'help' to get tips>";

const banner = [textLine({ words: [textWord({ characters: bannerText })] })];

const useStyles = makeStyles(() =>
  createStyles({
    text: {
      '&.error': {
        color: '#e97bb2',
      },
      '&.info': {
        color: '#88abda',
      },
      '&.log': {
        color: '#d0fc7e',
      },
      '&.warn': {
        color: '#e9b97b',
      },
      '&.unknown': {
        color: '#a2a2ca',
      },
      '&.help': {
        fontStyle: 'italic',
      },
    },
    crtTerminalWrapper: {
      padding: 0,
      height: '90vh',
      '&:first-child': {
        paddingTop: 0,
      },
      '& .crt-terminal': {
        maxHeight: '90vh',
        borderRadius: 0,
        boxShadow:
          '0 0 1.8571428571rem #252925, inset 0 0 2rem 1.4285714286rem #000;',
      },
      '& .crt-terminal__overflow-container': {
        '&::-webkit-scrollbar-thumb': {
          background: '#8aa950 !important',
        },
      },
      '& .crt-command-line': {
        padding: '.5rem 1.4285714286rem .5rem 1.4285714286rem',
      },
    },
  }),
);

const WorkflowTaskTerminal: React.FC<Props> = ({
  open,
  taskId,
  taskIdList,
  onCloseDialog,
  onRunnerStart,
  onRunnerStop,
  onRunnerTaskStart,
  onRunnerTaskStop,
}) => {
  const eventQueue = useEventQueue();
  const { sendMessage } = useAIPrompt();
  const prompt = useTerminalCommand();
  const styles = useStyles();
  const { print, clear } = eventQueue.handlers;
  const { get, wipe, registry, unregistry } = useTerminalVisitor();

  const onCommand = (command: string) => {
    const [commandName, options] = prompt.parse(command);

    switch (commandName) {
      case 'help':
        {
          const infos = prompt.print();
          print(
            infos.map((info) =>
              textLine({
                words: [
                  textWord({
                    className: `${styles.text} help`,
                    characters: info,
                  }),
                ],
              }),
            ),
          );
        }
        break;
      case 'demo':
        {
          const infos = prompt.printDemos();
          print(
            infos.map((info) =>
              textLine({
                words: [
                  textWord({ className: `${styles.text}`, characters: info }),
                ],
              }),
            ),
          );
        }
        break;
      case 'run':
        if (options.all) {
          onRunnerStart();
        } else {
          onRunnerTaskStart(
            (options.input || (options['_'] as string[])?.[0]) as string,
          );
        }
        break;
      case 'stop':
        if (options.all) {
          onRunnerStop();
        } else {
          onRunnerTaskStop();
        }
        break;
      case 'ai':
        {
          const question = (options['_'] as string[])?.join(' ') as string;
          if (!question) {
            print([
              textLine({
                words: [textWord({ characters: 'you need say something.' })],
              }),
            ]);
            return;
          }
          sendMessage(question)
            .then((text) => {
              /*
              id: "chatcmpl-6r7hK80BySdYpqO1RydIuLEw0UIeB"
              parentMessageId: "6a693b29-6e88-4f9e-a14e-343c30eceb4f"
              role: "assistant"
              text: "Hello! How can I assist you today?"
              */
              print([
                textLine({
                  words: [
                    textWord({
                      className: `${styles.text}`,
                      characters: `${text}`,
                    }),
                  ],
                }),
              ]);
            })
            .catch((err) => {
              print([
                textLine({
                  words: [
                    textWord({
                      className: `${styles.text} error`,
                      characters: err.message,
                    }),
                  ],
                }),
              ]);
            });
        }
        break;
      case 'id':
        print([
          textLine({
            words: [textWord({ characters: taskId ?? 'null' })],
          }),
        ]);
        break;
      case 'ls':
        print(
          taskIdList.map((id) =>
            textLine({
              words: [textWord({ characters: id })],
            }),
          ),
        );
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
                prompt: '-> unknown command: ',
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
            textWord({
              className: `${styles.text} ${info.type}`,
              characters: info.data,
            }),
          ],
        }),
      ]);
    };

    clear();
    print(
      consoleInfo.map((info) => {
        return textLine({
          words: [
            textWord({
              className: `${styles.text} ${info.type}`,
              characters: info.data,
            }),
          ],
        });
      }),
    );
    registry(taskId, printListener);

    return () => {
      unregistry(taskId, printListener);
    };
  }, [taskId, open]);

  return (
    <AdaptiveDialog open={open} onClose={onCloseDialog} fullWidth maxWidth="md">
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
};

export default WorkflowTaskTerminal;
