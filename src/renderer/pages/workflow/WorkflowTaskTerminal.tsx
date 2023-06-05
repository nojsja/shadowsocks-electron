import React, { useEffect, useRef, useState } from 'react';
import {
  Terminal,
  useEventQueue,
  textLine,
  commandLine,
  textWord,
  commandWord,
  inlineTextLine,
  inlineTextWord,
} from '@nojsja/crt-terminal';
import {
  createStyles,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
  Tooltip,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Clear, DeleteOutline, HighlightOff, Replay } from '@material-ui/icons';

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
    dialogActionsWrapper: {
      padding: 4,
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
  const { openAIAPIKey, httpProxy, terminalDefaultMode } = useTypedSelector(
    (state) => state.settings,
  );
  const eventQueue = useEventQueue();
  const {
    sendMessageWithStream,
    onStreamMessageComing,
    cancelReply,
  } = useAIPrompt({
    sessionId: taskId || undefined,
  });
  const prompt = useTerminalCommand();
  const styles = useStyles();
  const { print, clear } = eventQueue.handlers;
  const { get, wipe, registry, unregistry } = useTerminalVisitor();
  const isFirstAskAI = useRef(true);
  const lastMessageText = useRef('');
  const lastActionText = useRef('');
  const [isInAIMode, setAIMode] = useState(terminalDefaultMode === 'ai');
  const { t } = useTranslation();

  const reReply = () => {
    if (!lastActionText.current) return;
    print([
      commandLine({
        words: [
          commandWord({
            className: `${styles.text}`,
            characters: lastActionText.current,
            prompt: '> ',
          }),
        ],
      }),
    ]);
    onCommand(lastActionText.current);
  };

  const clearScreen = () => {
    clear();
  };

  const closeTerminal = () => {
    onCloseDialog('command');
  };

  const onCommand = (command: string) => {
    const [commandName, options] = prompt.parse(command, { isInAIMode });

    lastActionText.current = command;
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
      lastActionText.current = '';
      lastMessageText.current = '';
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

  useEffect(() => {
    if (!isInAIMode || !open) return;
    print([
      textLine({
        words: [
          textWord({
            className: `${styles.text} info`,
            characters: `AI mode is on.`,
          }),
        ],
      }),
    ]);
  }, [isInAIMode, open]);

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
            pixels: false,
            screenEffects: false,
            scanner: false,
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
      <DialogActions className={styles.dialogActionsWrapper}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          spacing={1}>
          <Grid item>
            <Tooltip title={t('exit_terminal')}>
              <IconButton size="small" onClick={closeTerminal}>
                <HighlightOff />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={t('clear_screen')}>
              <IconButton size="small" onClick={clearScreen}>
                <DeleteOutline />
              </IconButton>
            </Tooltip>
            {isInAIMode && (
              <>
                <Tooltip title={t('regenerate_ai_answer')}>
                  <IconButton size="small" onClick={reReply}>
                    <Replay />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('stop_ai_output')}>
                  <IconButton size="small" onClick={cancelReply}>
                    <Clear />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Grid>
          <Grid item>
            <Tooltip title={t('terminal_mode')}>
              <Select
                value={isInAIMode ? 'ai' : 'normal'}
                onChange={(e) => setAIMode(e.target.value === 'ai')}>
                <MenuItem value="ai">{t('ai')}</MenuItem>
                <MenuItem value="normal">{t('normal')}</MenuItem>
              </Select>
            </Tooltip>
          </Grid>
        </Grid>
      </DialogActions>
    </AdaptiveDialog>
  );
};

export default WorkflowTaskTerminal;
