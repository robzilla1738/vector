document.querySelector('#run').onclick = () => {
  chrome.runtime.sendNativeMessage('dev.aux.test', {ping:'aux-dummy-only'}, response => {
    const error = chrome.runtime.lastError?.message;
    document.querySelector('#result').textContent = JSON.stringify({role:"allowed", error: error ?? null, response: response ?? null});
  });
};
