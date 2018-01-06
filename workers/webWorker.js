// version of fibonacci using storage
/*
const storage = {};

const nthFib = num => {
  if (num === 0) return 0;
  if (num === 1) return 1;
  if (num in storage) return storage[num];
  else {
    let answer = nthFib(num - 1) + nthFib(num - 2);
    storage[num] = answer;
    return answer;
  }
}
*/
// version of Fib without storage - makes for longer run time

const nthFib = num => {
  if (num === 0) return 0;
  if (num === 1) return 1;
  return nthFib(num - 1) + nthFib(num - 2);
}

// sends fibonacci answer back to index.js
// NOTE - attempted to send callback in as part of postMessage, but unable to send functions 
// with postMessage API because they are non-serializable

onmessage = e => {
  const callback = nthFib;
  const args = e.data.arguments;
  const output = callback(...args);
  postMessage(`worker threads:\ninput: ${args}\noutput:${output}`);
}