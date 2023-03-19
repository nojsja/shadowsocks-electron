import React, { useEffect, useRef } from 'react';
import {
  Terminal,
  useEventQueue,
  textLine,
  textWord,
  commandWord,
  inlineTextLine,
  inlineTextWord,
} from '@nojsja/crt-terminal';
import { createStyles, DialogContent, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { AdaptiveDialog } from '@renderer/components/Pices/Dialog';
import {
  CONSOLE_BUFFER_SIZE,
  TaskConsoleData,
} from '@renderer/hooks/useWorkflowTaskTerminal';
import { useTerminalVisitor } from '@renderer/hooks';
import { useTypedSelector } from '@renderer/redux/reducers';
import useTerminalCommand from './hooks/useTerminalCommand';
import { useAIPrompt } from './hooks/useAIPrompt';

interface Props {
  open: boolean;
  taskId: string | null;
  taskIdList: string[];
  onCloseDialog: (
    reason: 'backdropClick' | 'escapeKeyDown' | 'command',
  ) => void;
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
      height: '100vh',
      '&:first-child': {
        paddingTop: 0,
      },
      '& .crt-terminal': {
        maxHeight: '100vh',
        borderRadius: 0,
        boxShadow:
          '0 0 1.8571428571rem #252925, inset 0 0 2rem 1.4285714286rem #000;',
      },
      '& .crt-terminal__overflow-container': {
        '&::-webkit-scrollbar-thumb': {
          background: '#8aa950 !important',
        },
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
  const { openAIAPIKey, httpProxy } = useTypedSelector(
    (state) => state.settings,
  );
  const eventQueue = useEventQueue();
  const { sendMessageWithStream, onStreamMessageComing } = useAIPrompt({
    sessionId: taskId || undefined,
  });
  const prompt = useTerminalCommand();
  const styles = useStyles();
  const { print, clear } = eventQueue.handlers;
  const { get, wipe, registry, unregistry } = useTerminalVisitor();
  const isFirstAskAI = useRef(true);
  const lastMessageText = useRef('');
  const { t } = useTranslation();

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
                words: [
                  textWord({
                    className: `${styles.text} warn`,
                    characters: 'You need say something.',
                  }),
                ],
              }),
            ]);
            return;
          }
          if (isFirstAskAI.current) {
            if (!openAIAPIKey || !httpProxy?.enable) {
              print([
                textLine({
                  words: [
                    ...(!openAIAPIKey
                      ? [
                          textWord({
                            className: `${styles.text} info`,
                            characters: t('open_ai_use_private_key_tips'),
                          }),
                        ]
                      : []),
                    ...(!httpProxy?.enable || !httpProxy?.enableAIProxy
                      ? [
                          textWord({
                            className: `${styles.text} warn`,
                            characters: t('open_ai_enable_proxy_tips'),
                          }),
                        ]
                      : []),
                  ],
                }),
              ]);
            }
            isFirstAskAI.current = false;
          }
          sendMessageWithStream(question)
            // .then((text) => {
            //   print([
            //     textLine({
            //       words: [
            //         textWord({
            //           className: `${styles.text}`,
            //           characters: `${text}`,
            //         }),
            //       ],
            //     }),
            //   ]);
            // })
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
        onCloseDialog('command');
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

  useEffect(() => {
    return onStreamMessageComing((msg) => {
      let message = msg;
      message = message.replace(lastMessageText.current, '');
      lastMessageText.current = msg;

      print([
        inlineTextLine({
          words: [
            inlineTextWord({
              characters: message,
            }),
          ],
        }),
      ]);
    });
  }, [onStreamMessageComing]);

  return (
    <AdaptiveDialog
      fullScreen
      maxWidth="md"
      open={open}
      onClose={(e, reason) => onCloseDialog(reason)}>
      <DialogContent className={styles.crtTerminalWrapper}>
        <Terminal
          queue={eventQueue}
          effects={{
            textEffects: false,
            pixels: true,
          }}
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
