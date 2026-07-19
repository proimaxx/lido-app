let intervalId = null;
self.onmessage = function(e) {
  if (e.data === "start") {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => { self.postMessage("tick"); }, 2000);
  } else if (e.data === "stop") {
    if (intervalId) clearInterval(intervalId);
  }
};
