module.exports = function (
  content,
  {
    /**
     * @name dispatch [trigger event to renderer process]
     * @param action reconnect-server | add-server | disconnect-server | notifycation
     * @param args unknown
     * @returns void
     * @example
     * * demo1: connect client to server
     * > dispatch('reconnect-server');
     * * demo2-1: add ss(r) server to client
     * > dispatch('add-server', 'ss(r)://xxx');
     * * demo3: disconnect client from server
     * > dispatch('disconnect-server');
     * * demo4: send notifycation
     * > dispatch('notifycation', {
     *     message: 'xxx',
     *     type: 'default', // type - 'default' | 'error' | 'success' | 'warning' | 'info'
     *   });
     */
    dispatch,
  }
) {
  dispatch('notifycation', {
    message: content,
    type: 'success',
  });
};
