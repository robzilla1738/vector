import{a as s}from"./App-DebS6rrc.js";function a(t){s.setState(n=>{const o=new Set(n.runs.map(r=>r.runId)),e=t.filter(r=>!o.has(r.runId));return e.length?{runs:[...n.runs,...e]}:n})}export{a as m};
