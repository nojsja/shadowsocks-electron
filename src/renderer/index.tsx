import React from 'react';
import { render } from 'react-dom';

import 'typeface-roboto';
import './index.css';

let App;
const rootDOMNode = document.getElementById("root");
function renderRoot() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  App = require('./App.tsx').default; // we have to re-require this every time it changes otherwise we are rendering the same old app.
  render(<App/>, rootDOMNode);
}
renderRoot();

if (module.hot) {
  module.hot.accept('./App.tsx', () => {
    console.log('Accepting the updated module');
    renderRoot();
  });
}
