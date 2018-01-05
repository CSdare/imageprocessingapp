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

onmessage = e => {
  const message = nthFib(e.data);
  postMessage(`worker threads: Fib #${e.data} is ${message}`);
}