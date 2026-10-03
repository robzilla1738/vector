import{u as s}from"./App-D1KN4d2t.js";function d(t){s.setState(n=>{const o=new Set(n.runs.map(r=>r.runId)),e=t.filter(r=>!o.has(r.runId));return e.length?{runs:[...n.runs,...e]}:n})}export{d as m};
