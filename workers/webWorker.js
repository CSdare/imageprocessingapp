onmessage = e => {
  e.data === 'correct' ? postMessage('sent correct message to webWorker: ' + e.data) : postMessage('incorrect message to webWorker: ' + e.data);
}