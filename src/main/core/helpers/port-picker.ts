import checkPortInUse from './port-checker';

/**
 * @name pickPorts 获取指定数量的可用端口
 * @param {Number} start 起始端口
 * @param {Number} count 获取数量
 * @param {Number[]} excludes 需要排除的端口
 */
 export default function pickPorts(start: number, count: number, excludes: number[] = []): Promise<number[]> {
  const ports: number[] = [];
  const checkingPorts: number[] = [];

  for (let i = start; checkingPorts.length < count; i++) {
    if (excludes.includes(i)) continue;
    checkingPorts.push(i);
  }

  return checkPortInUse(checkingPorts, '127.0.0.1')
    .then(results => {
      results.forEach((result, i) => {
        if (!result.isInUse) {
          ports.push(checkingPorts[i]);
        }
      });
      if (ports.length < count) {
        return pickPorts(
          (ports[ports.length - 1] || start) + 1,
          (count - ports.length),
          excludes
        ).then(newPorts => {
          return ports.concat(newPorts);
        });
      } else {
        return ports;
      }
    });
}
