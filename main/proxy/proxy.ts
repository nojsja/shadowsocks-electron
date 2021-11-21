import * as networksetup from "../helpers/networksetup";
import * as gsettings from "../helpers/gsettings";
import * as sysproxy from "../helpers/sysproxy";
import { startPacServer, stopPacServer } from "./pac";
import { generateFullPac } from "./pac";
import { Mode, ProxyStatus } from "../types/extention";
import { setupIfFirstRun } from "../install";

export class Proxy {
  mode: Mode;
  status: ProxyStatus;
  localPort: number;
  pacPort: number;
  platform: NodeJS.Platform;

  constructor(platform: NodeJS.Platform, localPort: number, pacPort: number, mode: Mode) {
    this.platform = platform;
    this.status = "off";
    this.localPort = localPort;
    this.pacPort = pacPort;
    this.mode = mode;
  }

  static createProxy(platform: NodeJS.Platform, localPort: number, pacPort: number, mode: Mode): Proxy {
    switch (platform) {
      case "darwin":
        return new DarwinProxy(localPort, pacPort, mode);
      case "win32":
        return new WinProxy(localPort, pacPort, mode);
      case "linux":
        return new LinuxProxy(localPort, pacPort, mode);
      default:
        return new Proxy(platform, localPort, pacPort, mode);
    }
  }

  public async start() {
  }

  public async stop() {
  }

  public async switch(mode: Mode) {
    this.mode = mode;
    await this.stop();
    await this.start();
  }
}

export class LinuxProxy extends Proxy {
  constructor(localPort: number, pacPort: number, mode: Mode) {
    super('linux', localPort, pacPort, mode);
  }

  public async start() {
    if (this.mode === "Global") {
      await gsettings.setGlobalProxy("127.0.0.1", this.localPort ?? 1080);
    } else if (this.mode === "PAC") {
      await setupIfFirstRun();
      await generateFullPac(this.localPort ?? 1080);
      await stopPacServer();
      startPacServer(this.pacPort ?? 1090);
      await gsettings.setPacProxy(
        `http://localhost:${this.pacPort ?? 1090}/proxy.pac`
      );
    }
  }

  public async stop() {
    await gsettings.unsetProxy();
    stopPacServer();
  }
}

export class WinProxy extends Proxy {
  constructor(localPort: number, pacPort: number, mode: Mode) {
    super('win32', localPort, pacPort, mode);
  }

  public async start() {
    if (this.mode === "Global") {
      await sysproxy.setGlobalProxy("127.0.0.1", this.localPort ?? 1080);
    } else if (this.mode === "PAC") {
      await setupIfFirstRun();
      await generateFullPac(this.localPort ?? 1095);
      await stopPacServer();
      startPacServer(this.pacPort ?? 1090);
      await sysproxy.setPacProxy(
        `http://localhost:${this.pacPort ?? 1090}/proxy.pac`
      );
    }
  }

  public async stop() {
    await sysproxy.unsetProxy();
    stopPacServer();
  }
}

export class DarwinProxy extends Proxy {
  constructor(localPort: number, pacPort: number, mode: Mode) {
    super('darwin', localPort, pacPort, mode);
  }

  public async start() {
    if (this.mode === "Global") {
      await networksetup.setGlobalProxy("127.0.0.1", this.localPort ?? 1080);
    } else if (this.mode === "PAC") {
      await setupIfFirstRun();
      await generateFullPac(this.localPort ?? 1080);
      await stopPacServer();
      startPacServer(this.pacPort ?? 1090);
      await networksetup.setPacProxy(
        `http://localhost:${this.pacPort ?? 1090}/proxy.pac`
      );
    }
  }

  public async stop() {
    await networksetup.unsetProxy();
    stopPacServer();
  }
}
