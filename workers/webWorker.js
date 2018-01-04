onmessage = e => {
  console.log(e.data);
  e.data === 'correct' ? postMessage('sent correct message to webWorker') : postMessage('incorrect message to webWorker');
}