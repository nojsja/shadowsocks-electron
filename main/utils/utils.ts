import path from 'path';
import fs from 'fs';
import os from 'os';
import { exec, ExecOptions } from "child_process";
import { Config, SSRConfig, SSConfig, SubscriptionResult, MonoSubscriptionSSR, SubscriptionParserConfig, OneOfConfig } from '../types/extention';
import { getPathRuntime } from '../config';
import { i18n } from '../electron';
import { ProxyURI } from '../core/helpers/proxy-url';
import { get } from './http-request';

const archMap = new Map([
  ['aarch64', 'arm64'],
  ['x86', 'ia32'],
  ['x64', 'x64'],
  ['ia32', 'ia32'],
  ['arm64', 'arm64']
]);

const subParserStore = subscriptionParserStore([
  {
    name: 'Paofu Cloud',
    test: /(paofusub)\.(com|cn|org|io|net)/g,
    parse: paofuSubscriptionParser
  },
  {
    name: 'Mono Cloud',
    test: /(mymonocloud)\.(com|cn|org|io|net)/g,
    parse: monoCloudSubscriptionParser
  },
  {
    name: '',
    test: /^(http|https)/g,
    parse: paofuSubscriptionParser
  },
]);

export const getChromeExtensionsPath = (appids: string[]): Promise<any[]> => {
  const macBaseDir = `${process.env.HOME}/Library/Application Support/Google/Chrome/Default/Extensions`;
  const ubuntuBaseDir = `${process.env.HOME}/.config/google-chrome/Default/Extensions`;
  const baseDir = process.platform === 'linux' ? ubuntuBaseDir : macBaseDir;

  return Promise.all(appids.map(appid =>
    new Promise((resolve) => {
      if (fs.existsSync(path.join(baseDir, appid))) {
        return fs.promises.readdir(path.join(baseDir, appid))
          .then(dirs => {
            if (dirs && dirs.length) {
              resolve(path.join(baseDir, appid, dirs[0]));
            } else {
              resolve(null);
            }
          })
          .catch(err => {
            console.log(err);
            resolve(null);
          });
      } else {
        resolve(null);
      }
    })
  ))
}

export const getBinPath = (function () {
  let fullpath = new Map();
  const paths = (process.env.PATH as string).split(':');

  return (name: string) => {
    if (fullpath.get(name)) {
      return fullpath.get(name)
    }
    for (let i = 0; i < paths.length; i++) {
      if (fs.existsSync(path.join(paths[i], name))) {
        fullpath.set(name, path.join(paths[i], name));
        break;
      }
    }
    return fullpath.get(name);
  }
})();

export const getSSLocalBinPath = (type: 'ss' | 'ssr') => {
  const binName = `${type}-local`;
  const arch = os.arch();
  if (archMap.has(arch)) {
    switch (os.platform()) {
      case 'linux':
        return getPathRuntime(`bin/linux/${archMap.get(arch)}/${binName}`);
      case 'darwin':
        return getPathRuntime(`bin/darwin/x64/${binName}`);
      case 'win32':
          return getPathRuntime(`bin/win32/${archMap.get(arch)}/${binName}.exe`);
      default:
        return getBinPath(binName) ?? binName;
    }
  } else {
    return getBinPath(binName) ?? binName;
  }
}

export const getEncryptMethod = (config: Config): string => {
  if (config.type === 'ss') return config.encryptMethod ?? '';
  if (config.type === 'ssr') {
    if (config.encryptMethod === 'none') return config.protocol ?? '';
    return config.encryptMethod ?? '';
  };
  return '';
}

/**
  * checkEnvFiles [??????????????????????????????]
  * @author nojsja
  * @return {[type]} param [desc]
  */
 export const checkEnvFiles = (args: {_path: string, isDir: boolean, checkEmpty?: boolean, exec?: () => void}[]): void => {
  const check = function (params: {_path: string, isDir: boolean, checkEmpty?: boolean, exec?: () => void}) {
    if (!fs.existsSync(params._path)) {
      if (params.isDir) {
        fs.mkdirSync(params._path);
        params.exec && params.exec();
      } else {
        fs.closeSync(fs.openSync(params._path, 'w'));
      }
    } else {
      if (params?.checkEmpty) {
        if (fs.readdirSync(params._path).length === 0) {
          params.exec && params.exec();
        }
      }
    }
  };

  args.forEach(check);
};

/*
 * ???????????????????????????????????????????????????
 * @param src {String} ??????????????????
 * @param dist {String} ?????????????????????
 */
export const copyDir = (src: string, dist: string, callback?: (params: any) => void) => {
  let paths, stat;
  if(!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
  }

  _copy(src, dist);

  function _copy(src: string, dist: string) {
    paths = fs.readdirSync(src);
    paths.forEach(function(_path) {
        let _src = path.join(src, _path);
        let _dist = path.join(dist, _path);
        stat = fs.statSync(_src);
        // ???????????????????????????
        if(stat.isFile()) {
          fs.writeFileSync(_dist, fs.readFileSync(_src));
        } else if(stat.isDirectory()) {
          // ??????????????????????????????
          copyDir(_src, _dist, callback)
        }
    })
  }
}

/*
 * ???????????????????????????????????????????????????
 * @param src {String} ??????????????????
 * @param dist {String} ?????????????????????
 */
