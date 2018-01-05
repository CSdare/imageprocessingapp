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

// this creates 7 web workers and dispatches them to calculate 29th through 49th fib numbers without cache

const createAndDispatchWorkers = () => {
  for (let i = 1; i <= 7; i++) {
    let webWorker = new Worker('/../workers/webWorker.js');
    webWorker.onmessage = e => console.log('from webWorker:', e.data);
    webWorker.onerror = err => console.log('webWorker error:', err);
    webWorker.postMessage(i + 28);
    webWorker.postMessage(i + 35);
    webWorker.postMessage(i + 42);
  }
}

// standard fib function without cache

const nthFib = num => {
  if (num === 0) return 0;
  if (num === 1) return 1;
  return nthFib(num - 1) + nthFib(num - 2);
}

// has main thread calculate fib numbers 29-49 without cache

const singleThreadFibonaccis = () => {
  for (let i = 29; i <= 49; i++) {
    console.log('single thread fib #' + i + ': ' + nthFib(i));
  }
}

// event handler for clicking switch button on DOM - switches whether Fibonacci calculation
// will be handled by single browser thread or web workers

document.getElementById('switch').addEventListener('click', () => {
  const switchButton = document.getElementById('switch');
  if (switchButton.className === 'singleThread') {
    switchButton.className = 'workerThread';
    switchButton.innerHTML = 'switch to single thread';
  } else {
    switchButton.className = 'singleThread';
    switchButton.innerHTML = 'switch to worker threads';
  }
});

// event handler for button that will run Fibonacci calculation

document.getElementById('fib').addEventListener('click', () => {
  const switchButton = document.getElementById('switch');
  switchButton.className === 'singleThread' ? singleThreadFibonaccis() : createAndDispatchWorkers();
});

