import path from 'path';
import fs, { PathLike } from 'fs';
import os from 'os';
import { exec, ExecOptions } from 'child_process';
import {
  Config, SSRConfig, SSConfig, SubscriptionResult,
  MonoSubscriptionSSR, SubscriptionParserConfig, OneOfConfig,
} from '../types';
import { archMap, getPathRuntime, pathExecutable } from '../config';
import { i18n } from '../electron';
import { ProxyURI } from '../core/helpers/proxy-url';
import { get } from './http-request';
import { screen } from 'electron';
import logger from '../logs';

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
  const fullpath = new Map();
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

export const getPluginsPath = (name='', useArch?: string) => {
  const arch = useArch || os.arch();
  if (archMap.has(arch)) {
    switch (os.platform()) {
      case 'linux':
        return getPathRuntime(`bin/linux/${archMap.get(arch)}/${name}`);
      case 'darwin':
        return getPathRuntime(`bin/darwin/${archMap.get(arch)}/${name}`);
      case 'win32':
          return getPathRuntime(`bin/win32/${archMap.get(arch)}/${name ? `${name}.exe` : ''}`);
      default:
        return name;
    }
  } else {
    return name;
  }
}

/**
 * getExecutableFilePath
 * @param name fileName
 * @returns filePath
 */
export const getExecutableFilePath = (name: string, useArch?: string) => {
  const arch = useArch || os.arch();
  if (archMap.has(arch)) {
    switch (os.platform()) {
      case 'linux':
        return path.join(pathExecutable, `bin/linux/${archMap.get(arch)}/${name}`);
      case 'darwin':
        return path.join(pathExecutable, `bin/darwin/${archMap.get(arch)}/${name}`);
      case 'win32':
        return path.join(pathExecutable, `bin/win32/${archMap.get(arch)}/${name ? `${name}.exe` : ''}`);
      default:
        return name;
    }
  } else {
    return name;
  }
};

/**
 * copyFileToPluginDir
 * @param name Plugin Name
 * @param srcFile Plugin File Path
 */
export const copyFileToPluginDir = (name: string, srcFile: PathLike) => {
  fs.copyFile(srcFile, getPluginsPath(name), (err) => {
    if (err) {
      logger.error(err);
    }
  });
};

