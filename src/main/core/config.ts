import { platform as _platform } from 'os';

const platform = _platform();

export const IGNORE_HOSTS =
  'FE80::/64, 127.0.0.1/8, ::1, FD00::/8, 192.168.0.0/16, 10.0.0.0/8, localhost';

export const IGNORE_HOSTS_WIN = 'localhost;127.*;10.*;172.16.*;172.17.*;172.18.*;172.19.*;172.20.*;172.21.*;172.22.*;172.23.*;172.24.*;172.25.*;172.26.*;172.27.*;172.28.*;172.29.*;172.30.*;172.31.*;192.168.*';

export const isMacOS = platform === 'darwin';
export const isWindows = platform === 'win32';
export const isLinux = platform === 'linux';
