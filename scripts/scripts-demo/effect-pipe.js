/**
 * API of Effect Pipe Task
 * {any} $content - data from previous step, if current task is in first place, it will be undefined.
 * {function} dispatch - used to trigger event, view details below (build-in).
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

/**
 * @name dispatch [trigger event provided by client]
 * @param {string} action [check demos below]
 * @param {any} args [unknown]
 * @returns void
 * @example
 * * demo1: connect client to server
 * > dispatch('reconnect-server');
 * * demo2-1: add server (ss/ssr) to client
 * > dispatch('add-server', 'ss(r)://xxx');
 * * demo2-2: add server group to client
 * > dispatch('add-server-group', { name: 'xxx', text: ['ss(r)://xxx'] });
 * * demo2-3: update server group of client
 * > dispatch('update-server-group', { name: 'xxx', text: ['ss(r)://xxx'] });
 * * demo3: disconnect client from server
 * > dispatch('disconnect-server');
 * * demo4: send notifycation
 * > dispatch('notifycation', {
 *     message: 'xxx',
 *     type: 'default', // type - 'default' | 'error' | 'success' | 'warning' | 'info'
 *   });
 */
async () => {
  dispatch('notifycation', {
    message: $content,
    type: 'success',
  });

  // pass data to next step
  return $content;
};
