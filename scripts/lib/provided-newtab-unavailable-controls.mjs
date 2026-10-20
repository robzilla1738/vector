/** Preserve the supplied Ask toolbar while profile/account resolution is unavailable. */
export const unavailableToolbar = `function AuxUnavailableNewTabControls(){const unavailable="AI options are unavailable until this browser profile connects.";return(0,a.jsx)("div",{className:"mx-auto min-h-12 w-full max-w-200 px-4",children:(0,a.jsxs)("div",{className:"py-1",children:[(0,a.jsx)("span",{className:"text-muted-foreground px-2 text-xs",role:"status",children:"Profile disconnected — AI options unavailable"}),(0,a.jsxs)(uf,{className:"py-1",title:unavailable,"data-aux-account-unavailable":!0,children:[(0,a.jsxs)(Ts,{children:[(0,a.jsx)(J,{"aria-label":"Composer options",className:"text-muted-foreground bg-transparent","data-testid":"attachments-button",size:"icon-sm",variant:"secondary",shape:"pill",disabled:!0,children:(0,a.jsx)(nl,{className:"size-4"})}),(0,a.jsx)(J,{className:"text-muted-foreground",variant:"ghost",size:"sm",shape:"pill",disabled:!0,children:(0,a.jsx)(ws,{project:null})}),(0,a.jsx)(oc,{mode:"guard",disabled:!0,render:(0,a.jsx)(J,{variant:"ghost",size:"sm",shape:"pill"})})]}),(0,a.jsxs)(Ts,{children:[(0,a.jsx)(ac,{model:{provider:"",modelId:"Model unavailable",fastMode:!1},showThinkingLevel:!1,disabled:!0}),(0,a.jsx)(ic,{label:"Reasoning unavailable",disabled:!0}),(0,a.jsx)(J,{"aria-label":"Dictate",className:"transition-none text-muted-foreground",disabled:!0,size:"icon-sm",shape:"pill",type:"button",variant:"ghost",children:(0,a.jsx)(au,{className:"size-4"})})]})]})]})})}`;

export function transformProvidedNewTabUnavailableControls({ component, path, text }) {
  const anchors = [];
  if (component !== 'agent') return { text, anchors };
  const replace = (find, replacement) => {
    if (text.split(find).length !== 2)
      throw new Error(`New-tab availability anchor changed: ${path}`);
    anchors.push({ kind: 'integration', find, replace: replacement, count: 1 });
    text = text.replace(find, replacement);
  };
  if (path === 'assets/session-composer-Dc0LRfZA.js') {
    // All renderers/icons below are the existing supplied module's private
    // primitives. Do not mount its account-querying new-session providers here.
    replace('export{T1 as A,', `${unavailableToolbar}export{AuxUnavailableNewTabControls,T1 as A,`);
  }
  if (path === 'assets/ask-omnibox-panel-DkxXbN8c.js') {
    replace('import{A as P,F as I,', 'import{AuxUnavailableNewTabControls,A as P,F as I,');
    replace('return s===null?null:(0,e.jsx)(F,', 'return s===null?(0,e.jsx)(AuxUnavailableNewTabControls,{}):(0,e.jsx)(F,');
    // Null stays null. The fallback consumes no account RPCs and must not turn
    // the original context's otherwise-unreachable numeric fallback into an ID.
    replace('value:{accountId:n??0,browserProfile:null,mode:a}', 'value:{accountId:n,browserProfile:null,mode:a}');
  }
  return { text, anchors };
}
