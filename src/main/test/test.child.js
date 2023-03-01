const { ProcessHost } = require('electron-re');

  let count = 0;
  const timer = setInterval(() => {
    console.log('test data for child process console');
    if (count++ > 100) clearInterval(timer);
  }, 1e3);

  ProcessHost
    .registry('test1', (params) => {
      setTimeout(() => {
        console.log('received: test1', params);
      }, 3e3);
      return {...params, id: process.pid};
    })
    .registry('test2', (params) => {
      return {...params, id: process.pid};
    })
    .registry('test3', (params) => {
      return {...params, id: process.pid};
    })
    .registry('test4', (params) => {
      return {...params, id: process.pid};
    })
    .registry('test5', (params) => {
      return {...params, id: process.pid};
    })
    .registry('test6', (params) => {
      return {...params, id: process.pid};
    });
