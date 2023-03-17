// Copyright 2021 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

'use strict';

globalThis.require = require;
globalThis.fs = require('fs');
globalThis.TextEncoder = require('util').TextEncoder;
globalThis.TextDecoder = require('util').TextDecoder;

globalThis.performance = {
  now() {
    const [sec, nsec] = process.hrtime();
    return sec * 1000 + nsec / 1000000;
  },
};

const crypto = require('crypto');
const path = require('path');
globalThis.crypto = {
  getRandomValues(b) {
    crypto.randomFillSync(b);
  },
};

require(path.join(__dirname, './wasm_exec.js'));

const go = new Go();
go.argv = [];
go.env = Object.assign({ TMPDIR: require('os').tmpdir() }, process.env);
go.exit = (code) => {
  console.log(code, go.exited);
  if (code === 0 && !go.exited) {
    // deadlock, make Go print error and stack traces
    go._pendingEvent = { id: 0 };
    go._resume();
  }
};

export default async () => {
  await WebAssembly.instantiate(
    fs.readFileSync(path.join(__dirname, './main.wasm')),
    go.importObject,
  )
    .then((result) => {
      go.run(result.instance);
    })
    .catch((err) => {
      console.error(err);
    });
};
