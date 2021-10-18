const net = require('net');

type pingOptions = {
  host: string,
  port: number,
  count?: number,
  timeout?: number
};

type pingResult = {
  max: number,
  min: number,
  ave: number,
  failed: number
};

type connectResult = {
  error: Error | null,
  delay: number
};

const tcpPing = (options: pingOptions): Promise<[pingResult, connectResult[]]> => {
  const results: connectResult[] = [];
  const result: pingResult = {
    max: 0, min: 0, ave: 0, failed: 0
  };

  const count = options.count ?? 8;

  return new Promise(resolve => {
    const callback = (error: Error | null, delay: number) => {
      results.push({
        error, delay
      });

      if (results.length === count) {
        results.forEach((item, index) => {
          if (item.error) {
            result.failed += 1
          } else {
            result.ave += item.delay;
            if (item.delay > result.max) result.max = item.delay;
            if (item.delay < result.min || result.min === 0) result.min = item.delay;
          }

          if (index === count - 1) {
            result.ave = result.ave / (count - result.failed);
            resolve([result, results]);
          }

        });
      }
    };

    new Array(count).fill(0).forEach((_, i) => {
      setTimeout(() => {
        tcpConnect(options, callback)
      }, i * 100);
    });
  });

};

const tcpConnect = (options: pingOptions, callback: (error: Error | null, delay: number) => void) => {
  const startTime = process.hrtime();
  let timer: NodeJS.Timeout;
  let isEnd = false;

  const client = net.createConnection({ host: options.host, port: options.port }, () => {
    isEnd = true;
    clearTimeout(timer);
    client.end();
    callback(null, Math.round(process.hrtime(startTime)[1] / 1e6))
  });
  timer = setTimeout(() => {
    client.end();
    callback(new Error('Timeout'), 0)
  }, options.timeout ?? 500);
  client.on('data', () => {
    client.end();
  });
  client.on('error', (err: Error) => {
    if (!isEnd) {
      callback(err, 0);
    }
  });
  client.on('end', () => {
    isEnd = true;
    console.log('disconnected from server');
  });
};

export default tcpPing;
