import net from 'net';

const { Socket } = net;

type ReturnType = {
  isInUse: boolean,
  error: string | null
};

const socketConnect = (port: number, host: string, timeout: number = 1e3): Promise<ReturnType> => {
  return new Promise(resolve => {
    const socket = new Socket();
    let status = '';
    let isInUse = false;

    socket.setTimeout(timeout)
    socket.on('timeout', () => {
      socket.destroy();
    });
    socket.on('error', (err: { code: string }) => {
      // console.log(err);
      // if (err.code !== 'ECONNREFUSED') {
      //   status = err.toString();
      // } else {
      //   isInUse = true;
      // }
      isInUse = false;
    });

    socket.on('connect', function () {
      isInUse = true;
      socket.destroy();
    });

    socket.on('close', () => {
      if (status) {
        resolve({
          isInUse,
          error: status
        });
      } else {
        resolve({
          isInUse,
          error: null
        });
      }
    });

    socket.connect({
      port,
      host
    });
  });
}

const checkPortInUse = (
  ports: number[], host: string, timeout?: number
): Promise<ReturnType[]> => {
  return Promise.all(
    ports.map(port => socketConnect(port, host, timeout))
  );
};

export default checkPortInUse;
