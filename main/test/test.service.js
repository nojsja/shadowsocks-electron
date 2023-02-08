const  { MessageChannel } = require('electron-re');

MessageChannel.handle('test:notify', () => {

  // dialog.showMessageBox({
  //   type: 'info',
  //   buttons: ['OK'],
  //   message: 'test',
  //   detail: 'aa'
  // });

  return Promise.resolve({
    code: 200,
  });
});
