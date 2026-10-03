import{s as t}from"./schemas-CYPDoXpo.js";const n=t().min(1).max(12e3).refine(e=>!/[\p{Cc}\p{Cf}]/u.test(e.replace(/[\n\t]/g,"")),"Only plain text, tabs, and line breaks are allowed");export{n as I};
