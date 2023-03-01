import { AppEvent } from '@main/event';

import beforeReady from './beforeReady';
import afterReady from './afterReady';
import ready from './ready';
import beforeQuit from './beforeQuit';

export default (electronApp: AppEvent) => {
  beforeReady(electronApp);
  ready(electronApp);
  afterReady(electronApp);
  beforeQuit(electronApp);
}
