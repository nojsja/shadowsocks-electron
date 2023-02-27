import { execAsync } from '../utils';
import { IGNORE_HOSTS } from '../config';

export const unsetProxy = async () => {
  const result = await execAsync(
    "gsettings set org.gnome.system.proxy mode none"
  );
  return result.code === 0;
};

export const setPacProxy = async (url: string) => {
  const autoSet = await execAsync(
    "gsettings set org.gnome.system.proxy mode auto"
  );
  const urlSet = await execAsync(
    `gsettings set org.gnome.system.proxy autoconfig-url '${url}'`
  );
  return autoSet.code === 0 && urlSet.code === 0;
};

export const setGlobalProxy = async (host: string, port: number) => {
  const manualSet = await execAsync(
    "gsettings set org.gnome.system.proxy mode manual"
  );
  const hostSet = await execAsync(
    `gsettings set org.gnome.system.proxy.socks host '${host}'`
  );
  const portSet = await execAsync(
    `gsettings set org.gnome.system.proxy.socks port ${port}`
  );
  const bypassSet = await execAsync(
    `gsettings set org.gnome.system.proxy ignore-hosts "['${IGNORE_HOSTS}']"`
  );
  return (
    manualSet.code === 0 &&
    hostSet.code === 0 &&
    portSet.code === 0 &&
    bypassSet.code === 0
  );
};
