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
module.exports = function (
  content, // data from previous step
  { dispatch }
) {
  dispatch('notifycation', {
    message: content,
    type: 'success',
  });

  // pass data to next step
  return content;
};
