import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import pie from 'puppeteer-in-electron2';
import puppeteer, { Browser } from 'puppeteer-core';
import { clipboard } from 'electron';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import url from 'url';
import net from 'net';
import fetch from 'node-fetch';

import { type WorkflowTaskType } from './types';

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
export const dispatch = (action: string, args: unknown) => {
  (global as any).win.webContents.send('event:stream', {
    action,
    args,
  });
};
const commonContext = {
  fs,
  http,
  https,
  path,
  crypto,
  os,
  url,
  net,
  fetch,
  app,
  clipboard,
  setTimeout,
  setInterval,
  Buffer,
};

export class WorkflowBridge {
  constructor() {
    this.context = null;
    this.browser = null;
    this.dispatch = dispatch;
  }

  context: { [key: string]: unknown } | null;
  browser: Browser | null;
  dispatch: (action: string, args: unknown) => void;

  async init() {
    // FIXME: types error
    this.browser = await pie.connect(app, puppeteer as any) as any;
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
          await new Promise((resolve, reject) => {
            window.once('ready-to-show', () => {
              resolve(null);
            });
            window.once('closed', () => {
              reject(new Error('Puppeteer Window closed abnormally!'));
            });
          });
          await window.loadURL(url);
          // FIXME: types error
          const page = await pie.getPage(this.browser as any, window);
          const closeBrowser = () => {
            try {
              window.close();
            } catch (error) {
              console.error(error);
            }
          };

          return [page, closeBrowser];
        },
        ...commonContext,
      },
      /* crawler - Use [web crawler] to produce data. */
      'crawler-source': {
        loadCrawler: () => require('crawler'),
        ...commonContext,
      },
      /* node - Use nodejs script to produce data, such as read file, request http, etc. */
      'node-source': {
        ...commonContext,
      },
      /* processor - Use nodejs middle handler to process data, such as filter, sort, error wrapper, etc. */
      'processor-pipe': {
        ...commonContext,
      },
      /* effect - produce some UI effects, such as notifycation. */
      'effect-pipe': {
        dispatch,
        ...commonContext,
      },
    };
  }

  loadContext(type: WorkflowTaskType) {
    return this.context?.[type];
  }
}