import beforeReady from "./beforeReady";
import afterReady from "./afterReady";
import ready from "./ready";
import beforeQuit from "./beforeQuit";
import { ElectronApp } from "../app";

export default (electronApp: ElectronApp) => {
  beforeReady(electronApp);
  ready(electronApp);
  afterReady(electronApp);
  beforeQuit(electronApp);
}
