import os from 'os';
import path from 'path';
import fs from 'fs';

export async function startProfiler(name: string, port: number) {
  // 监测对应端口
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const profiler = require('v8-inspect-profiler');
  const profiling = await profiler.startProfiling({port});
  // 返回 stop 方法，以便停止监测
  return {
      async stop() {
          const profile = await profiling.stop();
          const prefix = path.join(os.homedir(), 'prof-test');
          console.log(`${prefix}.${name}.cpuprofile`);
          // 输出性能文件
          await fs.writeFile(`${prefix}.${name}.cpuprofile`, JSON.stringify(profile.profile), (err) => {
            if (err) console.error(err);
          });
      }
  };
}
