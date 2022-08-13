import { i18n } from "../../electron";
import { warning } from "../../logs";
import { Manager } from "../manager";
import checkPortInUse from "./port-checker";
import { Config, Settings } from "../../types/extention";

/**
  * Interceptor [拦截器函数]
  * @author nojsja
  */
export class Interceptor {

  env: { [key: string]: any };
  before: ((...args: any[]) => any) | null;
  after: ((...args: any[]) => any) | null;

  constructor(env: any) {
    this.env = env;
    this.before = null;
    this.after = null;
  }

  /**
   *
   * @param {Function} func [combine interceptors and main func, call them syncronously]
   * @param {Array} interceptors [interceptors]
   * @returns {Function} [combined function]
   */
  static useSync = (
    func: (...args: any[]) => any,
    interceptors: Interceptor[] = [],
    failed?: (...args: any[]) => any
  ) => {

    return async function (this: any, ...args: any[]): Promise<ReturnType<typeof func>> {
      let response: any;

      try {
        interceptors.forEach(interceptor => {
          if (interceptor.before) {
            interceptor.before.apply(this, args);
          }
        });

        response = func.apply(this, args);

        interceptors.forEach(interceptor => {
          if (interceptor.after) {
            interceptor.after.apply(this, args);
          }
        });
      } catch (error) {
        console.log(error);
        failed && failed.apply(this, args);
        return Promise.resolve({
          code: 600,
          result: error && (error as Error).toString()
        });
      }
      return response;
    }
  }

  /**
   *
   * @param {Function} func [combine interceptors and main func, call them on by one asyncronously]
   * @param {Array} interceptors [interceptors]
   * @returns {Function} [combined function]
   */
   static useAsyncSeries = (
    func: (...args: any[]) => any,
    interceptors: Interceptor[] = [],
    failed?: (...args: any[]) => any
  ) => {

    return async function (this: any, ...args: any[]): Promise<ReturnType<typeof func>> {
      let response: any;

      try {
        await interceptors.reduce(async (memo, interceptor) => {
          await memo;
          if (interceptor.before) {
            await interceptor.before.apply(this, args);
          }
        }, Promise.resolve());

        response = await func.apply(this, args);

        await interceptors.reduce(async (memo, interceptor) => {
          await memo;
          if (interceptor.after) {
            await interceptor.after.apply(this, args);
          }
        }, Promise.resolve());
      } catch (error) {
        console.log(error);
        failed && failed.apply(this, args);
        return Promise.resolve({
          code: 600,
          result: error && (error as Error).toString()
        });
      }
      return response;
    }
  }

  /**
   *
   * @param {Function} func [combine interceptors and main func, call them asyncronously in parallel]
   * @param {Array} interceptors [interceptors]
   * @returns {Function} [combined function]
   */
   static useAsyncParallel = (
    func: (...args: any[]) => any,
    interceptors: Interceptor[] = [],
    failed?: (...args: any[]) => any
  ) => {

    return async function (this: any, ...args: any[]): Promise<ReturnType<typeof func>> {
      let response: any;

      try {
        await Promise.all(
          interceptors.map(async (interceptor) => {
            if (interceptor.before) {
              await interceptor.before.apply(this, args);
            }
          })
        )

        response = await func.apply(this, args);

        await Promise.all(interceptors.map(async (interceptor) => {
          if (interceptor.after) {
            await interceptor.after.apply(this, args);
          }
        }));
      } catch (error) {
        console.log(error);
        failed && failed.apply(this, args);
        return Promise.resolve({
          code: 600,
          result: error && (error as Error).toString()
        });
      }
      return response;
    }
  }
}

/**
  * StartClusterInterceptor [cluster interceptor on start]
  * @author nojsja
  */
 export class StartClusterInterceptor extends Interceptor {

  constructor(env?: any) {
    super(env);
  }

  before = async (config: Config, settings: Settings) => {
    await Manager.changeMode('cluster');
    const results = await checkPortInUse([settings.localPort], '127.0.0.1');
    if (results[0]?.isInUse) {
      warning(`Port ${settings.localPort} is in use`);
      throw new Error(`${i18n.__('port_already_in_use')} ${settings.localPort}`);
    }
    await Manager.disableProxy();
    await Manager.enableProxy(settings);
  }
}

/**
  * StopClusterInterceptor [cluster interceptor on stop]
  * @author nojsja
  */
export class StopClusterInterceptor extends Interceptor {

  constructor(env?: any) {
    super(env);
  }
}


/**
  * StartClientInterceptor [client interceptor on start]
  * @author nojsja
  */
export class StartClientInterceptor extends Interceptor {

  constructor(env?: any) {
    super(env);
  }

  before = async (config: Config, settings: Settings) => {
    await Manager.changeMode('single');
    const results = await checkPortInUse([settings.localPort], '127.0.0.1');
    if (results[0]?.isInUse) {
      warning(`Port ${settings.localPort} is in use`);
      throw new Error(`${i18n.__('port_already_in_use')} ${settings.localPort}`);
    }
    await Manager.disableProxy();
    await Manager.enableProxy(settings);
  }

  after = () => {
    console.log('StartClusterInterceptor: after');
  }
}

/**
  * StopClientInterceptor [client interceptor on stop]
  * @author nojsja
  */
export class StopClientInterceptor extends Interceptor {

  constructor(env?: any) {
    super(env);
  }
}
