const root = document.getElementById("root");
const state = { items: [] };

async function refresh() {
  const res = await fetch("/api/state");
  const data = await res.json();
  state.items = data.items ?? [];
  root.textContent = state.items.join(", ") || "empty";
}

refresh();
export { refresh };
