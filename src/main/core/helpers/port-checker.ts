import net from 'net';

interface SocketConnectReturn {
  isInUse: boolean;
  error: string | null;
}

const socketConnect = (port: number, host: string, timeout = 1e3) => new Promise<SocketConnectReturn>(resolve => {
  const socket = new net.Socket();
  const status = '';
  let isInUse = false;

  socket.setTimeout(timeout)

  socket.on('timeout', () => {
    socket.destroy();
  });
  socket.on('error', () => {
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

export default (
  ports: number[], host: string, timeout?: number
) => {
  return Promise.all(
    ports.map(port => socketConnect(port, host, timeout))
  );
};
