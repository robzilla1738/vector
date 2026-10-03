import{u as s}from"./App-D4d43__f.js";function d(t){s.setState(n=>{const o=new Set(n.runs.map(r=>r.runId)),e=t.filter(r=>!o.has(r.runId));return e.length?{runs:[...n.runs,...e]}:n})}export{d as m};