export const getSSLocalBinPath = (type: 'ss' | 'ssr', useArch?: string) => {
  const binName = `${type}-local`;
  const arch = useArch || os.arch();
  if (archMap.has(arch)) {
    switch (os.platform()) {
      case 'linux':
        return getPathRuntime(`bin/linux/${archMap.get(arch)}/${binName}`);
      case 'darwin':
        return getPathRuntime(`bin/darwin/${archMap.get(arch)}/${binName}`);
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
  }
  return '';
}

/**
  * checkEnvFiles [检查环境文件是否存在]
  * @author nojsja
  * @return {[type]} param [desc]
  */
 export const checkEnvFiles = (args: {_path: string, isDir: boolean, checkEmpty?: boolean, exec?: () => void}[]): void => {
  const check = function (params: {_path: string, isDir: boolean, checkEmpty?: boolean, exec?: () => void}) {
    if (!fs.existsSync(params._path)) {
      if (params.isDir) {
        fs.mkdirSync(params._path);
      } else {
        fs.closeSync(fs.openSync(params._path, 'w'));
      }
      params.exec && params.exec();
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

export const copyFileAsync = (src: string, dest: string) => {
  const readStream = fs.createReadStream(src);
  const writeStream = fs.createWriteStream(dest);
  readStream.pipe(writeStream);
}

export const copyFile = (srcFile: string, destFile: string) => {
  try {
    fs.writeFileSync(destFile, fs.readFileSync(srcFile));
  } catch (error) {
    console.error(error);
  }
}

/*
 * 同步复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
export const copyDir = (src: string, dist: string, callback?: (params: any) => void) => {
  let paths, stat;
  if(!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
  }

  function _copy(src: string, dist: string) {
    paths = fs.readdirSync(src);
    paths.forEach(function(_path) {
        const _src = path.join(src, _path);
        const _dist = path.join(dist, _path);
        stat = fs.statSync(_src);
        // 判断是文件还是目录
        if(stat.isFile()) {
          copyFile(_src, _dist);
        } else if(stat.isDirectory()) {
          // 当是目录是，递归复制
          copyDir(_src, _dist, callback)
        }
    })
  }

  try {
    _copy(src, dist);
  } catch (error) {
    console.error(error);
  }
}

/*
 * 异步复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
export const copyDirAsync = (src: string, dist: string, callback?: (params: any) => void) => {
  fs.access(dist, function(err){
    if(err){
      // 目录不存在时创建目录
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
            const _src = src + '/' +path;
            const _dist = dist + '/' +path;
            fs.stat(_src, function(err, stat) {
              if(err){
                callback && callback(err);
              } else {
                // 判断是文件还是目录
                if(stat.isFile()) {
                  fs.writeFileSync(_dist, fs.readFileSync(_src));
                } else if(stat.isDirectory()) {
                  // 当是目录是，递归复制
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
  return new Promise((resolve) => {
    const hostnameReg = /^(?:http:\/\/|https:\/\/)?(?:www.)?([\w.]+)?\/(.*)/;
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
}

/* 泡芙云 paofusub 订阅解析 */
export function paofuSubscriptionParser(res: { result: string }): OneOfConfig[] {
  if (!((typeof res.result) === 'string')) return [];

  const serversBase64 = Buffer.from(res.result, 'base64').toString();

  return parseUrl(serversBase64);
}

/* mono cloud 订阅解析 */
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
 * [fsChmod 对文件和文件夹递归授予权限]
 * @param  {[String]} dir   [文件夹]
 * @param  {[int]} opstr [八进制数字，例如0o711]
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

/**
 * @name getPerfectDevicePixelRatioImage 生成适配屏幕缩放比的图片路径
 * @param { string } imageFullPath 图片的完整路径
 * @param { number[] } availableRatio 可用的缩放比例
 * @param { boolean } pixelFixedUp 当屏幕缩放比为小数时是否强制向上取整
 * @returns { string } 适配了屏幕最最佳缩放比例的的图片路径
 */
export const getPerfectDevicePixelRatioImage = (
  imageFullPath: string,
  availableRatio: number[] = [1],
  pixelFixedUp = true
) => {
  const { scaleFactor } = screen.getPrimaryDisplay();
  const scaleFactorInteger = pixelFixedUp ? Math.round(scaleFactor) : Math.floor(scaleFactor);
  const imageName = path.normalize(imageFullPath).split(path.sep).pop() ?? imageFullPath;
  const imageExt = path.extname(imageName);
  const imageBase = path.basename(imageFullPath, imageExt);
  const availableRatioSorted = pixelFixedUp ? availableRatio.sort() : availableRatio.sort().reverse();

  const perfectFactor = availableRatioSorted.find(
    (factor) => (factor === scaleFactor || factor === scaleFactorInteger)
  ) || availableRatio[0];

  if (perfectFactor === 1) return imageFullPath;

  return imageFullPath.replace(imageName, `${imageBase}@${perfectFactor}x${imageExt}`);
};

/**
 * @name dateToCronTable [transform date to cron table]
 * @param { object } schedule
 * @param { number } schedule.seconds
 * @param { number } schedule.minutes
 * @param { number } schedule.hours
 * @param { number } schedule.date
 * @param { number } schedule.month
 * @param { number } schedule.day
 * @returns { string } cron table
 * @example
 * dateToCronTable({ seconds: 0, minutes: 0, hours: 0, date: 1, month: 1, day: 1 })
 * => '0 0 0 1 1 1'
 * */
export function dateToCronTable(date: {
  seconds?: number;
  minutes?: number;
  hours?: number;
  date?: number;
  month?: number;
  day?: number;
}) {
  return `${date.seconds ?? ''} ${date.minutes ?? '*'} ${date.hours ?? '*'} ${date.date ?? '*'} ${date.month ?? '*'} ${date.day ?? '*'}`.trim();
}
