const { Notification } = require('electron');
const  { MessageChannel } = require('electron-re');

MessageChannel.handle('test:notify', () => {

  new Notification({
    title: 'shadowsocks-electron',
    subtitle: '',
    body: 'electron-re service test',
    urgency: 'normal'
  }).show();

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
