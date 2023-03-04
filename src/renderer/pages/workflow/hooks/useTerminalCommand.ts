import { useMemo } from 'react';
import parser from 'minimist';

interface OptionOptionsType {
  alias?: string;
  desc: string;
  demand?: boolean;
  optional?: boolean;
  demandSymbol?: string;
}

interface CommandOptionsType {
  alias?: string;
  desc: string;
  options?: [string, OptionOptionsType][];
}

type CommandCallback = (name: string, args: { [key: string]: unknown }) => void;

export class Option {
  constructor(name: string, options: OptionOptionsType) {
    this.alias = options.alias;
    this.desc = options.desc;
    this.name = name;
    this.optional = options.optional ?? false;
    this.demand = options.demand ?? false;
    this.demandSymbol = options.demandSymbol ?? '<data>';
  }
  name: string;
  alias?: string;
  desc: string;
  optional: boolean;
  demand: boolean;
  demandSymbol: string;

  parse(params: { [key: string]: unknown }) {
    const result: { [key: string]: unknown } = {};
    const pureName = this.name.replace(/^-+/, '');
    const pureAlias = this.alias?.replace(/^-+/, '');

    if (pureAlias && params[pureAlias]) {
      result[pureName] = params[pureAlias];
      delete params[pureAlias];
    }

    return {
      ...params,
      ...result
    };
  }

  print() {
    const demandText = this.demand ? ` ${this.demandSymbol}` : '';
    const optionalWrapper = (text: string) => this.optional ? `[${text}]` : text;
    return `${optionalWrapper(`${this.name},${this.alias}`)}${demandText}: ${this.desc}`;
  }
}

export class Command {
  constructor(name: string, opts: CommandOptionsType) {
    this.alias = opts.alias;
    this.desc = opts.desc;
    this.name = name;
    this.options = opts.options?.map(([name, options]) => {
      return new Option(name, options);
    }) ?? [];
  }
  options: Option[];
  name: string;
  alias?: string;
  desc: string;
  callback?: CommandCallback;

  action(callback: CommandCallback) {
    this.callback = callback;
  }

  parse(args: string, callback?: CommandCallback) {
    const argsList = args.split(' ');
    const command = argsList.shift();
    let result: { [key: string]: unknown };

    if (command !== this.name && command !== this.alias) {
      return null;
    }

    result = parser(argsList);
    this.options?.forEach((option) => {
      result = option.parse(result);
    });
    this.callback?.(this.name, result);
    callback?.(this.name, result);

    return result;
  }

  print() {
    const textInfo: string[] = [];

    textInfo.push(`● ${this.name}(${this.alias}): ${this.desc}`);
    this.options?.forEach((option) => {
      textInfo.push(`  ○ ${option.print()}`);
    });

    return textInfo;
  }
}


const useTerminalCommand = () => {
  const commandParams = useMemo<[string, CommandOptionsType][]>(() => [
    [
      'help', {
        alias: 'h',
        desc: 'show help menu.',
      }
    ],
    [
      'id', {
        alias: 'i',
        desc: 'get ID of current task.',
      }
    ],
    [
      'ls', {
        alias: 'l',
        desc: 'list tasks of workflow.',
      }
    ],
    [
      'run', {
        alias: 'r',
        desc: 'run [options], task as default.',
        options: [
          [
            '--all',
            {
              alias: '-a',
              desc: 'run whole workflow.',
            }
          ],
          [
            '--input',
            {
              alias: '-i',
              desc: 'run current task with input data.',
              optional: true,
              demand: true,
            }
          ]
        ]
      },
    ],
    [
      'stop', {
        alias: 's',
        desc: 'stop [options], task as default.',
        options: [
          [
            '--all',
            {
              alias: '-a',
              desc: 'stop whole workflow.'
            }
          ]
        ]
      },
    ],
    [
      'clear', {
        alias: 'c',
        desc: 'clear the terminal.',
      }
    ],
    [
      'wipe', {
        alias: 'w',
        desc: 'wipe the terminal.',
      }
    ],
    [
      'exit', {
        alias: 'e',
        desc: 'exit the terminal.',
      }
    ],
  ],
    []
  );

  const commandList = useMemo(() => {
    return commandParams.map(([name, options]) => new Command(name, options));
  }, [commandParams]);

  const print = () => {
    const textInfos = commandList.reduce<string[]>((total, command) => {
      total.push(...command.print());
      return total;
    }, [
      'You are in task terminal now.',
      'Command List:',
    ]);

    return textInfos;
  };

  const parse = (args: string, callback?: CommandCallback): [string | null, { [key: string]: unknown }] => {
    for (let index = 0; index < commandList.length; index++) {
      const command = commandList[index];
      const result = command.parse(args);
      if (result) {
        callback?.(command.name, result);
        return [command.name, result];
      }
    }

    return [null, {}];
  };

  return {
    print,
    parse
  };
};

export default useTerminalCommand;