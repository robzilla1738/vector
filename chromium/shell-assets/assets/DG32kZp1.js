function s(n){const r=new Set;return[...n].sort((e,t)=>t.createdAt-e.createdAt).filter(e=>{const t=e.config?.chatId??e.runId;return r.has(t)?!1:(r.add(t),!0)})}export{s as r};
