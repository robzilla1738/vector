function t(e){return e.map(a=>a.map(n=>`"${(/^\s*[=+@-]/.test(n)?`'${n}`:n).replace(/"/g,'""')}"`).join(",")).join(`\r
`)}function p(e){return e.map(a=>a.map(n=>n.replace(/\|/g,"\\|").replace(/\r?\n/g," "))).map((a,n)=>`| ${a.join(" | ")} |${n===0?`
| ${a.map(()=>"---").join(" | ")} |`:""}`).join(`
`)}export{t as a,p as b};
