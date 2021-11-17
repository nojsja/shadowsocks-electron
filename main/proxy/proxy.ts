import os from "os";

import * as networksetup from "../helpers/networksetup";
import * as gsettings from "../helpers/gsettings";
import * as sysproxy from "../helpers/sysproxy";
import { startPacServer, stopPacServer } from "./pac";
import { generateFullPac } from "./pac";
import { Mode } from "../types/extention";
import { setupIfFirstRun } from "../install";

const platform = os.platform();

export const setProxy = async (
  status: "on" | "off",
  mode?: Mode,
  localPort?: number,
  pacPort?: number
) => {
  if (mode === "Manual") {
    return;
  }

  switch (platform) {
    case "darwin":
      if (status === "off") {
        await networksetup.unsetProxy();
        stopPacServer();
      } else if (mode === "Global") {
        await networksetup.setGlobalProxy("127.0.0.1", localPort ?? 1080);
      } else if (mode === "PAC") {
        await setupIfFirstRun();
        await generateFullPac(localPort ?? 1080);
        await stopPacServer();
        startPacServer(pacPort ?? 1090);
        await networksetup.setPacProxy(
          `http://localhost:${pacPort ?? 1090}/proxy.pac`
        );
      }
      break;
    case "linux":
      if (status === "off") {
        await gsettings.unsetProxy();
        stopPacServer();
      } else if (mode === "Global") {
        await gsettings.setGlobalProxy("127.0.0.1", localPort ?? 1080);
      } else if (mode === "PAC") {
        await setupIfFirstRun();
        await generateFullPac(localPort ?? 1080);
        await stopPacServer();
        startPacServer(pacPort ?? 1090);
        await gsettings.setPacProxy(
          `http://localhost:${pacPort ?? 1090}/proxy.pac`
        );
      }
      break;
    case "win32":
      if (status === "off") {
        await sysproxy.unsetProxy();
        stopPacServer();
      } else if (mode === "Global") {
        await sysproxy.setGlobalProxy("127.0.0.1", localPort ?? 1080);
      } else if (mode === "PAC") {
        await setupIfFirstRun();
        await generateFullPac(localPort ?? 1080);
        await stopPacServer();
        startPacServer(pacPort ?? 1090);
        await sysproxy.setPacProxy(
          `http://localhost:${pacPort ?? 1090}/proxy.pac`
        );
      }
      break;
  }
};
