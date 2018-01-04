import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import styles from './css/style.css';

render(<App />, document.getElementById('root'));


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/../workers/serviceWorker.js').then(reg => {
    if (reg.installing) {
      console.log('Service worker installing');
    } else if (reg.waiting) {
      console.log('Service worker is waiting')
    } else if (reg.active) {
      console.log('Service worker is active!')
    }
  }).catch(err => {
    console.log('Registration failed with error: ', err);
  });
}

// might need to wrap entire webWorker section in 'if (window.Worker)' block
const webWorker = new Worker('/../workers/webWorker.js');

webWorker.onmessage = e => console.log('message from webWorker: ', e.data);
webWorker.onerror = err => console.log('webWorker error: ', err);

webWorker.postMessage('wrong');
webWorker.postMessage('not');
webWorker.postMessage('ha');
webWorker.postMessage('correct');


console.log(webWorker);