export const copyDirAsync = (src: string, dist: string, callback?: (params: any) => void) => {
  fs.access(dist, function(err){
    if(err){
      // ??????????????????????????????
      fs.mkdirSync(dist);
    }
    _copy(null, src, dist);
  });

  function _copy(err: Error | null, src: string, dist: string) {
    if(err){
      callback && callback(err);
    } else {
      fs.readdir(src, function(err, paths) {
        if(err){
          callback && callback(err);
        } else {
          paths.forEach(function(path) {
            var _src = src + '/' +path;
            var _dist = dist + '/' +path;
            fs.stat(_src, function(err, stat) {
              if(err){
                callback && callback(err);
              } else {
                // ???????????????????????????
                if(stat.isFile()) {
                  fs.writeFileSync(_dist, fs.readFileSync(_src));
                } else if(stat.isDirectory()) {
                  // ??????????????????????????????
                  copyDir(_src, _dist, callback)
                }
              }
            })
          })
        }
      })
    }
  }
}

export const execAsync = (command: string, options?: ExecOptions) => {
  return new Promise<{
    code: number;
    stdout?: string;
    stderr?: string;
  }>((resolve, reject) => {
    exec(command, { ...options, windowsHide: true }, (err, stdout, stderr) => {
      if (!stderr) {
        resolve({
          code: err ? 1 : 0,
          stdout
        });
      } else {
        reject({
          code: err ? 1 : 0,
          stderr
        });
      }
    });
  });
};

export function debounce<params extends any[]> (fn: (...args: params) => any, timeout: number) {
  let timer: NodeJS.Timeout;

  return function(this: any, ...args: params) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, timeout);
  }
}

export function parseUrl(text: string) {
  const parsedInfo = ProxyURI.parse(text);

  const result: OneOfConfig[] = parsedInfo.map(info => {
    const base = {
      remark: info.remark ?? info.host,
      serverHost: info.host,
      serverPort: info.port,
      password: info.password ?? '',
      encryptMethod: info.authscheme,
      timeout: 60
    };
    if (info.type === 'ssr') {
      return ({
        ...base,
        type: info.type as any,
        protocol: info.protocol ?? '',
        protocolParam: info.protocolParam ?? '',
        obfs: info.obfs ?? '',
        obfsParam: info.obfsParam ?? ''
      }) as SSRConfig;
    }

    return ({
      ...base,
      type: info.type as any,
    }) as SSConfig
  });

  return result;
}

export function parseSubscription(text: string): Promise<{ error: string | null, result: OneOfConfig[], name: string | null }> {
  return new Promise((resolve, reject) => {
    const hostnameReg = /^(?:http:\/\/|https:\/\/)?(?:www.)?([\w\.]+)?\/(.*)/;
    const httpReg = /^(http|https)/;
    if (httpReg.test(text)) {
      const subHandler = subParserStore(text);
      if (subHandler) {
        get(text).then(res => {
          let data: OneOfConfig[] = [];
          try {
            data = subHandler.parse(res.data);
          } catch (error) {
            console.log(error);
            data = [];
          } finally {
            resolve({
              error: null,
              result: data,
              name:
                res?.data?.name ||
                subHandler.name ||
                (hostnameReg.exec(text) || [])[1]
                || i18n.__('unknown_subscription')
            });
          }
        }).catch(err => {
          resolve({
            error: err.message,
            result: [],
            name: null
          });
        });
      } else {
        return resolve({
          error: i18n.__('invalid_subscription'),
          result: [],
          name: null
        });
      }
    } else {
      return resolve({
        error: i18n.__('invalid_subscription'),
        result: [],
        name: null
      });
    }
  })
}

export function subscriptionParserStore(parsers: SubscriptionParserConfig[]): (link: string) => SubscriptionParserConfig | null {
  const map: any = {};

  return (link: string) => {
    const parser = parsers.find(parser => parser.test.test(link)) || null;
    if (!parser) return null;
    const serviceName = (link.match(parser.test) || [])[0];
    if (!serviceName) return null;
    if (map[serviceName]) return map[serviceName];
    map[serviceName] = parser;
    return parser;
  }
};

/* ????????? paofusub ???????????? */
export function paofuSubscriptionParser(res: { result: string }): OneOfConfig[] {
  if (!((typeof res.result) === 'string')) return [];

  const serversBase64 = Buffer.from(res.result, 'base64').toString();

  return parseUrl(serversBase64);
};

/* mono cloud ???????????? */
export function monoCloudSubscriptionParser (res: SubscriptionResult): OneOfConfig[] {
  const result: OneOfConfig[] = [];

  for (let i = 0; i < res.server.length; i++) {
    const item = res.server[i];
    const base = {
      id: item.id,
      remark: item.remarks || item.name || item.server,
      serverHost: item.server,
      serverPort: item.server_port,
      password: item.password || '',
      encryptMethod: item.method || 'none',
      timeout: 60
    };
    if (item.method === 'none') {
      result.push({
        ...base,
        protocol: (item as MonoSubscriptionSSR).protocol || 'origin',
        protocolParam: (item as MonoSubscriptionSSR).protocol_param || '',
        obfs: (item as MonoSubscriptionSSR).obfs || '',
        obfsParam: (item as MonoSubscriptionSSR).obfs_param || '',
        type: 'ssr'
      });
    } else {
      result.push({
        ...base,
        type: 'ss',
      });
    }

  }

  return result;
}

/**
 * [fsChmod ???????????????????????????????????????]
 * @param  {[String]} dir   [?????????]
 * @param  {[int]} opstr [????????????????????????0o711]
 */
export const chmod = (target: string, opstr: number) => {
  if (fs.statSync(target).isDirectory()) {
    const files = fs.readdirSync(target);
    if (files.length) {
      files.forEach((file) => {
        chmod(path.join(target, file), opstr);
      });
    }
  } else {
    if (target && !target.includes('.gitignore')) {
      console.log(`fs.chmod => ${target} with ${opstr}`);
      fs.chmodSync(target, opstr);
    }
  }
}
