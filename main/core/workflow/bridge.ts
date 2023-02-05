import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import pie from 'puppeteer-in-electron';
import puppeteer, { Browser } from 'puppeteer-core';
import { clipboard } from 'electron';
import http from 'http';
import fs from 'fs';
import path from 'path';
import https from 'https';

import { type WorkflowTaskType } from './types';

const commonBridgeAttrs = {
  http,
  https,
  fs,
  clipboard,
  path,
};

/**
  * @name dispatch [trigger event to renderer process]
  * @param action reconnect-server | add-server | disconnect-server | notifycation
  * @param args unknown
  * @returns void
  * @example
  * * demo1: connect client to server
  * > dispatch('reconnect-server');
  * * demo2-1: add server (ss/ssr) to client
  * > dispatch('add-server', 'ss(r)://xxx');
  * * demo2-2: add server group to client
  * > dispatch('add-server-group', { name: 'xxx', text: ['ss(r)://xxx'] } });
  * * demo2-3: update server group of client
  * > dispatch('update-server-group', { name: 'xxx', text: ['ss(r)://xxx'] } });
  * * demo3: disconnect client from server
  * > dispatch('disconnect-server');
  * * demo4: send notifycation
  * > dispatch('notifycation', {
  *     message: 'xxx',
  *     type: 'default', // type - 'default' | 'error' | 'success' | 'warning' | 'info'
  *   });
  */
const dispatch = (action: string, args: unknown) => {
  (global as any).win.webContents.send('event:stream', {
    action,
    args,
  });
};

export class WorkflowBridge {
  constructor() {
    this.context = null;
    this.browser = null;
  }

  context: { [key: string]: unknown } | null;
  browser: Browser | null;

  async init() {
    await pie.initialize(app);
    this.browser = await pie.connect(app, puppeteer as any);
    this.context = {
      /* puppeteer - Use [headless browser] to produce data. */
      'puppeteer-source': {
        /**
         * @name loadBrowserPage
         * @param url [page url]
         * @param options [options to create electron window]
         * @returns [Puppeteer page instance]
         */
        loadBrowserPage: async (url: string, options: BrowserWindowConstructorOptions) => {
          const window = new BrowserWindow(options);
          await window.loadURL(url);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const page = await pie.getPage(this.browser!, window);
          const closeBrowser = () => {
            window.destroy();
          };

          return [page, closeBrowser];
        },
        ...commonBridgeAttrs,
      },
      /* crawler - Use [web crawler] to produce data. */
      'crawler-source': {
        loadCrawler: () => require('crawler'),
        ...commonBridgeAttrs,
      },
      /* node - Use nodejs script to produce data, such as read file, request http, etc. */
      'node-source': {
        ...commonBridgeAttrs,
      },
      /* processor - Use nodejs middle handler to process data, such as filter, sort, error wrapper, etc. */
      'processor-pipe': {},
      /* effect - produce some UI effects, such as notifycation. */
      'effect-pipe': {
        dispatch,
      },
    }
  }

  loadContext(type: WorkflowTaskType) {
    return this.context?.[type];
  }
}