document.querySelector("#wake").onclick = async () => {
  const result = await chrome.runtime.sendMessage({ type: "wake", value: "Aux loopback" });
  document.querySelector("#result").textContent = JSON.stringify(result);
};
