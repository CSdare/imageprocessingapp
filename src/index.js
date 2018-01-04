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
