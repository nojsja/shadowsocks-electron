import { execAsync } from "../../utils/utils";
import { ignoredHosts } from "./config";

const listNetworkServices = async () => {
  const result = await execAsync("networksetup -listallnetworkservices");
  if (result.code === 0 && result.stdout) {
    const r = result.stdout.split("\n");
    r.shift();
    return r;
  } else {
    return null;
  }
};

export const unsetProxy = async () => {
  const services = await listNetworkServices();
  if (!services) {
    return false;
  }

  const results = await Promise.all(
    services.map(async service => {
      const globalUnset = await execAsync(
        `networksetup -setsocksfirewallproxystate '${service}' off`
      );
      const pacUnset = await execAsync(
        `networksetup -setautoproxystate '${service}' off`
      );
      return globalUnset.code === 0 && pacUnset.code === 0;
    })
  );

  return results.filter(i => i === true).length > 0;
};

export const setPacProxy = async (url: string) => {
  const services = await listNetworkServices();
  if (!services) {
    return false;
  }

  const results = await Promise.all(
    services.map(async service => {
      const autoSet = await execAsync(
        `networksetup -setautoproxystate '${service}' on`
      );
      const urlSet = await execAsync(
        `networksetup -setautoproxyurl '${service}' '${url}'`
      );
      return autoSet.code === 0 && urlSet.code === 0;
    })
  );

  return results.filter(i => i === true).length > 0;
};

export const setGlobalProxy = async (host: string, port: number) => {
  const services = await listNetworkServices();
  if (!services) {
    return false;
  }

  const results = await Promise.all(
    services.map(async service => {
      const autoSet = await execAsync(
        `networksetup -setsocksfirewallproxystate '${service}' on`
      );
      const urlSet = await execAsync(
        `networksetup -setsocksfirewallproxy '${service}' '${host}' ${port}`
      );
      const bypassSet = await execAsync(
        `networksetup -setproxybypassdomains '${service}' '${ignoredHosts}'`
      );
      return autoSet.code === 0 && urlSet.code === 0 && bypassSet.code === 0;
    })
  );

  return results.filter(i => i === true).length > 0;
};
