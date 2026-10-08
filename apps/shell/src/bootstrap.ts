import { listenFirstFrame } from "./first-frame";

listenFirstFrame();
void import("./main").catch(() => {
  const status = document.createElement("p");
  status.setAttribute("role", "alert");
  status.textContent =
    "Aux couldn’t load its browser interface. Copy your text before reloading; reload clears this field. ";
  const retry = document.createElement("button");
  retry.textContent = "Reload";
  retry.onclick = () => location.reload();
  status.append(retry);
  document.getElementById("first-frame")?.append(status);
});
