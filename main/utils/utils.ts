import path from 'path';
import fs from 'fs';
import os from 'os';
import { exec, ExecOptions } from "child_process";
import { Config } from '../types/extention';
import { getPathRuntime } from '../electron';

const archMap = new Map([
  ['aarch64', 'arm64'],
  ['x86', 'ia32'],
  ['x64', 'x64'],
  ['ia32', 'ia32'],
  ['arm64', 'arm64']
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
        return getBinPath(binName) || getPathRuntime(`bin/linux/${archMap.get(arch)}/${binName}`);
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
  * checkEnvFiles [检查环境文件是否存在]
  * @author nojsja
  * @return {[type]} param [desc]
  */
 export const checkEnvFiles = (args: {_path: string, isDir: boolean, exec?: () => void}[]): void => {
  const check = function (params: {_path: string, isDir: boolean, exec?: () => void}) {
    if (!fs.existsSync(params._path)) {
      if (params.isDir) {
        fs.mkdirSync(params._path);
        params.exec && params.exec();
      } else {
        fs.closeSync(fs.openSync(params._path, 'w'));
      }
    }
  };

  args.forEach(check);
};

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

  _copy(src, dist);

  function _copy(src: string, dist: string) {
    paths = fs.readdirSync(src);
    paths.forEach(function(_path) {
        let _src = path.join(src, _path);
        let _dist = path.join(dist, _path);
        stat = fs.statSync(_src);
        // 判断是文件还是目录
        if(stat.isFile()) {
          fs.writeFileSync(_dist, fs.readFileSync(_src));
        } else if(stat.isDirectory()) {
          // 当是目录是，递归复制
          copyDir(_src, _dist, callback)
        }
    })
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
            var _src = src + '/' +path;
            var _dist = dist + '/' +path;
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
