/**
 * API of Processor Pipe Task
 * {any} $content - data from previous step, if current task is in first place, it will be undefined.
 * {native} fs - filesystem (nodejs).
 * {native} http - HTTP server and client (nodejs).
 * {native} https - HTTPS server and client (nodejs).
 * {native} path - utilities for file and directory paths (nodejs).
 * {native} crypto - provides cryptographic functionality (nodejs).
 * {native} os - operating system information (nodejs).
 * {native} url - utilities for URL resolution and parsing (nodejs).
 * {native} net - creating TCP/IPC servers/clients an (nodejs).
 * {native} fetch - nodejs port fetch API of browser (external https://www.npmjs.com/package/node-fetch)
 * {native} app - app (electron https://www.electronjs.org/docs/latest/api/app)
 * {native} clipboard - clipboard (electron https://www.electronjs.org/docs/api/clipboard)
 */

async () => {
  console.log('>> processor task start...');

  // see API https://nodejs.org/docs/latest-v14.x/api/os.html.
  const header = `<---${os.hostname()}---`;
  const footer = `---${os.userInfo().username}--->`;

  console.log('>> processor task ended...');

  // pass data to next step
  return `${header}${$content}${footer}`;
};
