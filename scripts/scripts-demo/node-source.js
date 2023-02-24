/**
 * API of Node Source Task
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
  const data = await fetch('https://nodejs.org/en/').then((res) => res.text());

  // pass data to next step
  return data.slice(0, 100);
};
