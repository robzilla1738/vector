// Native owns Profile/Extension/actual serviceworker identity. Reports are data.
const auxWorkerPending=new Map,auxWorkerUnknown=new Set,auxWorkerDeferred=[];
let auxWorkerLease=null,auxWorkerLastRelease=null,auxWorkerRevision=0,auxWorkerStarted=false,auxWorkerInspector=null;
const auxWorkerFormat="aux.ui-background-writer-lease.v1",auxWorkerUuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function auxWorkerAdvance(){
  if(auxWorkerRevision===Number.MAX_SAFE_INTEGER){auxWorkerUnknown.add("revision-exhausted");return}
  auxWorkerRevision++;
}
function auxWorkerNoteUnknown(kind){auxWorkerUnknown.add(kind);auxWorkerAdvance()}
function auxWorkerContextChanged(){if(auxWorkerLease)auxWorkerNoteUnknown("native-context-changed")}
function auxWorkerTrack(kind,callback,uncertainOnError=false){
  const ticket={kind,completion:null};auxWorkerPending.set(ticket,ticket);auxWorkerAdvance();
  let promise;
  try{promise=Promise.resolve(callback())}catch(error){promise=Promise.reject(error)}
  // Observe the actual original callback/Promise, never its timeout/race/abort
  // wrapper and never a map clear or disconnected request as its completion.
  ticket.completion=promise.then(()=>{auxWorkerPending.delete(ticket);auxWorkerAdvance()},error=>{
    if(uncertainOnError)auxWorkerNoteUnknown(kind);
    auxWorkerPending.delete(ticket);auxWorkerAdvance();
  });
  return promise;
}
function auxWorkerDefer(kind,callback,uncertainOnError,options){
  return new Promise((resolve,reject)=>{
    auxWorkerDeferred.push({kind,callback,uncertainOnError,options,resolve,reject});
    // Do not drop work or acknowledge it on overflow. Retain it for explicit
    // native abort/release, and refuse qualification of this unknown bound.
    if(auxWorkerDeferred.length>4096)auxWorkerNoteUnknown("deferred-bound-exceeded");
  });
}
function auxWorkerProduce(kind,callback,options={}){
  return auxWorkerLease?auxWorkerDefer(kind,callback,!!options.uncertainOnError,options):
    auxWorkerTrack(kind,callback,!!options.uncertainOnError);
}
function auxWorkerPhysical(kind,callback,uncertainOnError=true){
  // Existing admitted parents may finish child writes while preparing. Native
  // closes its physical gate only AFTER this worker reaches a held idle turn.
  return auxWorkerLease?.phase==="held"?auxWorkerDefer(kind,callback,uncertainOnError,{}):
    auxWorkerTrack(kind,callback,uncertainOnError);
}
function auxWorkerCancelDeferred(kind,key,owner,error){
  const index=auxWorkerDeferred.findIndex(work=>work.kind===kind&&work.options?.key===key&&work.options?.owner===owner);
  if(index<0)return false;
  const [work]=auxWorkerDeferred.splice(index,1);
  try{work.options.onCancelled?.(error);work.resolve()}catch(failure){work.reject(failure)}
  return true;
}
function auxWorkerReport(){
  const lease=auxWorkerLease;
  let inspectionError;
  try{if(!auxWorkerStarted||!auxWorkerInspector)throw Error("Worker producer registration is incomplete");auxWorkerInspector()}catch(error){inspectionError=String(error?.message??error)}
  const counts=Object.create(null);
  for(const {kind} of auxWorkerPending.values())counts[kind]=(counts[kind]??0)+1;
  const closed=!!lease&&lease.phase==="held"&&lease.revision===auxWorkerRevision&&!auxWorkerPending.size&&!auxWorkerUnknown.size&&!inspectionError;
  return{format:auxWorkerFormat,ok:closed,retained:!!lease,requestId:lease?.requestId??auxWorkerLastRelease?.requestId,
    leaseId:lease?.id??auxWorkerLastRelease?.leaseId,revision:lease?.revision??auxWorkerLastRelease?.revision,
    phase:lease?.phase??"open",closed,pendingCount:auxWorkerPending.size,deferredCount:auxWorkerDeferred.length,
    pendingKinds:counts,unknownKinds:[...auxWorkerUnknown].sort(),released:!lease&&!!auxWorkerLastRelease,
    ...inspectionError?{error:inspectionError}:!closed?{error:"Worker writers are pending, unknown, or not held"}:{}};
}
function auxWorkerCopyArguments(args){
  if(!auxWorkerLease)return args;
  try{return structuredClone(args)}catch(error){auxWorkerNoteUnknown("uncapturable-deferred-arguments");throw error}
}
function auxWorkerStorageLocalSet(...args){
  const captured=auxWorkerCopyArguments(args);
  return auxWorkerPhysical("chrome-local-set",()=>chrome.storage.local.set(...captured));
}
function auxWorkerStorageLocalRemove(...args){
  const captured=auxWorkerCopyArguments(args);
  return auxWorkerPhysical("chrome-local-remove",()=>chrome.storage.local.remove(...captured));
}
function auxWorkerAlarmCreate(...args){
  const captured=auxWorkerCopyArguments(args);
  return auxWorkerPhysical("chrome-alarm",()=>chrome.alarms.create(...captured));
}
async function auxWorkerPrepare(requestId){
  if(typeof document!=="undefined"||typeof window!=="undefined")return{format:auxWorkerFormat,ok:false,error:"A background serviceworker context is required"};
  if(typeof requestId!=="string"||!auxWorkerUuid.test(requestId))return{format:auxWorkerFormat,ok:false,error:"A canonical worker prepare request ID is required"};
  if(auxWorkerLease)return auxWorkerLease.requestId===requestId?auxWorkerReport():
    {format:auxWorkerFormat,ok:false,retained:true,error:"Another worker lease is already retained"};
  if(!auxWorkerStarted||!auxWorkerInspector)return{format:auxWorkerFormat,ok:false,retained:false,error:"Worker producer registration is incomplete"};
  let id;
  try{id=crypto.randomUUID()}catch{return{format:auxWorkerFormat,ok:false,error:"Worker lease identity unavailable"}}
  if(!auxWorkerUuid.test(id))return{format:auxWorkerFormat,ok:false,error:"Worker lease identity unavailable"};
  const lease={id,requestId,revision:null,phase:"preparing"};auxWorkerLease=lease;
  // No timer can turn incomplete physical callbacks into a closed writer set.
  while(auxWorkerLease===lease&&auxWorkerPending.size){
    const completions=[...auxWorkerPending.values()].map(work=>work.completion);
    if(completions.some(promise=>!promise)){auxWorkerNoteUnknown("unbound-physical-callback");break}
    await Promise.all(completions);
  }
  if(auxWorkerLease!==lease)return auxWorkerReport();
  lease.phase="held";lease.revision=auxWorkerRevision;
  return auxWorkerReport();
}
function auxWorkerRead(){return auxWorkerReport()}
function auxWorkerValidate(leaseId,revision){
  const report=auxWorkerReport();
  if(!auxWorkerLease||auxWorkerLease.id!==leaseId||auxWorkerLease.revision!==revision||
     !Number.isSafeInteger(revision)||revision<0||auxWorkerRevision!==revision)
    return{...report,ok:false,closed:false,error:"Worker lease changed"};
  return report;
}
function auxWorkerRelease(leaseId){
  const lease=auxWorkerLease;
  if(!lease||lease.id!==leaseId)return{format:auxWorkerFormat,ok:false,released:false,error:"Worker lease changed"};
  // Native opens its actual backend gate BEFORE dispatching this release to the
  // SAME retained worker. No actor is silently retargeted to a successor owner.
  auxWorkerLease=null;auxWorkerLastRelease={requestId:lease.requestId,leaseId:lease.id,revision:lease.revision};
  const ready=auxWorkerDeferred.splice(0);
  for(const work of ready)auxWorkerTrack(work.kind,work.callback,work.uncertainOnError).then(work.resolve,work.reject);
  return{format:auxWorkerFormat,ok:true,released:true,requestId:lease.requestId,leaseId:lease.id,revision:lease.revision,
    resumedCount:ready.length,pendingCount:auxWorkerPending.size,closed:false};
}
function auxWorkerInstallInspector(inspect){
  if(auxWorkerInspector||typeof inspect!=="function")throw Error("Repeated worker producer registration");
  auxWorkerInspector=inspect;auxWorkerStarted=true;
}
function auxWorkerControl(request){
  if(!request||typeof request!=="object"||typeof request.requestId!=="string"||!auxWorkerUuid.test(request.requestId)||
     !["prepare","read","validate","release"].includes(request.operation))
    return{format:auxWorkerFormat,ok:false,error:"Invalid worker control request"};
  const allowed=request.operation==="validate"?["requestId","operation","leaseId","revision"]:
    request.operation==="release"?["requestId","operation","leaseId"]:["requestId","operation"];
  if(Object.keys(request).some(key=>!allowed.includes(key)))return{format:auxWorkerFormat,ok:false,error:"Unexpected worker selector"};
  if(request.operation==="prepare")return auxWorkerPrepare(request.requestId);
  if(request.operation==="read")return auxWorkerRead();
  if(typeof request.leaseId!=="string"||!auxWorkerUuid.test(request.leaseId))return{format:auxWorkerFormat,ok:false,error:"Worker lease ID required"};
  return request.operation==="validate"?auxWorkerValidate(request.leaseId,request.revision):auxWorkerRelease(request.leaseId);
}
const auxWorkerControlApi=globalThis.chrome?.auxBrowserPreferences;
if(auxWorkerControlApi?.onUiMigrationWorkerControl&&typeof auxWorkerControlApi.replyUiMigrationWorkerControl==="function")
  auxWorkerControlApi.onUiMigrationWorkerControl.addListener(request=>{
    // This is a native-only EventRouter event. The reply ExtensionFunction must
    // bind the real SW sender/version/process/Profile and pending RPC UUID.
    Promise.resolve(auxWorkerControl(request)).then(result=>{
      const resultJson=JSON.stringify(result);
      if(new TextEncoder().encode(resultJson).byteLength>65536)throw Error("Worker report exceeds its bound");
      return auxWorkerControlApi.replyUiMigrationWorkerControl({requestId:request.requestId,operation:request.operation,resultJson});
    }).catch(()=>{
      // A dropped/rejected control reply does not release the retained lease.
      // Native observes it with a fresh read RPC, never by replaying writes.
    });
  });

!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e._posthogReleaseId=e._posthogReleaseId||"01a14421-bd0a-0000-3c62-ba3fbe2b6700";var n=(new e.Error).stack;n&&(e._posthogChunkIds=e._posthogChunkIds||{},e._posthogChunkIds[n]="ddda0258-b2d8-5731-95f2-6689ea8d2cfd")}catch(e){}}();var Uc = Object.create, lr = Object.defineProperty, xc = Object.getOwnPropertyDescriptor, zc = Object.getOwnPropertyNames, Fc = Object.getPrototypeOf, rs = Object.prototype.hasOwnProperty, ns = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), jc = (e, t) => {
  let r = {};
  for (var n in e)
    lr(r, n, {
      get: e[n],
      enumerable: !0
    });
  return t || lr(r, Symbol.toStringTag, { value: "Module" }), r;
}, qc = (e, t, r, n) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = zc(t), i = 0, s = o.length, a; i < s; i++)
      a = o[i], !rs.call(e, a) && a !== r && lr(e, a, {
        get: ((c) => t[c]).bind(null, a),
        enumerable: !(n = xc(t, a)) || n.enumerable
      });
  return e;
}, Zc = (e, t, r) => (r = e != null ? Uc(Fc(e)) : {}, qc(t || !e || !e.__esModule || !rs.call(e, "default") ? lr(r, "default", {
  value: e,
  enumerable: !0
}) : r, e)), Bc = /* @__PURE__ */ ns(((e) => {
  var t = /* @__PURE__ */ Symbol.for("react.transitional.element"), r = /* @__PURE__ */ Symbol.for("react.consumer"), n = /* @__PURE__ */ Symbol.for("react.context"), o = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, i = Object.assign, s = {};
  function a(v, w, b) {
    this.props = v, this.context = w, this.refs = s, this.updater = b || o;
  }
  a.prototype.isReactComponent = {}, a.prototype.setState = function(v, w) {
    if (typeof v != "object" && typeof v != "function" && v != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, v, w, "setState");
  }, a.prototype.forceUpdate = function(v) {
    this.updater.enqueueForceUpdate(this, v, "forceUpdate");
  };
  function c() {
  }
  c.prototype = a.prototype;
  function u(v, w, b) {
    this.props = v, this.context = w, this.refs = s, this.updater = b || o;
  }
  var l = u.prototype = new c();
  l.constructor = u, i(l, a.prototype), l.isPureReactComponent = !0;
  var f = Array.isArray, d = {
    H: null,
    A: null,
    T: null,
    S: null
  }, h = Object.prototype.hasOwnProperty;
  function g(v, w, b) {
    var S = b.ref;
    return {
      $$typeof: t,
      type: v,
      key: w,
      ref: S !== void 0 ? S : null,
      props: b
    };
  }
  e.createContext = function(v) {
    return v = {
      $$typeof: n,
      _currentValue: v,
      _currentValue2: v,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, v.Provider = v, v.Consumer = {
      $$typeof: r,
      _context: v
    }, v;
  }, e.createElement = function(v, w, b) {
    var S, A = {}, R = null;
    if (w != null) for (S in w.key !== void 0 && (R = "" + w.key), w) h.call(w, S) && S !== "key" && S !== "__self" && S !== "__source" && (A[S] = w[S]);
    var _ = arguments.length - 2;
    if (_ === 1) A.children = b;
    else if (1 < _) {
      for (var P = Array(_), k = 0; k < _; k++) P[k] = arguments[k + 2];
      A.children = P;
    }
    if (v && v.defaultProps) for (S in _ = v.defaultProps, _) A[S] === void 0 && (A[S] = _[S]);
    return g(v, R, A);
  }, e.useContext = function(v) {
    return d.H.useContext(v);
  }, e.useMemo = function(v, w) {
    return d.H.useMemo(v, w);
  };
})), Gc = /* @__PURE__ */ ns(((e, t) => {
  t.exports = Bc();
})), Kc = {
  setTimeout: (e, t) => setTimeout(e, t),
  clearTimeout: (e) => clearTimeout(e),
  setInterval: (e, t) => setInterval(e, t),
  clearInterval: (e) => clearInterval(e)
}, Wc = class {
  #e = Kc;
  #t = !1;
  setTimeoutProvider(e) {
    this.#e = e;
  }
  setTimeout(e, t) {
    return this.#e.setTimeout(e, t);
  }
  clearTimeout(e) {
    this.#e.clearTimeout(e);
  }
  setInterval(e, t) {
    return this.#e.setInterval(e, t);
  }
  clearInterval(e) {
    this.#e.clearInterval(e);
  }
}, nn = new Wc();
function Vc(e) {
  setTimeout(e, 0);
}
var Hc = typeof window > "u" || "Deno" in globalThis;
function Y() {
}
function Jc(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Qc(e) {
  return typeof e == "number" && e >= 0 && e !== 1 / 0;
}
function Yc(e, t) {
  return Math.max(e + (t || 0) - Date.now(), 0);
}
function bt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function io(e, t) {
  const { type: r = "all", exact: n, fetchStatus: o, predicate: i, queryKey: s, stale: a } = e;
  if (s) {
    if (n) {
      if (t.queryHash !== Tn(s, t.options)) return !1;
    } else if (!Ye(t.queryKey, s)) return !1;
  }
  if (r !== "all") {
    const c = t.isActive();
    if (r === "active" && !c || r === "inactive" && c) return !1;
  }
  return !(typeof a == "boolean" && t.isStale() !== a || o && o !== t.state.fetchStatus || i && !i(t));
}
function so(e, t) {
  const { exact: r, status: n, predicate: o, mutationKey: i } = e;
  if (i) {
    if (!t.options.mutationKey) return !1;
    if (r) {
      if (At(t.options.mutationKey) !== At(i)) return !1;
    } else if (!Ye(t.options.mutationKey, i)) return !1;
  }
  return !(n && t.state.status !== n || o && !o(t));
}
function Tn(e, t) {
  return (t?.queryKeyHashFn || At)(e);
}
function At(e) {
  return JSON.stringify(e, (t, r) => on(r) ? Object.keys(r).sort().reduce((n, o) => (n[o] = r[o], n), {}) : r);
}
function Ye(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (e && t && typeof e == "object" && typeof t == "object") {
    if (Array.isArray(e) && Array.isArray(t)) {
      if (t.length > e.length) return !1;
      for (let n = 0; n < t.length; n++) if (!Ye(e[n], t[n])) return !1;
      return !0;
    }
    const r = Object.keys(t);
    for (const n of r) if (!Ye(e[n], t[n])) return !1;
    return !0;
  }
  return !1;
}
var Xc = Object.prototype.hasOwnProperty;
function os(e, t, r = 0) {
  if (e === t) return e;
  if (r > 500) return t;
  const n = ao(e) && ao(t);
  if (!n && !(on(e) && on(t))) return t;
  const o = (n ? e : Object.keys(e)).length, i = n ? t : Object.keys(t), s = i.length, a = n ? new Array(s) : {};
  let c = 0;
  for (let u = 0; u < s; u++) {
    const l = n ? u : i[u], f = e[l], d = t[l];
    if (f === d) {
      a[l] = f, (n ? u < o : Xc.call(e, l)) && c++;
      continue;
    }
    if (f === null || d === null || typeof f != "object" || typeof d != "object") {
      a[l] = d;
      continue;
    }
    const h = os(f, d, r + 1);
    a[l] = h, h === f && c++;
  }
  return o === s && c === o ? e : a;
}
function ao(e) {
  return Array.isArray(e) && e.length === Object.keys(e).length;
}
function on(e) {
  if (!co(e)) return !1;
  const t = Object.getPrototypeOf(e), r = t?.constructor;
  if (r === void 0) return !0;
  if (typeof r != "function") return !1;
  const n = r.prototype;
  return !(!co(n) || !n.hasOwnProperty("isPrototypeOf") || t !== Object.prototype);
}
function co(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function eu(e) {
  return new Promise((t) => {
    nn.setTimeout(t, e);
  });
}
function tu(e, t, r) {
  return typeof r.structuralSharing == "function" ? r.structuralSharing(e, t) : r.structuralSharing !== !1 ? os(e, t) : t;
}
function ru(e, t, r = 0) {
  const n = [...e, t];
  return r && n.length > r ? n.slice(1) : n;
}
function nu(e, t, r = 0) {
  const n = [t, ...e];
  return r && n.length > r ? n.slice(0, -1) : n;
}
var ce = /* @__PURE__ */ Symbol();
function is(e, t) {
  return !e.queryFn && t?.initialPromise ? () => t.initialPromise : !e.queryFn || e.queryFn === ce ? () => Promise.reject(/* @__PURE__ */ new Error(`Missing queryFn: '${e.queryHash}'`)) : e.queryFn;
}
function ou(e, t, r) {
  let n = !1, o;
  return Object.defineProperty(e, "signal", {
    enumerable: !0,
    get: () => (o ??= t(), n || (n = !0, o.aborted ? r() : o.addEventListener("abort", r, { once: !0 })), o)
  }), e;
}
var iu = () => Hc, ss = () => iu(), Ar = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set(), this.subscribe = this.subscribe.bind(this);
  }
  subscribe(e) {
    return this.listeners.add(e), this.onSubscribe(), () => {
      this.listeners.delete(e), this.onUnsubscribe();
    };
  }
  hasListeners() {
    return this.listeners.size > 0;
  }
  onSubscribe() {
  }
  onUnsubscribe() {
  }
}, su = class extends Ar {
  #e;
  #t;
  #r;
  constructor() {
    super(), this.#r = (e) => {
      if (typeof window < "u" && window.addEventListener) {
        const t = () => e();
        return window.addEventListener("visibilitychange", t, !1), () => {
          window.removeEventListener("visibilitychange", t);
        };
      }
    };
  }
  onSubscribe() {
    this.#t || this.setEventListener(this.#r);
  }
  onUnsubscribe() {
    this.hasListeners() || (this.#t?.(), this.#t = void 0);
  }
  setEventListener(e) {
    this.#r = e, this.#t?.(), this.#t = e((t) => {
      typeof t == "boolean" ? this.setFocused(t) : this.onFocus();
    });
  }
  setFocused(e) {
    this.#e !== e && (this.#e = e, this.onFocus());
  }
  onFocus() {
    const e = this.isFocused();
    this.listeners.forEach((t) => {
      t(e);
    });
  }
  isFocused() {
    return typeof this.#e == "boolean" ? this.#e : globalThis.document?.visibilityState !== "hidden";
  }
}, as = new su(), au = Vc;
function cu() {
  let e = [], t = 0, r = (a) => {
    a();
  }, n = (a) => {
    a();
  }, o = au;
  const i = (a) => {
    t ? e.push(a) : o(() => {
      r(a);
    });
  }, s = () => {
    const a = e;
    e = [], a.length && o(() => {
      n(() => {
        a.forEach((c) => {
          r(c);
        });
      });
    });
  };
  return {
    batch: (a) => {
      let c;
      t++;
      try {
        c = a();
      } finally {
        t--, t || s();
      }
      return c;
    },
    batchCalls: (a) => (...c) => {
      i(() => {
        a(...c);
      });
    },
    schedule: i,
    setNotifyFunction: (a) => {
      r = a;
    },
    setBatchNotifyFunction: (a) => {
      n = a;
    },
    setScheduler: (a) => {
      o = a;
    }
  };
}
var V = cu(), uu = class extends Ar {
  #e = !0;
  #t;
  #r;
  constructor() {
    super(), this.#r = (e) => {
      if (typeof window < "u" && window.addEventListener) {
        const t = () => e(!0), r = () => e(!1);
        return window.addEventListener("online", t, !1), window.addEventListener("offline", r, !1), () => {
          window.removeEventListener("online", t), window.removeEventListener("offline", r);
        };
      }
    };
  }
  onSubscribe() {
    this.#t || this.setEventListener(this.#r);
  }
  onUnsubscribe() {
    this.hasListeners() || (this.#t?.(), this.#t = void 0);
  }
  setEventListener(e) {
    this.#r = e, this.#t?.(), this.#t = e(this.setOnline.bind(this));
  }
  setOnline(e) {
    this.#e !== e && (this.#e = e, this.listeners.forEach((t) => {
      t(e);
    }));
  }
  isOnline() {
    return this.#e;
  }
}, dr = new uu();
function lu(e) {
  return Math.min(1e3 * 2 ** e, 3e4);
}
function cs(e) {
  return (e ?? "online") === "online" ? dr.isOnline() : !0;
}
var sn = class extends Error {
  constructor(e) {
    super("CancelledError"), this.revert = e?.revert, this.silent = e?.silent;
  }
};
function us(e) {
  let t = !1, r = 0, n, o = "pending", i, s;
  const a = new Promise((S, A) => {
    i = S, s = A;
  });
  a.catch(Y);
  const c = () => o !== "pending", u = (S) => {
    if (!c()) {
      const A = new sn(S);
      v(A), e.onCancel?.(A);
    }
  }, l = () => {
    t = !0;
  }, f = () => {
    t = !1;
  }, d = () => as.isFocused() && (e.networkMode === "always" || dr.isOnline()) && e.canRun(), h = () => cs(e.networkMode) && e.canRun(), g = (S) => {
    c() || (n?.(), o = "resolved", i(S));
  }, v = (S) => {
    c() || (n?.(), o = "rejected", s(S));
  }, w = () => new Promise((S) => {
    n = (A) => {
      (c() || d()) && S(A);
    }, e.onPause?.();
  }).then(() => {
    n = void 0, c() || e.onContinue?.();
  }), b = () => {
    if (c()) return;
    let S;
    const A = r === 0 ? e.initialPromise : void 0;
    try {
      S = A ?? e.fn();
    } catch (R) {
      S = Promise.reject(R);
    }
    Promise.resolve(S).then(g).catch((R) => {
      if (c()) return;
      const _ = e.retry ?? (ss() ? 0 : 3), P = e.retryDelay ?? lu, k = typeof P == "function" ? P(r, R) : P, q = _ === !0 || typeof _ == "number" && r < _ || typeof _ == "function" && _(r, R);
      if (t || !q) {
        v(R);
        return;
      }
      r++, e.onFail?.(r, R), eu(k).then(() => d() ? void 0 : w()).then(() => {
        t ? v(R) : b();
      });
    });
  };
  return {
    promise: a,
    status: () => o,
    cancel: u,
    continue: () => (n?.(), a),
    cancelRetry: l,
    continueRetry: f,
    canStart: h,
    start: () => (h() ? b() : w().then(b), a)
  };
}
var ls = class {
  #e;
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout(), Qc(this.gcTime) && (this.#e = nn.setTimeout(() => {
      this.optionalRemove();
    }, this.gcTime));
  }
  updateGcTime(e) {
    this.gcTime = Math.max(this.gcTime || 0, e ?? (ss() ? 1 / 0 : 3e5));
  }
  clearGcTimeout() {
    this.#e !== void 0 && (nn.clearTimeout(this.#e), this.#e = void 0);
  }
};
function du(e) {
  return { onFetch: (t, r) => {
    const n = t.options, o = t.fetchOptions?.meta?.fetchMore?.direction, i = t.state.data?.pages || [], s = t.state.data?.pageParams || [];
    let a = {
      pages: [],
      pageParams: []
    }, c = 0;
    const u = async () => {
      let l = !1;
      const f = (g) => {
        ou(g, () => t.signal, () => l = !0);
      }, d = is(t.options, t.fetchOptions), h = async (g, v, w) => {
        if (l) return Promise.reject(t.signal.reason);
        if (v == null && g.pages.length) return Promise.resolve(g);
        const S = (() => {
          const P = {
            client: t.client,
            queryKey: t.queryKey,
            pageParam: v,
            direction: w ? "backward" : "forward",
            meta: t.options.meta
          };
          return f(P), P;
        })(), A = await d(S), { maxPages: R } = t.options, _ = w ? nu : ru;
        return {
          pages: _(g.pages, A, R),
          pageParams: _(g.pageParams, v, R)
        };
      };
      if (o && i.length) {
        const g = o === "backward", v = g ? fu : uo, w = {
          pages: i,
          pageParams: s
        };
        a = await h(w, v(n, w), g);
      } else {
        const g = e ?? i.length;
        do {
          const v = c === 0 ? s[0] ?? n.initialPageParam : uo(n, a);
          if (c > 0 && v == null) break;
          a = await h(a, v), c++;
        } while (c < g);
      }
      return a;
    };
    t.options.persister ? t.fetchFn = () => t.options.persister?.(u, {
      client: t.client,
      queryKey: t.queryKey,
      meta: t.options.meta,
      signal: t.signal
    }, r) : t.fetchFn = u;
  } };
}
function uo(e, { pages: t, pageParams: r }) {
  const n = t.length - 1;
  return t.length > 0 ? e.getNextPageParam(t[n], t, r[n], r) : void 0;
}
function fu(e, { pages: t, pageParams: r }) {
  return t.length > 0 ? e.getPreviousPageParam?.(t[0], t, r[0], r) : void 0;
}
var hu = class extends ls {
  #e;
  #t;
  #r;
  #n;
  #i;
  #o;
  #s;
  #a;
  constructor(e) {
    super(), this.#a = !1, this.#s = e.defaultOptions, this.setOptions(e.options), this.observers = [], this.#i = e.client, this.#n = this.#i.getQueryCache(), this.queryKey = e.queryKey, this.queryHash = e.queryHash, this.#t = fo(this.options), this.state = e.state ?? this.#t, this.scheduleGc();
  }
  get meta() {
    return this.options.meta;
  }
  get queryType() {
    return this.#e;
  }
  get promise() {
    return this.#o?.promise;
  }
  setOptions(e) {
    if (this.options = {
      ...this.#s,
      ...e
    }, e?._type && (this.#e = e._type), this.updateGcTime(this.options.gcTime), this.state && this.state.data === void 0) {
      const t = fo(this.options);
      t.data !== void 0 && (this.setState(lo(t.data, t.dataUpdatedAt)), this.#t = t);
    }
  }
  optionalRemove() {
    !this.observers.length && this.state.fetchStatus === "idle" && this.#n.remove(this);
  }
  setData(e, t) {
    const r = tu(this.state.data, e, this.options);
    return this.#c({
      data: r,
      type: "success",
      dataUpdatedAt: t?.updatedAt,
      manual: t?.manual
    }), r;
  }
  setState(e) {
    this.#c({
      type: "setState",
      state: e
    });
  }
  cancel(e) {
    const t = this.#o?.promise;
    return this.#o?.cancel(e), t ? t.then(Y).catch(Y) : Promise.resolve();
  }
  destroy() {
    super.destroy(), this.cancel({ silent: !0 });
  }
  get resetState() {
    return this.#t;
  }
  reset() {
    this.destroy(), this.setState(this.resetState);
  }
  isActive() {
    return this.observers.some((e) => bt(e.options.enabled, this) !== !1);
  }
  isDisabled() {
    return this.getObserversCount() > 0 ? !this.isActive() : this.options.queryFn === ce || !this.isFetched();
  }
  isFetched() {
    return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
  }
  isStatic() {
    return this.getObserversCount() > 0 ? this.observers.some((e) => bt(e.options.staleTime, this) === "static") : !1;
  }
  isStale() {
    return this.getObserversCount() > 0 ? this.observers.some((e) => e.getCurrentResult().isStale) : this.state.data === void 0 || this.state.isInvalidated;
  }
  isStaleByTime(e = 0) {
    return this.state.data === void 0 ? !0 : e === "static" ? !1 : this.state.isInvalidated ? !0 : !Yc(this.state.dataUpdatedAt, e);
  }
  onFocus() {
    this.observers.find((e) => e.shouldFetchOnWindowFocus())?.refetch({ cancelRefetch: !1 }), this.#o?.continue();
  }
  onOnline() {
    this.observers.find((e) => e.shouldFetchOnReconnect())?.refetch({ cancelRefetch: !1 }), this.#o?.continue();
  }
  addObserver(e) {
    this.observers.includes(e) || (this.observers.push(e), this.clearGcTimeout(), this.#n.notify({
      type: "observerAdded",
      query: this,
      observer: e
    }));
  }
  removeObserver(e) {
    const t = this.observers.indexOf(e);
    t !== -1 && (this.observers.splice(t, 1), this.observers.length || (this.#o && (this.#a || this.state.fetchStatus === "paused" && this.state.status === "pending" ? this.#o.cancel({ revert: !0 }) : this.#o.cancelRetry()), this.scheduleGc()), this.#n.notify({
      type: "observerRemoved",
      query: this,
      observer: e
    }));
  }
  getObserversCount() {
    return this.observers.length;
  }
  invalidate() {
    this.state.isInvalidated || this.#c({ type: "invalidate" });
  }
  async fetch(e, t) {
    if (this.state.fetchStatus !== "idle" && this.#o?.status() !== "rejected") {
      if (this.state.data !== void 0 && t?.cancelRefetch) this.cancel({ silent: !0 });
      else if (this.#o)
        return this.#o.continueRetry(), this.#o.promise;
    }
    if (e && this.setOptions(e), !this.options.queryFn) {
      const c = this.observers.find((u) => u.options.queryFn);
      c && this.setOptions(c.options);
    }
    const r = new AbortController(), n = (c) => {
      Object.defineProperty(c, "signal", {
        enumerable: !0,
        get: () => (this.#a = !0, r.signal)
      });
    }, o = () => {
      const c = is(this.options, t), l = (() => {
        const f = {
          client: this.#i,
          queryKey: this.queryKey,
          meta: this.meta
        };
        return n(f), f;
      })();
      return this.#a = !1, this.options.persister ? this.options.persister(c, l, this) : c(l);
    }, s = (() => {
      const c = {
        fetchOptions: t,
        options: this.options,
        queryKey: this.queryKey,
        client: this.#i,
        state: this.state,
        fetchFn: o
      };
      return n(c), c;
    })();
    (this.#e === "infinite" ? du(this.options.pages) : this.options.behavior)?.onFetch(s, this), this.#r = this.state, (this.state.fetchStatus === "idle" || this.state.fetchMeta !== s.fetchOptions?.meta) && this.#c({
      type: "fetch",
      meta: s.fetchOptions?.meta
    });
    const a = this.#o = us({
      initialPromise: t?.initialPromise,
      fn: s.fetchFn,
      onCancel: (c) => {
        c instanceof sn && c.revert && this.setState({
          ...this.#r,
          fetchStatus: "idle"
        }), r.abort();
      },
      onFail: (c, u) => {
        this.#c({
          type: "failed",
          failureCount: c,
          error: u
        });
      },
      onPause: () => {
        this.#c({ type: "pause" });
      },
      onContinue: () => {
        this.#c({ type: "continue" });
      },
      retry: s.options.retry,
      retryDelay: s.options.retryDelay,
      networkMode: s.options.networkMode,
      canRun: () => !0
    });
    try {
      const c = await a.start();
      if (c === void 0) throw new Error(`${this.queryHash} data is undefined`);
      return this.setData(c), this.#n.config.onSuccess?.(c, this), this.#n.config.onSettled?.(c, this.state.error, this), c;
    } catch (c) {
      if (c instanceof sn) {
        if (c.silent) return this.#o.promise;
        if (c.revert) {
          if (this.state.data === void 0) throw c;
          return this.state.data;
        }
      }
      throw this.#c({
        type: "error",
        error: c
      }), this.#n.config.onError?.(c, this), this.#n.config.onSettled?.(this.state.data, c, this), c;
    } finally {
      this.#o === a && (this.#o = void 0), this.scheduleGc();
    }
  }
  #c(e) {
    const t = (r) => {
      switch (e.type) {
        case "failed":
          return {
            ...r,
            fetchFailureCount: e.failureCount,
            fetchFailureReason: e.error
          };
        case "pause":
          return {
            ...r,
            fetchStatus: "paused"
          };
        case "continue":
          return {
            ...r,
            fetchStatus: "fetching"
          };
        case "fetch":
          return {
            ...r,
            ...pu(r.data, this.options),
            fetchMeta: e.meta ?? null
          };
        case "success":
          const n = {
            ...r,
            ...lo(e.data, e.dataUpdatedAt),
            dataUpdateCount: r.dataUpdateCount + 1,
            ...!e.manual && {
              fetchStatus: "idle",
              fetchFailureCount: 0,
              fetchFailureReason: null
            }
          };
          return this.#r = e.manual ? n : void 0, n;
        case "error":
          const o = e.error;
          return {
            ...r,
            error: o,
            errorUpdateCount: r.errorUpdateCount + 1,
            errorUpdatedAt: Date.now(),
            fetchFailureCount: r.fetchFailureCount + 1,
            fetchFailureReason: o,
            fetchStatus: "idle",
            status: "error",
            isInvalidated: !0
          };
        case "invalidate":
          return {
            ...r,
            isInvalidated: !0
          };
        case "setState":
          return {
            ...r,
            ...e.state
          };
      }
    };
    this.state = t(this.state), V.batch(() => {
      this.observers.slice().forEach((r) => {
        r.onQueryUpdate();
      }), this.#n.notify({
        query: this,
        type: "updated",
        action: e
      });
    });
  }
};
function pu(e, t) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: cs(t.networkMode) ? "fetching" : "paused",
    ...e === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function lo(e, t) {
  return {
    data: e,
    dataUpdatedAt: t ?? Date.now(),
    error: null,
    isInvalidated: !1,
    status: "success"
  };
}
function fo(e) {
  const t = typeof e.initialData == "function" ? e.initialData() : e.initialData, r = t !== void 0, n = r ? typeof e.initialDataUpdatedAt == "function" ? e.initialDataUpdatedAt() : e.initialDataUpdatedAt : 0;
  return {
    data: t,
    dataUpdateCount: 0,
    dataUpdatedAt: r ? n ?? Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: !1,
    status: r ? "success" : "pending",
    fetchStatus: "idle"
  };
}
var mu = class extends ls {
  #e;
  #t;
  #r;
  #n;
  constructor(e) {
    super(), this.#e = e.client, this.mutationId = e.mutationId, this.#r = e.mutationCache, this.#t = [], this.state = e.state || gu(), this.setOptions(e.options), this.scheduleGc();
  }
  setOptions(e) {
    this.options = e, this.updateGcTime(this.options.gcTime);
  }
  get meta() {
    return this.options.meta;
  }
  addObserver(e) {
    this.#t.includes(e) || (this.#t.push(e), this.clearGcTimeout(), this.#r.notify({
      type: "observerAdded",
      mutation: this,
      observer: e
    }));
  }
  removeObserver(e) {
    this.#t = this.#t.filter((t) => t !== e), this.scheduleGc(), this.#r.notify({
      type: "observerRemoved",
      mutation: this,
      observer: e
    });
  }
  optionalRemove() {
    this.#t.length || (this.state.status === "pending" ? this.scheduleGc() : this.#r.remove(this));
  }
  continue() {
    return this.#n?.continue() ?? (this.state.status === "pending" ? this.execute(this.state.variables) : Promise.resolve());
  }
  async execute(e) {
    const t = () => {
      this.#i({ type: "continue" });
    }, r = {
      client: this.#e,
      meta: this.options.meta,
      mutationKey: this.options.mutationKey
    }, n = this.#n = us({
      fn: () => this.options.mutationFn ? this.options.mutationFn(e, r) : Promise.reject(/* @__PURE__ */ new Error("No mutationFn found")),
      onFail: (s, a) => {
        this.#i({
          type: "failed",
          failureCount: s,
          error: a
        });
      },
      onPause: () => {
        this.#i({ type: "pause" });
      },
      onContinue: t,
      retry: this.options.retry ?? 0,
      retryDelay: this.options.retryDelay,
      networkMode: this.options.networkMode,
      canRun: () => this.#r.canRun(this)
    }), o = this.state.status === "pending", i = !n.canStart();
    try {
      if (o) t();
      else {
        this.#i({
          type: "pending",
          variables: e,
          isPaused: i
        }), this.#r.config.onMutate && await this.#r.config.onMutate(e, this, r);
        const a = await this.options.onMutate?.(e, r);
        a !== this.state.context && this.#i({
          type: "pending",
          context: a,
          variables: e,
          isPaused: i
        });
      }
      const s = await n.start();
      return await this.#r.config.onSuccess?.(s, e, this.state.context, this, r), await this.options.onSuccess?.(s, e, this.state.context, r), await this.#r.config.onSettled?.(s, null, this.state.variables, this.state.context, this, r), await this.options.onSettled?.(s, null, e, this.state.context, r), this.#i({
        type: "success",
        data: s
      }), s;
    } catch (s) {
      try {
        await this.#r.config.onError?.(s, e, this.state.context, this, r);
      } catch (a) {
        Promise.reject(a);
      }
      try {
        await this.options.onError?.(s, e, this.state.context, r);
      } catch (a) {
        Promise.reject(a);
      }
      try {
        await this.#r.config.onSettled?.(void 0, s, this.state.variables, this.state.context, this, r);
      } catch (a) {
        Promise.reject(a);
      }
      try {
        await this.options.onSettled?.(void 0, s, e, this.state.context, r);
      } catch (a) {
        Promise.reject(a);
      }
      throw this.#i({
        type: "error",
        error: s
      }), s;
    } finally {
      this.#n === n && (this.#n = void 0), this.#r.runNext(this);
    }
  }
  #i(e) {
    const t = (r) => {
      switch (e.type) {
        case "failed":
          return {
            ...r,
            failureCount: e.failureCount,
            failureReason: e.error
          };
        case "pause":
          return {
            ...r,
            isPaused: !0
          };
        case "continue":
          return {
            ...r,
            isPaused: !1
          };
        case "pending":
          return {
            ...r,
            context: e.context,
            data: void 0,
            failureCount: 0,
            failureReason: null,
            error: null,
            isPaused: e.isPaused,
            status: "pending",
            variables: e.variables,
            submittedAt: Date.now()
          };
        case "success":
          return {
            ...r,
            data: e.data,
            failureCount: 0,
            failureReason: null,
            error: null,
            status: "success",
            isPaused: !1
          };
        case "error":
          return {
            ...r,
            data: void 0,
            error: e.error,
            failureCount: r.failureCount + 1,
            failureReason: e.error,
            isPaused: !1,
            status: "error"
          };
      }
    };
    this.state = t(this.state), V.batch(() => {
      this.#t.forEach((r) => {
        r.onMutationUpdate(e);
      }), this.#r.notify({
        mutation: this,
        type: "updated",
        action: e
      });
    });
  }
};
function gu() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: !1,
    status: "idle",
    variables: void 0,
    submittedAt: 0
  };
}
var vu = class extends Ar {
  #e;
  #t;
  #r;
  constructor(e = {}) {
    super(), this.config = e, this.#e = /* @__PURE__ */ new Set(), this.#t = /* @__PURE__ */ new Map(), this.#r = 0;
  }
  build(e, t, r) {
    const n = new mu({
      client: e,
      mutationCache: this,
      mutationId: ++this.#r,
      options: e.defaultMutationOptions(t),
      state: r
    });
    return this.add(n), n;
  }
  add(e) {
    this.#e.add(e);
    const t = Ft(e);
    if (typeof t == "string") {
      const r = this.#t.get(t);
      r ? r.push(e) : this.#t.set(t, [e]);
    }
    this.notify({
      type: "added",
      mutation: e
    });
  }
  remove(e) {
    if (this.#e.delete(e)) {
      const t = Ft(e);
      if (typeof t == "string") {
        const r = this.#t.get(t);
        if (r)
          if (r.length > 1) {
            const n = r.indexOf(e);
            n !== -1 && r.splice(n, 1);
          } else r[0] === e && this.#t.delete(t);
      }
    }
    this.notify({
      type: "removed",
      mutation: e
    });
  }
  canRun(e) {
    const t = Ft(e);
    if (typeof t == "string") {
      const r = this.#t.get(t)?.find((n) => n.state.status === "pending");
      return !r || r === e;
    } else return !0;
  }
  runNext(e) {
    const t = Ft(e);
    return typeof t == "string" ? this.#t.get(t)?.find((r) => r !== e && r.state.isPaused)?.continue() ?? Promise.resolve() : Promise.resolve();
  }
  clear() {
    V.batch(() => {
      this.#e.forEach((e) => {
        this.notify({
          type: "removed",
          mutation: e
        });
      }), this.#e.clear(), this.#t.clear();
    });
  }
  getAll() {
    return Array.from(this.#e);
  }
  find(e) {
    const t = {
      exact: !0,
      ...e
    };
    return this.getAll().find((r) => so(t, r));
  }
  findAll(e = {}) {
    return this.getAll().filter((t) => so(e, t));
  }
  notify(e) {
    V.batch(() => {
      this.listeners.forEach((t) => {
        t(e);
      });
    });
  }
  resumePausedMutations() {
    const e = this.getAll().filter((t) => t.state.isPaused);
    return V.batch(() => Promise.all(e.map((t) => t.continue().catch(Y))));
  }
};
function Ft(e) {
  return e.options.scope?.id;
}
var yu = class extends Ar {
  #e;
  constructor(e = {}) {
    super(), this.config = e, this.#e = /* @__PURE__ */ new Map();
  }
  build(e, t, r) {
    const n = t.queryKey, o = t.queryHash ?? Tn(n, t);
    let i = this.get(o);
    return i || (i = new hu({
      client: e,
      queryKey: n,
      queryHash: o,
      options: e.defaultQueryOptions(t),
      state: r,
      defaultOptions: e.getQueryDefaults(n)
    }), this.add(i)), i;
  }
  add(e) {
    this.#e.has(e.queryHash) || (this.#e.set(e.queryHash, e), this.notify({
      type: "added",
      query: e
    }));
  }
  remove(e) {
    const t = this.#e.get(e.queryHash);
    t && (e.destroy(), t === e && this.#e.delete(e.queryHash), this.notify({
      type: "removed",
      query: e
    }));
  }
  clear() {
    V.batch(() => {
      this.getAll().forEach((e) => {
        this.remove(e);
      });
    });
  }
  get(e) {
    return this.#e.get(e);
  }
  getAll() {
    return [...this.#e.values()];
  }
  find(e) {
    const t = {
      exact: !0,
      ...e
    };
    return this.getAll().find((r) => io(t, r));
  }
  findAll(e = {}) {
    const t = this.getAll();
    return Object.keys(e).length > 0 ? t.filter((r) => io(e, r)) : t;
  }
  notify(e) {
    V.batch(() => {
      this.listeners.forEach((t) => {
        t(e);
      });
    });
  }
  onFocus() {
    V.batch(() => {
      this.getAll().forEach((e) => {
        e.onFocus();
      });
    });
  }
  onOnline() {
    V.batch(() => {
      this.getAll().forEach((e) => {
        e.onOnline();
      });
    });
  }
}, wu = class {
  #e;
  #t;
  #r;
  #n;
  #i;
  #o;
  #s;
  #a;
  constructor(e = {}) {
    this.#e = e.queryCache || new yu(), this.#t = e.mutationCache || new vu(), this.#r = e.defaultOptions || {}, this.#n = /* @__PURE__ */ new Map(), this.#i = /* @__PURE__ */ new Map(), this.#o = 0;
  }
  mount() {
    this.#o++, this.#o === 1 && (this.#s = as.subscribe(async (e) => {
      e && (await this.resumePausedMutations(), this.#e.onFocus());
    }), this.#a = dr.subscribe(async (e) => {
      e && (await this.resumePausedMutations(), this.#e.onOnline());
    }));
  }
  unmount() {
    this.#o--, this.#o === 0 && (this.#s?.(), this.#s = void 0, this.#a?.(), this.#a = void 0);
  }
  isFetching(e) {
    return this.#e.findAll({
      ...e,
      fetchStatus: "fetching"
    }).length;
  }
  isMutating(e) {
    return this.#t.findAll({
      ...e,
      status: "pending"
    }).length;
  }
  getQueryData(e) {
    const t = this.defaultQueryOptions({ queryKey: e });
    return this.#e.get(t.queryHash)?.state.data;
  }
  ensureQueryData(e) {
    const t = this.defaultQueryOptions(e), r = this.#e.build(this, t), n = r.state.data;
    return n === void 0 ? this.fetchQuery(e) : (e.revalidateIfStale && r.isStaleByTime(bt(t.staleTime, r)) && this.prefetchQuery(t), Promise.resolve(n));
  }
  getQueriesData(e) {
    return this.#e.findAll(e).map(({ queryKey: t, state: r }) => [t, r.data]);
  }
  setQueryData(e, t, r) {
    const n = this.defaultQueryOptions({ queryKey: e }), o = this.#e.get(n.queryHash)?.state.data, i = Jc(t, o);
    if (i !== void 0)
      return this.#e.build(this, n).setData(i, {
        ...r,
        manual: !0
      });
  }
  setQueriesData(e, t, r) {
    return V.batch(() => this.#e.findAll(e).map(({ queryKey: n }) => [n, this.setQueryData(n, t, r)]));
  }
  getQueryState(e) {
    const t = this.defaultQueryOptions({ queryKey: e });
    return this.#e.get(t.queryHash)?.state;
  }
  removeQueries(e) {
    const t = this.#e;
    V.batch(() => {
      t.findAll(e).forEach((r) => {
        t.remove(r);
      });
    });
  }
  resetQueries(e, t) {
    const r = this.#e;
    return V.batch(() => {
      const n = r.findAll(e), o = new Set(n);
      return n.forEach((i) => {
        i.reset();
      }), this.refetchQueries({
        type: "active",
        predicate: (i) => o.has(i)
      }, t);
    });
  }
  cancelQueries(e, t = {}) {
    const r = {
      revert: !0,
      ...t
    }, n = V.batch(() => this.#e.findAll(e).map((o) => o.cancel(r)));
    return Promise.all(n).then(Y).catch(Y);
  }
  invalidateQueries(e, t = {}) {
    return V.batch(() => (this.#e.findAll(e).forEach((r) => {
      r.invalidate();
    }), e?.refetchType === "none" ? Promise.resolve() : this.refetchQueries({
      ...e,
      type: e?.refetchType ?? e?.type ?? "active"
    }, t)));
  }
  refetchQueries(e, t = {}) {
    const r = {
      ...t,
      cancelRefetch: t.cancelRefetch ?? !0
    }, n = V.batch(() => this.#e.findAll(e).filter((o) => !o.isDisabled() && !o.isStatic()).map((o) => {
      let i = o.fetch(void 0, r);
      return r.throwOnError || (i = i.catch(Y)), o.state.fetchStatus === "paused" ? Promise.resolve() : i;
    }));
    return Promise.all(n).then(Y);
  }
  async query(e) {
    const t = this.defaultQueryOptions(e);
    t.retry === void 0 && (t.retry = !1);
    const r = this.#e.build(this, t), n = r.isStaleByTime(bt(t.staleTime, r)) ? await r.fetch(t) : r.state.data, o = t.select;
    return o ? o(n) : n;
  }
  fetchQuery(e) {
    const t = this.defaultQueryOptions(e);
    t.retry === void 0 && (t.retry = !1);
    const r = this.#e.build(this, t);
    return r.isStaleByTime(bt(t.staleTime, r)) ? r.fetch(t) : Promise.resolve(r.state.data);
  }
  prefetchQuery(e) {
    return this.fetchQuery(e).then(Y).catch(Y);
  }
  infiniteQuery(e) {
    return e._type = "infinite", this.query(e);
  }
  fetchInfiniteQuery(e) {
    return e._type = "infinite", this.fetchQuery(e);
  }
  prefetchInfiniteQuery(e) {
    return this.fetchInfiniteQuery(e).then(Y).catch(Y);
  }
  ensureInfiniteQueryData(e) {
    return e._type = "infinite", this.ensureQueryData(e);
  }
  resumePausedMutations() {
    return dr.isOnline() ? this.#t.resumePausedMutations() : Promise.resolve();
  }
  getQueryCache() {
    return this.#e;
  }
  getMutationCache() {
    return this.#t;
  }
  getDefaultOptions() {
    return this.#r;
  }
  setDefaultOptions(e) {
    this.#r = e;
  }
  setQueryDefaults(e, t) {
    this.#n.set(At(e), {
      queryKey: e,
      defaultOptions: t
    });
  }
  getQueryDefaults(e) {
    const t = [...this.#n.values()], r = {};
    return t.forEach((n) => {
      Ye(e, n.queryKey) && Object.assign(r, n.defaultOptions);
    }), r;
  }
  setMutationDefaults(e, t) {
    this.#i.set(At(e), {
      mutationKey: e,
      defaultOptions: t
    });
  }
  getMutationDefaults(e) {
    const t = [...this.#i.values()], r = {};
    return t.forEach((n) => {
      Ye(e, n.mutationKey) && Object.assign(r, n.defaultOptions);
    }), r;
  }
  defaultQueryOptions(e) {
    if (e._defaulted) return e;
    const t = {
      ...this.#r.queries,
      ...this.getQueryDefaults(e.queryKey),
      ...e,
      _defaulted: !0
    };
    return t.queryHash || (t.queryHash = Tn(t.queryKey, t)), t.refetchOnReconnect === void 0 && (t.refetchOnReconnect = t.networkMode !== "always"), t.throwOnError === void 0 && (t.throwOnError = !!t.suspense), !t.networkMode && t.persister && (t.networkMode = "offlineFirst"), t.queryFn === ce && (t.enabled = !1), t;
  }
  defaultMutationOptions(e) {
    return e?._defaulted ? e : {
      ...this.#r.mutations,
      ...e?.mutationKey && this.getMutationDefaults(e.mutationKey),
      ...e,
      _defaulted: !0
    };
  }
  clear() {
    this.#e.clear(), this.#t.clear();
  }
};
function ot(e) {
  const t = {
    subscribe(r) {
      let n = null, o = !1, i = !1, s = !1;
      function a() {
        if (n === null) {
          s = !0;
          return;
        }
        i || (i = !0, typeof n == "function" ? n() : n && n.unsubscribe());
      }
      return n = e({
        next(c) {
          var u;
          o || (u = r.next) === null || u === void 0 || u.call(r, c);
        },
        error(c) {
          var u;
          o || (o = !0, (u = r.error) === null || u === void 0 || u.call(r, c), a());
        },
        complete() {
          var c;
          o || (o = !0, (c = r.complete) === null || c === void 0 || c.call(r), a());
        }
      }), s && a(), { unsubscribe: a };
    },
    pipe(...r) {
      return r.reduce(bu, t);
    }
  };
  return t;
}
function bu(e, t) {
  return t(e);
}
function Su(e) {
  const t = new AbortController();
  return new Promise((r, n) => {
    let o = !1;
    function i() {
      o || (o = !0, s.unsubscribe());
    }
    t.signal.addEventListener("abort", () => {
      n(t.signal.reason);
    });
    const s = e.subscribe({
      next(a) {
        o = !0, r(a), i();
      },
      error(a) {
        n(a);
      },
      complete() {
        t.abort(), i();
      }
    });
  });
}
function _u(e) {
  return (t) => {
    let r = 0, n = null;
    const o = [];
    function i() {
      n || (n = t.subscribe({
        next(a) {
          for (const u of o) {
            var c;
            (c = u.next) === null || c === void 0 || c.call(u, a);
          }
        },
        error(a) {
          for (const u of o) {
            var c;
            (c = u.error) === null || c === void 0 || c.call(u, a);
          }
        },
        complete() {
          for (const c of o) {
            var a;
            (a = c.complete) === null || a === void 0 || a.call(c);
          }
        }
      }));
    }
    function s() {
      if (r === 0 && n) {
        const a = n;
        n = null, a.unsubscribe();
      }
    }
    return ot((a) => (r++, o.push(a), i(), { unsubscribe() {
      r--, s();
      const c = o.findIndex((u) => u === a);
      c > -1 && o.splice(c, 1);
    } }));
  };
}
function Iu(e) {
  let t = e;
  const r = [], n = (s) => {
    t !== void 0 && s.next(t), r.push(s);
  }, o = (s) => {
    r.splice(r.indexOf(s), 1);
  }, i = ot((s) => (n(s), () => {
    o(s);
  }));
  return i.next = (s) => {
    if (t !== s) {
      t = s;
      for (const a of r) a.next(s);
    }
  }, i.get = () => t, i;
}
function ds(e) {
  return ot((t) => {
    function r(n = 0, o = e.op) {
      const i = e.links[n];
      if (!i) throw new Error("No more links to execute - did you forget to add an ending link?");
      return i({
        op: o,
        next(s) {
          return r(n + 1, s);
        }
      });
    }
    return r().subscribe(t);
  });
}
function ho(e) {
  return Array.isArray(e) ? e : [e];
}
function ct(e) {
  return (t) => {
    const r = ho(e.true).map((o) => o(t)), n = ho(e.false).map((o) => o(t));
    return (o) => ot((i) => {
      const s = e.condition(o.op) ? r : n;
      return ds({
        op: o.op,
        links: s
      }).subscribe(i);
    });
  };
}
function Pt(e) {
  "@babel/helpers - typeof";
  return Pt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pt(e);
}
function Eu(e, t) {
  if (Pt(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t || "default");
    if (Pt(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Au(e) {
  var t = Eu(e, "string");
  return Pt(t) == "symbol" ? t : t + "";
}
function B(e, t, r) {
  return (t = Au(t)) in e ? Object.defineProperty(e, t, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = r, e;
}
function po(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function M(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? po(Object(r), !0).forEach(function(n) {
      B(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : po(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Se(e) {
  return !!e && !Array.isArray(e) && typeof e == "object";
}
function Pu(e) {
  return typeof e == "function";
}
function Tu() {
  return /* @__PURE__ */ Object.create(null);
}
var Ou = typeof Symbol == "function" && !!Symbol.asyncIterator;
function Ru(e) {
  return Ou && Se(e) && Symbol.asyncIterator in e;
}
var Cu = (e) => e(), jt = {
  PARSE_ERROR: -32700,
  BAD_REQUEST: -32600,
  INTERNAL_SERVER_ERROR: -32603,
  NOT_IMPLEMENTED: -32603,
  BAD_GATEWAY: -32603,
  SERVICE_UNAVAILABLE: -32603,
  GATEWAY_TIMEOUT: -32603,
  UNAUTHORIZED: -32001,
  PAYMENT_REQUIRED: -32002,
  FORBIDDEN: -32003,
  NOT_FOUND: -32004,
  METHOD_NOT_SUPPORTED: -32005,
  TIMEOUT: -32008,
  CONFLICT: -32009,
  PRECONDITION_FAILED: -32012,
  PAYLOAD_TOO_LARGE: -32013,
  UNSUPPORTED_MEDIA_TYPE: -32015,
  UNPROCESSABLE_CONTENT: -32022,
  PRECONDITION_REQUIRED: -32028,
  TOO_MANY_REQUESTS: -32029,
  CLIENT_CLOSED_REQUEST: -32099
}, Mb = [
  jt.BAD_GATEWAY,
  jt.SERVICE_UNAVAILABLE,
  jt.GATEWAY_TIMEOUT,
  jt.INTERNAL_SERVER_ERROR
], fs = () => {
}, mo = (e) => {
  Object.freeze && Object.freeze(e);
};
function hs(e, t, r) {
  var n;
  const o = t.join(".");
  return (n = r[o]) !== null && n !== void 0 || (r[o] = new Proxy(fs, {
    get(i, s) {
      if (!(typeof s != "string" || s === "then"))
        return hs(e, [...t, s], r);
    },
    apply(i, s, a) {
      const c = t[t.length - 1];
      if (c === "valueOf" || c === "toString" || c === "toJSON") return `tRPC.proxy(${t.slice(0, -1).join(".")})`;
      let u = {
        args: a,
        path: t
      };
      return c === "call" ? u = {
        args: a.length >= 2 ? [a[1]] : [],
        path: t.slice(0, -1)
      } : c === "apply" && (u = {
        args: a.length >= 2 ? a[1] : [],
        path: t.slice(0, -1)
      }), mo(u.args), mo(u.path), e(u);
    }
  })), r[o];
}
var ps = (e) => hs(e, [], Tu()), ku = (e) => new Proxy(fs, { get(t, r) {
  if (r !== "then")
    return e(r);
} });
function Tt(e) {
  "@babel/helpers - typeof";
  return Tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Tt(e);
}
function Nu(e, t) {
  if (Tt(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t || "default");
    if (Tt(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Mu(e) {
  var t = Nu(e, "string");
  return Tt(t) == "symbol" ? t : t + "";
}
function an(e, t, r) {
  return (t = Mu(t)) in e ? Object.defineProperty(e, t, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = r, e;
}
function go(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function qt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? go(Object(r), !0).forEach(function(n) {
      an(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : go(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
var Du = class extends Error {
  constructor(e) {
    super($u(e)), Object.assign(this, e);
  }
};
function $u(e) {
  if ("message" in e) return String(e.message);
}
function Lu(e) {
  if (e instanceof Error) return e;
  const t = typeof e;
  if (!(t === "undefined" || t === "function" || e === null)) {
    if (t !== "object") return new Error(String(e));
    if (Se(e)) return new Du(e);
  }
}
var vo = class extends Error {
  constructor(e) {
    var t, r, n;
    const o = Lu(e.cause), i = (t = (r = e.message) !== null && r !== void 0 ? r : o?.message) !== null && t !== void 0 ? t : e.code;
    super(i, { cause: o }), an(this, "cause", void 0), an(this, "code", void 0), this.code = e.code, this.name = "TRPCError", (n = this.cause) !== null && n !== void 0 || (this.cause = o);
  }
};
function Uu(e, t) {
  if ("error" in e) {
    const r = t.deserialize(e.error);
    return {
      ok: !1,
      error: qt(qt({}, e), {}, { error: r })
    };
  }
  return {
    ok: !0,
    result: qt(qt({}, e.result), (!e.result.type || e.result.type === "data") && {
      type: "data",
      data: t.deserialize(e.result.data)
    })
  };
}
var Lr = class extends Error {
  constructor() {
    super("Unable to transform response from server");
  }
};
function ms(e, t) {
  let r;
  try {
    r = Uu(e, t);
  } catch {
    throw new Lr();
  }
  if (!r.ok && (!Se(r.error.error) || typeof r.error.error.code != "number")) throw new Lr();
  if (r.ok && !Se(r.result)) throw new Lr();
  return r;
}
function xu(e) {
  return typeof e == "function";
}
async function zu(e, t) {
  const { _def: r } = e;
  let n = r.procedures[t];
  for (; !n; ) {
    const o = Object.keys(r.lazy).find((i) => t === i || t.startsWith(i + "."));
    if (!o) return null;
    await r.lazy[o].load(), n = r.procedures[t];
  }
  return n;
}
async function Fu(e) {
  const { type: t, path: r } = e, n = await zu(e.router, r);
  if (!n || !xu(n) || n._def.type !== t && !e.allowMethodOverride) throw new vo({
    code: "NOT_FOUND",
    message: `No "${t}"-procedure on path "${r}"`
  });
  if (n._def.type !== t && e.allowMethodOverride && n._def.type === "subscription") throw new vo({
    code: "METHOD_NOT_SUPPORTED",
    message: "Method override is not supported for subscriptions"
  });
  return n(e);
}
function ju(e) {
  return e instanceof Ue;
}
function qu(e) {
  return Se(e) && Se(e.error) && typeof e.error.code == "number" && typeof e.error.message == "string";
}
function Zu(e, t) {
  return typeof e == "string" ? e : Se(e) && typeof e.message == "string" ? e.message : t;
}
var Ue = class tr extends Error {
  constructor(t, r) {
    var n, o;
    const i = r?.cause;
    super(t, { cause: i }), B(this, "cause", void 0), B(this, "shape", void 0), B(this, "data", void 0), B(this, "meta", void 0), this.meta = r?.meta, this.cause = i, this.shape = r == null || (n = r.result) === null || n === void 0 ? void 0 : n.error, this.data = r == null || (o = r.result) === null || o === void 0 ? void 0 : o.error.data, this.name = "TRPCClientError", Object.setPrototypeOf(this, tr.prototype);
  }
  static from(t, r = {}) {
    const n = t;
    return ju(n) ? (r.meta && (n.meta = M(M({}, n.meta), r.meta)), n) : qu(n) ? new tr(n.error.message, M(M({}, r), {}, {
      result: n,
      cause: r.cause
    })) : new tr(Zu(n, "Unknown error"), M(M({}, r), {}, { cause: n }));
  }
};
function Bu(e) {
  const t = e;
  return t ? "input" in t ? t : {
    input: t,
    output: t
  } : {
    input: {
      serialize: (r) => r,
      deserialize: (r) => r
    },
    output: {
      serialize: (r) => r,
      deserialize: (r) => r
    }
  };
}
var yo = (e) => typeof e == "function";
function Gu(e) {
  if (e) return e;
  if (typeof window < "u" && yo(window.fetch)) return window.fetch.bind(window);
  if (typeof globalThis < "u" && yo(globalThis.fetch)) return globalThis.fetch;
  throw new Error("No fetch implementation found");
}
function Ku(...e) {
  const t = new AbortController(), r = e.length;
  let n = 0;
  const o = () => {
    ++n === r && t.abort();
  };
  for (const i of e) i?.aborted ? o() : i?.addEventListener("abort", o, { once: !0 });
  return t.signal;
}
function gs(...e) {
  const t = new AbortController();
  for (const r of e) r?.aborted ? t.abort() : r?.addEventListener("abort", () => t.abort(), { once: !0 });
  return t.signal;
}
function vs(e) {
  return {
    url: e.url.toString(),
    fetch: e.fetch,
    transformer: Bu(e.transformer),
    methodOverride: e.methodOverride
  };
}
function Wu(e) {
  const t = {};
  for (let r = 0; r < e.length; r++) {
    const n = e[r];
    t[r] = n;
  }
  return t;
}
var Vu = {
  query: "GET",
  mutation: "POST",
  subscription: "PATCH"
};
function ys(e) {
  return "input" in e ? e.transformer.input.serialize(e.input) : Wu(e.inputs.map((t) => e.transformer.input.serialize(t)));
}
var fr = (e) => {
  const t = e.url.split("?");
  let r = t[0].replace(/\/$/, "") + "/" + e.path;
  const n = [];
  if (t[1] && n.push(t[1]), "inputs" in e && n.push("batch=1"), e.type === "query" || e.type === "subscription") {
    const o = ys(e);
    o !== void 0 && e.methodOverride !== "POST" && n.push(`input=${encodeURIComponent(JSON.stringify(o))}`);
  }
  return n.length && (r += "?" + n.join("&")), r;
}, Hu = (e) => {
  if (e.type === "query" && e.methodOverride !== "POST") return;
  const t = ys(e);
  return t !== void 0 ? JSON.stringify(t) : void 0;
}, ws = (e) => cn(M(M({}, e), {}, {
  contentTypeHeader: "application/json",
  getUrl: fr,
  getBody: Hu
})), Ju = class extends Error {
  constructor() {
    const e = "AbortError";
    super(e), this.name = e, this.message = e;
  }
}, Qu = (e) => {
  var t;
  if (e?.aborted)
    throw (t = e.throwIfAborted) === null || t === void 0 || t.call(e), typeof DOMException < "u" ? new DOMException("AbortError", "AbortError") : new Ju();
};
async function Yu(e) {
  var t, r;
  Qu(e.signal);
  const n = e.getUrl(e), o = e.getBody(e), i = (t = e.methodOverride) !== null && t !== void 0 ? t : Vu[e.type], s = await (async () => {
    const c = await e.headers();
    return Symbol.iterator in c ? Object.fromEntries(c) : c;
  })(), a = M(M(M({}, e.contentTypeHeader && i !== "GET" ? { "content-type": e.contentTypeHeader } : {}), e.trpcAcceptHeader ? { [(r = e.trpcAcceptHeaderKey) !== null && r !== void 0 ? r : "trpc-accept"]: e.trpcAcceptHeader } : void 0), s);
  return Gu(e.fetch)(n, {
    method: i,
    signal: e.signal,
    body: o,
    headers: a
  });
}
async function cn(e) {
  const t = {}, r = await Yu(e);
  t.response = r;
  const n = await r.json();
  return t.responseJSON = n, {
    json: n,
    meta: t
  };
}
function Xu(e) {
  return e instanceof Uint8Array || e instanceof Blob;
}
function el(e) {
  return e instanceof FormData;
}
var tl = (e) => {
  if ("input" in e) {
    const { input: t } = e;
    if (el(t)) {
      if (e.type !== "mutation" && e.methodOverride !== "POST") throw new Error("FormData is only supported for mutations");
      return cn(M(M({}, e), {}, {
        contentTypeHeader: void 0,
        getUrl: fr,
        getBody: () => t
      }));
    }
    if (Xu(t)) {
      if (e.type !== "mutation" && e.methodOverride !== "POST") throw new Error("Octet type input is only supported for mutations");
      return cn(M(M({}, e), {}, {
        contentTypeHeader: "application/octet-stream",
        getUrl: fr,
        getBody: () => t
      }));
    }
  }
  return ws(e);
};
function rl(e) {
  const t = vs(e);
  return () => (r) => {
    const { op: n } = r;
    return ot((o) => {
      const { path: i, input: s, type: a } = n;
      if (a === "subscription") throw new Error("Subscriptions are unsupported by `httpLink` - use `httpSubscriptionLink` or `wsLink`");
      const c = new AbortController(), u = tl(M(M({}, t), {}, {
        type: a,
        path: i,
        input: s,
        signal: gs(n.signal, c.signal),
        headers() {
          return e.headers ? typeof e.headers == "function" ? e.headers({ op: n }) : e.headers : {};
        }
      }));
      let l = !1, f;
      return u.then((d) => {
        l = !0, f = d.meta;
        const h = ms(d.json, t.transformer.output);
        if (!h.ok) {
          o.error(Ue.from(h.error, { meta: f }));
          return;
        }
        o.next({
          context: d.meta,
          result: h.result
        }), o.complete();
      }).catch((d) => {
        l = !0, o.error(Ue.from(d, { meta: f }));
      }), () => {
        l || c.abort();
      };
    });
  };
}
var wo = () => {
  throw new Error("Something went wrong. Please submit an issue at https://github.com/trpc/trpc/issues/new");
};
function bo(e) {
  let t = null, r = null;
  const n = () => {
    clearTimeout(r), r = null, t = null;
  };
  function o(a) {
    const c = [[]];
    let u = 0;
    for (; ; ) {
      const d = a[u];
      if (!d) break;
      const h = c[c.length - 1];
      if (d.aborted) {
        var l;
        (l = d.reject) === null || l === void 0 || l.call(d, /* @__PURE__ */ new Error("Aborted")), u++;
        continue;
      }
      if (e.validate(h.concat(d).map((g) => g.key))) {
        h.push(d), u++;
        continue;
      }
      if (h.length === 0) {
        var f;
        (f = d.reject) === null || f === void 0 || f.call(d, /* @__PURE__ */ new Error("Input is too big for a single dispatch")), u++;
        continue;
      }
      c.push([]);
    }
    return c;
  }
  function i() {
    const a = o(t);
    n();
    for (const c of a) {
      if (!c.length) continue;
      const u = { items: c };
      for (const l of c) l.batch = u;
      e.fetch(u.items.map((l) => l.key)).then(async (l) => {
        await Promise.all(l.map(async (d, h) => {
          const g = u.items[h];
          try {
            var v;
            const b = await Promise.resolve(d);
            (v = g.resolve) === null || v === void 0 || v.call(g, b);
          } catch (b) {
            var w;
            (w = g.reject) === null || w === void 0 || w.call(g, b);
          }
          g.batch = null, g.reject = null, g.resolve = null;
        }));
        for (const d of u.items) {
          var f;
          (f = d.reject) === null || f === void 0 || f.call(d, /* @__PURE__ */ new Error("Missing result")), d.batch = null;
        }
      }).catch((l) => {
        for (const d of u.items) {
          var f;
          (f = d.reject) === null || f === void 0 || f.call(d, l), d.batch = null;
        }
      });
    }
  }
  function s(a) {
    var c;
    const u = {
      aborted: !1,
      key: a,
      batch: null,
      resolve: wo,
      reject: wo
    }, l = new Promise((f, d) => {
      var h;
      u.reject = d, u.resolve = f, (h = t) !== null && h !== void 0 || (t = []), t.push(u);
    });
    return (c = r) !== null && c !== void 0 || (r = setTimeout(i)), l;
  }
  return { load: s };
}
function ut(e) {
  var t, r;
  const n = vs(e), o = (t = e.maxURLLength) !== null && t !== void 0 ? t : 1 / 0, i = (r = e.maxItems) !== null && r !== void 0 ? r : 1 / 0;
  return () => {
    const s = (c) => ({
      validate(u) {
        if (o === 1 / 0 && i === 1 / 0) return !0;
        if (u.length > i) return !1;
        const l = u.map((d) => d.path).join(","), f = u.map((d) => d.input);
        return fr(M(M({}, n), {}, {
          type: c,
          path: l,
          inputs: f,
          signal: null
        })).length <= o;
      },
      async fetch(u) {
        const l = u.map((g) => g.path).join(","), f = u.map((g) => g.input), d = Ku(...u.map((g) => g.signal)), h = await ws(M(M({}, n), {}, {
          path: l,
          inputs: f,
          type: c,
          headers() {
            return e.headers ? typeof e.headers == "function" ? e.headers({ opList: u }) : e.headers : {};
          },
          signal: d
        }));
        return (Array.isArray(h.json) ? h.json : u.map(() => h.json)).map((g) => ({
          meta: h.meta,
          json: g
        }));
      }
    }), a = {
      query: bo(s("query")),
      mutation: bo(s("mutation"))
    };
    return ({ op: c }) => ot((u) => {
      if (c.type === "subscription") throw new Error("Subscriptions are unsupported by `httpLink` - use `httpSubscriptionLink` or `wsLink`");
      const l = new AbortController(), f = a[c.type].load(M(M({}, c), {}, { signal: gs(c.signal, l.signal) }));
      let d = !1, h;
      return f.then((g) => {
        d = !0, h = g;
        const v = ms(g.json, n.transformer.output);
        if (!v.ok) {
          u.error(Ue.from(v.error, { meta: g.meta }));
          return;
        }
        u.next({
          context: g.meta,
          result: v.result
        }), u.complete();
      }).catch((g) => {
        d = !0, u.error(Ue.from(g, { meta: h?.meta }));
      }), () => {
        d || l.abort();
      };
    });
  };
}
var bs = (e, ...t) => typeof e == "function" ? e(...t) : e;
function nl() {
  let e, t;
  return {
    promise: new Promise((r, n) => {
      e = r, t = n;
    }),
    resolve: e,
    reject: t
  };
}
async function ol(e) {
  const t = await bs(e.url);
  return e.connectionParams ? t + `${t.includes("?") ? "&" : "?"}connectionParams=1` : t;
}
async function il(e, t) {
  const r = {
    method: "connectionParams",
    data: await bs(e)
  };
  return t.encode(r);
}
function sl(e) {
  const { promise: t, resolve: r, reject: n } = nl();
  return e.addEventListener("open", () => {
    e.removeEventListener("error", n), r();
  }), e.addEventListener("error", n), t;
}
function al(e, { intervalMs: t, pongTimeoutMs: r }) {
  let n, o;
  function i() {
    n = setTimeout(() => {
      e.send("PING"), o = setTimeout(() => {
        e.close();
      }, r);
    }, t);
  }
  function s() {
    clearTimeout(n), i();
  }
  function a() {
    clearTimeout(o), s();
  }
  e.addEventListener("open", i), e.addEventListener("message", ({ data: c }) => {
    clearTimeout(n), i(), c === "PONG" && a();
  }), e.addEventListener("close", () => {
    clearTimeout(n), clearTimeout(o);
  });
}
var cl = class un {
  constructor(t) {
    var r;
    if (B(this, "id", ++un.connectCount), B(this, "WebSocketPonyfill", void 0), B(this, "urlOptions", void 0), B(this, "keepAliveOpts", void 0), B(this, "encoder", void 0), B(this, "wsObservable", Iu(null)), B(this, "openPromise", null), this.WebSocketPonyfill = (r = t.WebSocketPonyfill) !== null && r !== void 0 ? r : WebSocket, !this.WebSocketPonyfill) throw new Error("No WebSocket implementation found - you probably don't want to use this on the server, but if you do you need to pass a `WebSocket`-ponyfill");
    this.urlOptions = t.urlOptions, this.keepAliveOpts = t.keepAlive, this.encoder = t.encoder;
  }
  get ws() {
    return this.wsObservable.get();
  }
  set ws(t) {
    this.wsObservable.next(t);
  }
  isOpen() {
    return !!this.ws && this.ws.readyState === this.WebSocketPonyfill.OPEN && !this.openPromise;
  }
  isClosed() {
    return !!this.ws && (this.ws.readyState === this.WebSocketPonyfill.CLOSING || this.ws.readyState === this.WebSocketPonyfill.CLOSED);
  }
  async open() {
    if (this.openPromise) return this.openPromise;
    this.id = ++un.connectCount;
    const t = ol(this.urlOptions).then((r) => new this.WebSocketPonyfill(r));
    this.openPromise = t.then(async (r) => {
      this.ws = r, r.binaryType = "arraybuffer", r.addEventListener("message", function({ data: n }) {
        n === "PING" && this.send("PONG");
      }), this.keepAliveOpts.enabled && al(r, this.keepAliveOpts), r.addEventListener("close", () => {
        this.ws === r && (this.ws = null);
      }), await sl(r), this.urlOptions.connectionParams && r.send(await il(this.urlOptions.connectionParams, this.encoder));
    });
    try {
      await this.openPromise;
    } finally {
      this.openPromise = null;
    }
  }
  async close() {
    try {
      await this.openPromise;
    } finally {
      var t;
      (t = this.ws) === null || t === void 0 || t.close();
    }
  }
};
B(cl, "connectCount", 0);
var Ss = class {
  constructor(e) {
    B(this, "links", void 0), B(this, "runtime", void 0), B(this, "requestId", void 0), this.requestId = 0, this.runtime = {}, this.links = e.links.map((t) => t(this.runtime));
  }
  $request(e) {
    var t;
    return ds({
      links: this.links,
      op: M(M({}, e), {}, {
        context: (t = e.context) !== null && t !== void 0 ? t : {},
        id: ++this.requestId
      })
    }).pipe(_u());
  }
  async requestAsPromise(e) {
    try {
      const t = this.$request(e);
      return (await Su(t)).result.data;
    } catch (t) {
      throw Ue.from(t);
    }
  }
  query(e, t, r) {
    return this.requestAsPromise({
      type: "query",
      path: e,
      input: t,
      context: r?.context,
      signal: r?.signal
    });
  }
  mutation(e, t, r) {
    return this.requestAsPromise({
      type: "mutation",
      path: e,
      input: t,
      context: r?.context,
      signal: r?.signal
    });
  }
  subscription(e, t, r) {
    return this.$request({
      type: "subscription",
      path: e,
      input: t,
      context: r.context,
      signal: r.signal
    }).subscribe({
      next(n) {
        switch (n.result.type) {
          case "state":
            var o;
            (o = r.onConnectionStateChange) === null || o === void 0 || o.call(r, n.result);
            break;
          case "started":
            var i;
            (i = r.onStarted) === null || i === void 0 || i.call(r, { context: n.context });
            break;
          case "stopped":
            var s;
            (s = r.onStopped) === null || s === void 0 || s.call(r);
            break;
          case "data":
          case void 0:
            var a;
            (a = r.onData) === null || a === void 0 || a.call(r, n.result.data);
        }
      },
      error(n) {
        var o;
        (o = r.onError) === null || o === void 0 || o.call(r, n);
      },
      complete() {
        var n;
        (n = r.onComplete) === null || n === void 0 || n.call(r);
      }
    });
  }
}, _s = /* @__PURE__ */ Symbol.for("trpc_untypedClient"), ul = {
  query: "query",
  mutate: "mutation",
  subscribe: "subscription"
}, ll = (e) => ul[e];
function dl(e) {
  const t = ps(({ path: r, args: n }) => {
    const o = [...r], i = ll(o.pop()), s = o.join(".");
    return e[i](s, ...n);
  });
  return ku((r) => r === _s ? e : t[r]);
}
function fl(e) {
  return dl(new Ss(e));
}
function hl(e) {
  return e[_s];
}
function pl(e, t) {
  this.v = e, this.k = t;
}
function Zt(e) {
  var t, r;
  function n(i, s) {
    try {
      var a = e[i](s), c = a.value, u = c instanceof pl;
      Promise.resolve(u ? c.v : c).then(function(l) {
        if (u) {
          var f = i === "return" ? "return" : "next";
          if (!c.k || l.done) return n(f, l);
          l = e[f](l).value;
        }
        o(a.done ? "return" : "normal", l);
      }, function(l) {
        n("throw", l);
      });
    } catch (l) {
      o("throw", l);
    }
  }
  function o(i, s) {
    switch (i) {
      case "return":
        t.resolve({
          value: s,
          done: !0
        });
        break;
      case "throw":
        t.reject(s);
        break;
      default:
        t.resolve({
          value: s,
          done: !1
        });
    }
    (t = t.next) ? n(t.key, t.arg) : r = null;
  }
  this._invoke = function(i, s) {
    return new Promise(function(a, c) {
      var u = {
        key: i,
        arg: s,
        resolve: a,
        reject: c,
        next: null
      };
      r ? r = r.next = u : (t = r = u, n(i, s));
    });
  }, typeof e.return != "function" && (this.return = void 0);
}
Zt.prototype[typeof Symbol == "function" && Symbol.asyncIterator || "@@asyncIterator"] = function() {
  return this;
}, Zt.prototype.next = function(e) {
  return this._invoke("next", e);
}, Zt.prototype.throw = function(e) {
  return this._invoke("throw", e);
}, Zt.prototype.return = function(e) {
  return this._invoke("return", e);
};
var Te = /* @__PURE__ */ Zc(Gc(), 1);
function Ot(e) {
  "@babel/helpers - typeof";
  return Ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ot(e);
}
function ml(e, t) {
  if (Ot(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t || "default");
    if (Ot(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function gl(e) {
  var t = ml(e, "string");
  return Ot(t) == "symbol" ? t : t + "";
}
function vl(e, t, r) {
  return (t = gl(t)) in e ? Object.defineProperty(e, t, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = r, e;
}
function So(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function C(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? So(Object(r), !0).forEach(function(n) {
      vl(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : So(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function yl(e) {
  var t, r, n, o = 2;
  for (typeof Symbol < "u" && (r = Symbol.asyncIterator, n = Symbol.iterator); o--; ) {
    if (r && (t = e[r]) != null) return t.call(e);
    if (n && (t = e[n]) != null) return new rr(t.call(e));
    r = "@@asyncIterator", n = "@@iterator";
  }
  throw new TypeError("Object is not async iterable");
}
function rr(e) {
  function t(r) {
    if (Object(r) !== r) return Promise.reject(/* @__PURE__ */ new TypeError(r + " is not an object."));
    var n = r.done;
    return Promise.resolve(r.value).then(function(o) {
      return {
        value: o,
        done: n
      };
    });
  }
  return rr = function(n) {
    this.s = n, this.n = n.next;
  }, rr.prototype = {
    s: null,
    n: null,
    next: function() {
      return t(this.n.apply(this.s, arguments));
    },
    return: function(n) {
      var o = this.s.return;
      return o === void 0 ? Promise.resolve({
        value: n,
        done: !0
      }) : t(o.apply(this.s, arguments));
    },
    throw: function(n) {
      var o = this.s.return;
      return o === void 0 ? Promise.reject(n) : t(o.apply(this.s, arguments));
    }
  }, new rr(e);
}
function wl(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e) if ({}.hasOwnProperty.call(e, n)) {
    if (t.includes(n)) continue;
    r[n] = e[n];
  }
  return r;
}
function bl(e, t) {
  if (e == null) return {};
  var r, n, o = wl(e, t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    for (n = 0; n < i.length; n++) r = i[n], t.includes(r) || {}.propertyIsEnumerable.call(e, r) && (o[r] = e[r]);
  }
  return o;
}
var Sl = ["cursor", "direction"];
function Pr(e) {
  return { path: e.path.join(".") };
}
function _l(e) {
  return e.length >= 3;
}
function Il(e) {
  return _l(e) ? {
    type: "prefixed",
    prefix: e[0],
    path: e[1],
    args: e[2]
  } : {
    type: "unprefixed",
    prefix: void 0,
    path: e[0],
    args: e[1]
  };
}
function On(e, t, r) {
  var n;
  const o = Il(e);
  let i = (n = o.args) === null || n === void 0 ? void 0 : n.input;
  if (r) {
    var s, a;
    i = C(C(C({}, (s = (a = o.args) === null || a === void 0 ? void 0 : a.input) !== null && s !== void 0 ? s : {}), r.pageParam !== void 0 ? { cursor: r.pageParam } : {}), {}, { direction: r.direction });
  }
  return [
    o.path.join("."),
    i,
    t?.trpc
  ];
}
async function El(e, t, r) {
  const n = t.getQueryCache().build(t, { queryKey: r });
  n.setState({
    data: [],
    status: "success"
  });
  const o = [];
  var i = !1, s = !1, a;
  try {
    for (var c = yl(e), u; i = !(u = await c.next()).done; i = !1) {
      const l = u.value;
      o.push(l), n.setState({ data: [...o] });
    }
  } catch (l) {
    s = !0, a = l;
  } finally {
    try {
      i && c.return != null && await c.return();
    } finally {
      if (s) throw a;
    }
  }
  return o;
}
function le(e) {
  const t = Cu(() => {
    const { input: r, type: n } = e, o = e.path.flatMap((i) => i.split("."));
    if (!r && n === "any") return o.length ? [o] : [];
    if (n === "infinite" && Se(r) && ("direction" in r || "cursor" in r)) {
      const { cursor: i, direction: s } = r;
      return [o, {
        input: bl(r, Sl),
        type: "infinite"
      }];
    }
    return [o, C(C({}, typeof r < "u" && r !== ce && { input: r }), n && n !== "any" && { type: n })];
  });
  return e.prefix && t.unshift([e.prefix]), t;
}
function Is(e) {
  const t = [e.path.flatMap((r) => r.split("."))];
  return e.prefix && t.unshift([e.prefix]), t;
}
function Rn(e) {
  return Pu(e) ? e() : e;
}
function Al(e) {
  var t;
  const { input: r, query: n, path: o, queryKey: i, opts: s } = e, a = r === ce, c = async (u) => {
    var l;
    const f = C(C({}, s), {}, { trpc: C(C({}, s?.trpc), !(s == null || (l = s.trpc) === null || l === void 0) && l.abortOnUnmount ? { signal: u.signal } : { signal: null }) });
    return await n(...On(i, f, {
      direction: u.direction,
      pageParam: u.pageParam
    }));
  };
  return Object.assign(C(C({}, s ?? {}), {}, {
    queryKey: i,
    queryFn: a ? ce : c,
    initialPageParam: (t = s?.initialCursor) !== null && t !== void 0 ? t : r?.cursor
  }), { trpc: Pr({ path: o }) });
}
function Pl(e) {
  var t, r;
  const { mutate: n, path: o, prefix: i, opts: s, overrides: a } = e, c = Rn(e.queryClient), u = Is({
    path: o,
    prefix: (t = s?.keyPrefix) !== null && t !== void 0 ? t : i
  }), l = c.defaultMutationOptions(c.getMutationDefaults(u)), f = (r = a?.onSuccess) !== null && r !== void 0 ? r : ((h) => h.originalFn()), d = async (h) => await n(...On([...u, { input: h }], s));
  return C(C({}, s), {}, {
    mutationKey: u,
    mutationFn: d,
    onSuccess(...h) {
      var g, v;
      return f({
        originalFn: () => {
          var b, S, A;
          return (b = s == null || (S = s.onSuccess) === null || S === void 0 ? void 0 : S.call(s, ...h)) !== null && b !== void 0 ? b : l == null || (A = l.onSuccess) === null || A === void 0 ? void 0 : A.call(l, ...h);
        },
        queryClient: c,
        meta: (g = (v = s?.meta) !== null && v !== void 0 ? v : l?.meta) !== null && g !== void 0 ? g : {}
      });
    },
    trpc: Pr({ path: o })
  });
}
function Tl(e) {
  const { input: t, query: r, path: n, queryKey: o, opts: i } = e, s = Rn(e.queryClient), a = t === ce, c = async (u) => {
    var l;
    const f = C(C({}, i), {}, { trpc: C(C({}, i?.trpc), !(i == null || (l = i.trpc) === null || l === void 0) && l.abortOnUnmount ? { signal: u.signal } : { signal: null }) }), d = u.queryKey, h = await r(...On(d, f));
    return Ru(h) ? El(h, s, d) : h;
  };
  return Object.assign(C(C({}, i), {}, {
    queryKey: o,
    queryFn: a ? ce : c
  }), { trpc: Pr({ path: n }) });
}
var Ol = (e) => {
  const { subscribe: t, path: r, queryKey: n, input: o, opts: i = {} } = e, s = "enabled" in i ? !!i.enabled : o !== ce, a = (c) => t(r.join("."), o === ce ? void 0 : o, c);
  return C(C({}, i), {}, {
    enabled: s,
    subscribe: a,
    queryKey: n,
    trpc: Pr({ path: r })
  });
};
function Es(e) {
  const t = e.keyPrefix, r = (n) => (o, i, s) => "router" in e ? Promise.resolve(Rn(e.ctx)).then((a) => Fu({
    router: e.router,
    path: o,
    getRawInput: async () => i,
    ctx: a,
    type: n,
    signal: void 0,
    batchIndex: 0
  })) : (e.client instanceof Ss ? e.client : hl(e.client))[n](o, i, s);
  return ps(({ args: n, path: o }) => {
    const i = [...o], s = i.pop(), [a, c] = n;
    return {
      "~types": void 0,
      pathKey: () => le({
        path: i,
        type: "any",
        prefix: t
      }),
      pathFilter: () => C(C({}, a), {}, { queryKey: le({
        path: i,
        type: "any",
        prefix: t
      }) }),
      queryOptions: () => Tl({
        input: a,
        opts: c,
        path: i,
        queryClient: e.queryClient,
        queryKey: le({
          path: i,
          input: a,
          type: "query",
          prefix: t
        }),
        query: r("query")
      }),
      queryKey: () => le({
        path: i,
        input: a,
        type: "query",
        prefix: t
      }),
      queryFilter: () => C(C({}, c), {}, { queryKey: le({
        path: i,
        input: a,
        type: "query",
        prefix: t
      }) }),
      infiniteQueryOptions: () => Al({
        input: a,
        opts: c,
        path: i,
        queryClient: e.queryClient,
        queryKey: le({
          path: i,
          input: a,
          type: "infinite",
          prefix: t
        }),
        query: r("query")
      }),
      infiniteQueryKey: () => le({
        path: i,
        input: a,
        type: "infinite",
        prefix: t
      }),
      infiniteQueryFilter: () => C(C({}, c), {}, { queryKey: le({
        path: i,
        input: a,
        type: "infinite",
        prefix: t
      }) }),
      mutationOptions: () => {
        var u;
        return Pl({
          opts: a,
          path: i,
          prefix: t,
          queryClient: e.queryClient,
          mutate: r("mutation"),
          overrides: (u = e.overrides) === null || u === void 0 ? void 0 : u.mutations
        });
      },
      mutationKey: () => Is({
        path: i,
        prefix: t
      }),
      subscriptionOptions: () => Ol({
        opts: c,
        path: i,
        input: a,
        queryKey: le({
          path: i,
          input: a,
          type: "any",
          prefix: t
        }),
        subscribe: r("subscription")
      })
    }[s]();
  });
}
function Rl() {
  const e = Te.createContext(null), t = Te.createContext(null), r = (i) => {
    const s = Te.useMemo(() => Es({
      client: i.trpcClient,
      queryClient: i.queryClient,
      keyPrefix: i.keyPrefix
    }), [
      i.trpcClient,
      i.queryClient,
      i.keyPrefix
    ]);
    return /* @__PURE__ */ Te.createElement(e.Provider, { value: i.trpcClient }, /* @__PURE__ */ Te.createElement(t.Provider, { value: s }, i.children));
  };
  r.displayName = "TRPCProvider";
  function n() {
    const i = Te.useContext(t);
    if (!i) throw new Error("useTRPC() can only be used inside of a <TRPCProvider>");
    return i;
  }
  function o() {
    const i = Te.useContext(e);
    if (!i) throw new Error("useTRPCClient() can only be used inside of a <TRPCProvider>");
    return i;
  }
  return {
    TRPCProvider: r,
    useTRPC: n,
    useTRPCClient: o
  };
}
var Cl = "http://127.0.0.1:21520";
function kl(e) {
  return e?.DEV && e.MODE !== "test" ? e.VITE_AUX_DAEMON_BASE_URL?.trim() || "http://127.0.0.1:21521" : Cl;
}
var Je = kl({
  BASE_URL: "/",
  DEV: !1,
  MODE: "production",
  PROD: !0,
  SSR: !1,
  TSS_INLINE_CSS_ENABLED: "false",
  VITE_AUX_DAEMON_AUTH_TOKEN: "",
  VITE_DEPLOYMENT_ENVIRONMENT: "extension"
});
function As(e, t) {
  const r = new URL(e);
  if (r.protocol === "http:" && (r.protocol = "ws:"), r.protocol === "https:" && (r.protocol = "wss:"), t)
    for (const [n, o] of Object.entries(t)) o !== void 0 && r.searchParams.set(n, String(o));
  return r.toString();
}
var Nl = 1e4, _o = 1e4, Ml = "Missing or invalid daemon Authorization.", Io = "Daemon startup is still in progress.", Dl = [
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  "http://[::1]:5175"
], $l = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), Ll = (e) => btoa(String.fromCharCode(...e)), Oe = class extends Error {
  phase;
  status;
  constructor(e, t, r) {
    super(e), this.phase = t, this.status = r, this.name = "DaemonAuthError";
  }
};
function lt(e) {
  return e instanceof Error ? e.message : String(e);
}
function Ul(e) {
  const t = () => globalThis.chrome?.storage;
  let r = null;
  const n = Promise.all([Promise.resolve().then(() => auxWorkerPhysical("chrome-local-remove",()=>t()?.local?.remove(e.key))).catch(() => {
  }), Promise.resolve().then(() => globalThis.localStorage?.removeItem(e.key)).catch(() => {
  })]);
  return {
    get: async () => {
      await n;
      let o = r;
      try {
        const i = t()?.session;
        i && (o = (await i.get(e.key))[e.key] ?? null);
      } catch {
      }
      if (!o) return null;
      try {
        const { accessToken: i, cachedAt: s, expiresAt: a } = JSON.parse(o);
        if (typeof i == "string" && typeof s == "number" && typeof a == "number" && s + e.ttlMs > Date.now()) return {
          accessToken: i,
          expiresAt: new Date(a)
        };
      } catch {
      }
      return r = null, await auxWorkerPhysical("chrome-session-remove",()=>t()?.session?.remove(e.key)).catch(() => {
      }), null;
    },
    set: async (o) => {
      await n;
      const i = JSON.stringify({
        accessToken: o.accessToken,
        cachedAt: Date.now(),
        expiresAt: +o.expiresAt
      });
      r = i, await auxWorkerPhysical("chrome-session-set",()=>t()?.session?.set({[e.key]:i})).catch(() => {
      });
    },
    clear: async () => {
      await n, r = null, await auxWorkerPhysical("chrome-session-remove",()=>t()?.session?.remove(e.key)).catch(() => {
      });
    }
  };
}
async function Eo(e, t, r, n) {
  if (e.status !== t) return !1;
  try {
    const o = await e.clone().json();
    return o.error?.code === r && o.error.message === n;
  } catch {
    return !1;
  }
}
var xl = (e) => {
  const { daemonUrl: t = "http://localhost:21520", clientKind: r, signChallenge: n, storageCache: o, viteEnv: i } = e, s = async () => typeof t == "function" ? await t() : t;
  let a = null, c = null;
  const u = async () => {
    const b = await s(), S = new URL("/auth/daemon/challenge", b);
    S.searchParams.set("clientKind", r);
    let A;
    try {
      A = await fetch(S, { signal: AbortSignal.timeout(_o) });
    } catch (re) {
      throw new Oe(`Failed to request daemon auth challenge: ${lt(re)}`, "challenge");
    }
    if (!A.ok) throw new Oe(`Failed to request daemon auth challenge: ${A.status}`, "challenge", A.status);
    let R;
    try {
      R = await A.json();
    } catch (re) {
      throw new Oe(`Failed to parse daemon auth challenge: ${lt(re)}`, "challenge");
    }
    const { challenge: _, challengeId: P } = R, k = new Uint8Array([...new TextEncoder().encode("Aux Daemon Auth v1\0"), ...$l(_)]);
    let q;
    try {
      q = await n({
        challenge: _,
        signingInput: k
      });
    } catch (re) {
      throw new Oe(`Failed to sign daemon auth challenge: ${lt(re)}`, "sign");
    }
    const ze = typeof q == "string" ? q : Ll(q);
    let te;
    try {
      te = await fetch(new URL("/auth/daemon/session", b), {
        body: JSON.stringify({
          challengeId: P,
          signedChallenge: ze
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
        signal: AbortSignal.timeout(_o)
      });
    } catch (re) {
      throw new Oe(`Failed to exchange daemon auth challenge: ${lt(re)}`, "session");
    }
    if (!te.ok) throw new Oe(`Failed to exchange daemon auth challenge: ${te.status}`, "session", te.status);
    let Pe;
    try {
      Pe = await te.json();
    } catch (re) {
      throw new Oe(`Failed to parse daemon auth session: ${lt(re)}`, "session");
    }
    const { access_token: st, expiresInSeconds: at } = Pe;
    return {
      accessToken: st,
      expiresAt: new Date(Date.now() + at * 1e3)
    };
  }, l = async () => {
    a = null, await d(), c = null;
  }, f = (b) => +b.expiresAt - Nl > Date.now(), d = async () => {
    try {
      await o?.clear();
    } catch {
      return;
    }
  }, h = async () => {
    try {
      const b = await o?.get();
      if (!b) return null;
      if (f(b)) return b;
    } catch {
      return await d(), null;
    }
    return await d(), null;
  }, g = async () => {
    if (i?.VITE_DEPLOYMENT_ENVIRONMENT === "web") return zl(i);
    if (a && f(a)) return a;
    const b = await h();
    return b ? (a = b, a) : (c ??= u().then(async (S) => {
      a = S;
      try {
        await o?.set(S);
      } catch {
        return S;
      }
      return S;
    }).finally(() => {
      c = null;
    }), await c);
  }, v = async (b, S) => {
    for (let A = 1; A <= 2; A++) {
      const { accessToken: R } = await g(), _ = new Headers(S?.headers);
      _.set("Authorization", `AuxDaemonSessionToken ${R}`);
      const P = {
        ...S,
        headers: _
      }, k = b instanceof Request ? new Request(b, P) : b, q = await fetch(k, b instanceof Request ? void 0 : P);
      if (await Eo(q, 503, "SERVICE_UNAVAILABLE", Io)) throw new Error(`Failed to fetch with daemon Authorization: ${Io}`);
      if (!await Eo(q, 401, "UNAUTHORIZED", Ml)) return q;
      if (A === 1) {
        await l();
        continue;
      }
      return q;
    }
    throw new Error("Failed to fetch with daemon Authorization");
  };
  return {
    clear: l,
    resolve: ()=>auxWorkerPhysical("daemon-auth-resolve",g,false),
    fetchDaemon: (request,options)=>auxWorkerPhysical("daemon-fetch",()=>v(request,options),false),
    connectWebsocketToDaemon: (b) => auxWorkerPhysical("daemon-websocket",async()=>{
      const S = await v(new URL("/auth/daemon/verify", await s()));
      if (!S.ok) throw new Error(`Unable to authorize daemon for WebSocket connection to ${b}: ${await S.text()}`);
      const { accessToken: A } = await g();
      return new WebSocket(As(b), `aux.daemon.auth.${A}`);
    },false)
  };
};
function zl(e) {
  const t = e.VITE_AUX_DAEMON_AUTH_TOKEN, r = [...Dl, e.VITE_AUX_WEB_DEV_ORIGIN].filter(Boolean);
  if (!t || !r.includes(Fl())) throw new Error("AUX_DAEMON_AUTH_TOKEN is required for localhost:5175 daemon access");
  return {
    accessToken: t,
    expiresAt: /* @__PURE__ */ new Date("9999-12-31")
  };
}
function Fl() {
  const e = globalThis;
  return e.window?.location?.origin ?? e.location?.origin ?? "";
}
function jl() {
  const e = /* @__PURE__ */ new Error("Operation aborted");
  return e.name = "AbortError", e;
}
async function Ps(e, t = {}) {
  const r = t.signal ?? void 0;
  if (!r) return await e();
  const n = () => t.createAbortError?.() ?? jl();
  if (r.aborted)
    throw await t.onAbort?.(), n();
  let o;
  const i = new Promise((s, a) => {
    o = () => {
      Promise.resolve(t.onAbort?.()).catch(() => {
      }).finally(() => {
        a(n());
      });
    }, r.addEventListener("abort", o, { once: !0 });
  });
  try {
    return await Promise.race([e(), i]);
  } finally {
    o && r.removeEventListener("abort", o);
  }
}
var ql = "agent-manager-extension", Zl = "aside.daemonAuth", Bl = 432e5, Gl = 5e3, Kl = "daemon-auth:sign-challenge";
async function Ts(e) {
  const t = typeof chrome > "u" ? void 0 : chrome.auxAccount;
  if (!t?.signDaemonAuthChallenge) throw new Error("Aux daemon Authorization requires chrome.auxAccount.signDaemonAuthChallenge");
  return (await Ps(async () => auxWorkerPhysical("native-auth-sign",()=>t.signDaemonAuthChallenge(e)), {
    signal: AbortSignal.timeout(Gl),
    createAbortError: () => /* @__PURE__ */ new Error("chrome.auxAccount.signDaemonAuthChallenge timed out")
  })).signedChallenge;
}
var Os = xl({
  clientKind: ql,
  daemonUrl: Je,
  signChallenge: async ({ challenge: e }) => {
    if (!(!("ServiceWorkerGlobalScope" in globalThis) && typeof chrome < "u" && !chrome.auxAccount?.signDaemonAuthChallenge && chrome.runtime?.sendMessage)) return Ts(e);
    const t = await chrome.runtime.sendMessage({
      type: Kl,
      challenge: e
    });
    if (!t?.ok) throw new Error(t?.error ?? "Background daemon auth signing is unavailable");
    return t.signedChallenge;
  },
  storageCache: Ul({
    key: Zl,
    ttlMs: Bl
  }),
  viteEnv: {
    BASE_URL: "/",
    DEV: !1,
    MODE: "production",
    PROD: !0,
    SSR: !1,
    TSS_INLINE_CSS_ENABLED: "false",
    VITE_AUX_DAEMON_AUTH_TOKEN: "",
    VITE_DEPLOYMENT_ENVIRONMENT: "extension"
  }
}), ve = Os.fetchDaemon, Wl = Os.connectWebsocketToDaemon, Fe = `${Je}/trpc`, Vl = /* @__PURE__ */ new Set([
  "sessions.listPreviewItems",
  "externalPasswordManagers.connect",
  "externalPasswordManagers.save",
  "externalPasswordManagers.reveal",
  "passwordManager.import.prepare1Password",
  "passwordManager.import.prepareNordPass",
  "passwordManager.import.commitNordPass",
  "passwordManager.import.cancelNordPass",
  "passwordManager.import.commit1Password",
  "passwordManager.import.cancel1Password"
]), Hl = /* @__PURE__ */ new Set([
  "accounts.auth.me",
  "accounts.auth.devices",
  "accounts.apiAccessToken",
  "analytics.isFeatureEnabled",
  "analytics.isExperimentalEligible",
  "billing.getSubscription",
  "billing.getSummary",
  "billing.getUsage",
  "models.getSubscriptionUsage",
  "models.listAvailable",
  "models.listSettingsInventory",
  "models.listSupported",
  "referrals.getCode",
  "referrals.getGuestPasses",
  "sessions.shareStatus",
  "passwordManager.auth.seedCloud"
]), Jl = /* @__PURE__ */ new Set(["models.listSettingsInventory"]), Ql = /* @__PURE__ */ new Set([
  "sessions.get",
  "sessions.turns.activeMessages",
  "sessions.turns.list",
  "sessions.turns.messages"
]);
function Yl(e, t) {
  if (!(t instanceof Ue)) return e < 3;
  const r = t.data?.appCode;
  return t.data?.code === "UNAUTHORIZED" || r === "ASIDE_API_TIMEOUT" ? !1 : e < 3;
}
var Cn = new wu({ defaultOptions: { queries: {
  retry: Yl,
  staleTime: 1e4,
  refetchOnWindowFocus: !1,
  networkMode: "always"
} } }), { TRPCProvider: Db, useTRPC: $b, useTRPCClient: Lb } = Rl(), Xl = [ct({
  condition: (e) => Hl.has(e.path),
  true: ct({
    condition: (e) => e.path === "billing.getSummary" || e.path === "billing.getSubscription",
    true: rl({
      url: Fe,
      fetch: ve
    }),
    false: ct({
      condition: (e) => Jl.has(e.path),
      true: ut({
        url: Fe,
        fetch: ve
      }),
      false: ut({
        url: Fe,
        fetch: ve
      })
    })
  }),
  false: ct({
    condition: (e) => Vl.has(e.path),
    true: ut({
      url: Fe,
      fetch: ve
    }),
    false: ct({
      condition: (e) => Ql.has(e.path),
      true: ut({
        url: Fe,
        fetch: ve
      }),
      false: ut({
        url: Fe,
        fetch: ve
      })
    })
  })
})], D = fl({ links: Xl }), ed = Es({
  client: D,
  queryClient: Cn
}), ln = "aux.capture.enabled.v2", td = !0;
function Rs(e) {
  return e !== !1;
}
async function Cs() {
  try {
    if (typeof chrome < "u" && chrome.storage?.local) return Rs((await chrome.storage.local.get(ln))[ln]);
  } catch {
  }
  return td;
}
function rd(e) {
  if (typeof chrome > "u" || !chrome.storage?.onChanged) return () => {
  };
  const t = (r, n) => {
    n !== "local" || !r["aux.capture.enabled.v2"] || e(Rs(r[ln].newValue));
  };
  return chrome.storage.onChanged.addListener(t), () => chrome.storage.onChanged.removeListener(t);
}
function nd(e, t, r) {
  const n = r / t;
  return {
    scale: n,
    sx: Math.round(e.x * n),
    sy: Math.round(e.y * n),
    sw: Math.round(e.width * n),
    sh: Math.round(e.height * n)
  };
}
async function od(e, t, r) {
  const n = id(e), o = await createImageBitmap(n);
  try {
    const { sx: i, sy: s, sw: a, sh: c } = nd(t, r, o.width), u = new OffscreenCanvas(a, c), l = u.getContext("2d");
    if (!l) throw new Error("Failed to get 2d context");
    return l.drawImage(o, i, s, a, c, 0, 0, a, c), sd(await u.convertToBlob({ type: "image/png" }));
  } finally {
    o.close();
  }
}
function id(e) {
  const t = e.indexOf(",");
  if (t < 0) throw new Error("Invalid data URL");
  const r = e.slice(0, t), n = e.slice(t + 1), o = /^data:([^;,]+)/u.exec(r)?.[1] ?? "application/octet-stream";
  if (!r.includes(";base64")) return new Blob([decodeURIComponent(n)], { type: o });
  const i = atob(n), s = new Uint8Array(i.length);
  for (let a = 0; a < i.length; a += 1) s[a] = i.charCodeAt(a);
  return new Blob([s], { type: o });
}
async function sd(e) {
  const t = new Uint8Array(await e.arrayBuffer());
  let r = "";
  for (const n of t) r += String.fromCharCode(n);
  return `data:${e.type || "image/png"};base64,${btoa(r)}`;
}
function dn(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, n]) => t.indexOf(+r) === -1).map(([r, n]) => n);
}
function Ao(e, t = "|") {
  return e.map((r) => $s(r)).join(t);
}
function fn(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
var ad = class {
  constructor(e) {
    this._getter = e, this._value = void 0;
  }
  get value() {
    const e = this._getter;
    return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
  }
};
function Tr(e) {
  return new ad(e);
}
function cd(e) {
  return e == null;
}
function kn(e) {
  const t = e.startsWith("^") ? 1 : 0, r = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, r);
}
function ud(e, t) {
  const r = e / t, n = Math.round(r), o = 4 * Number.EPSILON * Math.max(Math.abs(r), 1);
  return Math.abs(r - n) < o ? 0 : r - n;
}
function me(e, t, r) {
  Object.defineProperty(e, t, {
    value: r,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function Nn(e) {
  const t = Object.getOwnPropertyDescriptor(e, "shape");
  return t?.get ? t.get.raw : t?.value;
}
function pe(e) {
  return Nn(e._zod.def) ?? e._zod.def.shape;
}
function ks(e, t, r) {
  Object.defineProperty(e, t, {
    get() {
      const n = r();
      return me(this, t, n), n;
    },
    enumerable: !0,
    configurable: !0
  });
}
function Ns(e, t, r) {
  t in e ? me(e, t, r) : e[t] = r;
}
function xe(e, t, r, n) {
  const o = pe(t);
  for (const i of r) {
    const s = Object.getOwnPropertyDescriptor(o, i);
    s.enumerable && (s.get ? ks(e, i, () => {
      const a = t._zod.def.shape[i];
      return n ? n(a, i) : a;
    }) : Ns(e, i, n ? n(s.value, i) : s.value));
  }
}
function ld(e, t) {
  for (const r of Reflect.ownKeys(t)) {
    const n = Object.getOwnPropertyDescriptor(t, r);
    n.enumerable && (n.get ? ks(e, r, () => t[r]) : Ns(e, r, n.value));
  }
}
function Q(...e) {
  const t = {};
  for (const r of e) {
    const n = Object.getOwnPropertyDescriptors(r);
    Object.assign(t, n);
  }
  return Object.defineProperties({}, t);
}
function dd(e) {
  return JSON.stringify(e);
}
function fd(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var Ms = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function Rt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
var hd = /* @__PURE__ */ Tr(() => {
  if (ie.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
  try {
    return new Function(""), !0;
  } catch {
    return !1;
  }
});
function Xe(e) {
  if (Rt(e) === !1) return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function") return !0;
  const r = t.prototype;
  return !(Rt(r) === !1 || Object.prototype.hasOwnProperty.call(r, "isPrototypeOf") === !1);
}
function Ds(e) {
  return Xe(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var pd = /* @__PURE__ */ new Set([
  "string",
  "number",
  "symbol"
]);
function et(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Ae(e, t, r) {
  const n = new e._zod.constr(t ?? e._zod.def);
  return (!t || r?.parent) && (n._zod.parent = e), n;
}
function I(e) {
  const t = e;
  if (!t) return {};
  if (typeof t == "string") return { error: () => t };
  if (t?.message !== void 0) {
    if (t?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? {
    ...t,
    error: () => t.error
  } : t;
}
function $s(e) {
  return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function md(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var Ls = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, gd = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function vd(e, t) {
  const r = e._zod.def, n = r.checks;
  if (n && n.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
  const o = {};
  return xe(o, e, Or(e, t)), Ae(e, Q(r, {
    shape: o,
    checks: []
  }));
}
function Or(e, t) {
  const r = pe(e), n = [];
  for (const o of Reflect.ownKeys(t)) {
    if (!Object.getOwnPropertyDescriptor(r, o)?.enumerable) throw new Error(`Unrecognized key: "${String(o)}"`);
    t[o] && n.push(o);
  }
  return n;
}
function yd(e, t) {
  const r = e._zod.def, n = r.checks;
  if (n && n.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
  const o = new Set(Or(e, t)), i = {};
  return xe(i, e, Reflect.ownKeys(pe(e)).filter((s) => !o.has(s))), Ae(e, Q(r, {
    shape: i,
    checks: []
  }));
}
function wd(e, t) {
  if (!Xe(t)) throw new Error("Invalid input to extend: expected a plain object");
  const r = e._zod.def.checks;
  if (r && r.length > 0) {
    const n = pe(e);
    for (const o of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, o) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  return Ae(e, Q(e._zod.def, { shape: Us(e, t) }));
}
function Us(e, t) {
  const r = {};
  return xe(r, e, Reflect.ownKeys(pe(e))), ld(r, t), r;
}
function bd(e, t) {
  if (!Xe(t)) throw new Error("Invalid input to safeExtend: expected a plain object");
  return Ae(e, Q(e._zod.def, { shape: Us(e, t) }));
}
function Sd(e, t) {
  if (!t?._zod?.def) throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  if (e._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const r = {};
  return xe(r, e, Reflect.ownKeys(pe(e))), xe(r, t, Reflect.ownKeys(pe(t))), Ae(e, Q(e._zod.def, {
    shape: r,
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: t._zod.def.checks ?? []
  }));
}
function Po(e, t, r, n = "partial") {
  const o = t._zod.def.checks;
  if (o && o.length > 0) throw new Error(`.${n}() cannot be used on object schemas containing refinements`);
  const i = r ? new Set(Or(t, r)) : void 0, s = {};
  return xe(s, t, Reflect.ownKeys(pe(t)), e && ((a, c) => i && !i.has(c) ? a : new e({
    type: "optional",
    innerType: a
  }))), Ae(t, Q(t._zod.def, {
    shape: s,
    checks: []
  }));
}
function _d(e, t, r) {
  const n = r ? new Set(Or(t, r)) : void 0, o = {};
  return xe(o, t, Reflect.ownKeys(pe(t)), (i, s) => n && !n.has(s) ? i : new e({
    type: "nonoptional",
    innerType: i
  })), Ae(t, Q(t._zod.def, { shape: o }));
}
function he(e, t = 0) {
  if (e.aborted === !0) return !0;
  for (let r = t; r < e.issues.length; r++) if (e.issues[r]?.continue !== !0) return !0;
  return !1;
}
function Id(e, t = 0) {
  if (e.aborted === !0) return !0;
  for (let r = t; r < e.issues.length; r++) if (e.issues[r]?.continue === !1) return !0;
  return !1;
}
function Ve(e, t) {
  return t.map((r) => {
    var n;
    return (n = r).path ?? (n.path = []), r.path.unshift(e), r;
  });
}
function dt(e) {
  return typeof e == "string" ? e : e?.message;
}
function To(e, t, r) {
  var n;
  for (let o = t; o < e.length; o++) (n = e[o]).schema ?? (n.schema = r);
}
function _e(e, t, r) {
  var n;
  const o = e.inst?._zod?.traits;
  o?.has("$ZodType") && (o.has("$ZodCheck") ? (n = e).schema ?? (n.schema = e.inst) : e.schema = e.inst);
  const i = e.schema !== e.inst ? e.schema?._zod.def?.error : void 0, s = e.message ? e.message : dt(e.inst?._zod.def?.error?.(e)) ?? dt(i?.(e)) ?? dt(t?.error?.(e)) ?? dt(r.customError?.(e)) ?? dt(r.localeError?.(e)) ?? "Invalid input", a = {};
  for (const c of Object.keys(e))
    c === "inst" || c === "schema" || c === "continue" || c === "input" || c === "__proto__" || (a[c] = e[c]);
  return a.path ?? (a.path = []), a.message = s, t?.reportInput && (a.input = e.input), a;
}
var Ed = /[\uD800-\uDBFF]/;
function Mn(e) {
  const t = e.length;
  if (!Ed.test(e)) return t;
  let r = t;
  for (let n = 0; n < t - 1; n++) (e.charCodeAt(n) & 64512) === 55296 && (e.charCodeAt(n + 1) & 64512) === 56320 && (r--, n++);
  return r;
}
function Dn(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Ad(e) {
  const t = typeof e;
  switch (t) {
    case "number":
      return Number.isNaN(e) ? "nan" : "number";
    case "object": {
      if (e === null) return "null";
      if (Array.isArray(e)) return "array";
      const r = e;
      if (r && Object.getPrototypeOf(r) !== Object.prototype && "constructor" in r && r.constructor) return r.constructor.name;
    }
  }
  return t;
}
function Ct(...e) {
  const [t, r, n] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: r,
    inst: n
  } : { ...t };
}
function Pd(e, t) {
  for (const r in t) {
    const n = Object.getOwnPropertyDescriptor(t, r);
    n.get ? Object.defineProperty(e, r, {
      ...n,
      enumerable: !1
    }) : Td(e, r, n.value);
  }
}
function Ie(e, t, r, n = !0) {
  return Object.defineProperty(e, t, {
    configurable: !0,
    writable: !0,
    enumerable: n,
    value: r
  }), r;
}
function xs(e, t, r) {
  return Ie(e, t, r, !1);
}
function zs(e, t) {
  for (const r in e) {
    const n = e[r];
    Object.defineProperty(t, r, {
      configurable: !0,
      enumerable: !0,
      get() {
        return Ie(this, r, n(this));
      },
      set(o) {
        Ie(this, r, o);
      }
    });
  }
  return t;
}
function Td(e, t, r) {
  Object.defineProperty(e, t, {
    configurable: !0,
    get() {
      return this == null ? r : Ie(this, t, r.bind(this));
    },
    set(n) {
      Ie(this, t, n);
    }
  });
}
function Od(e, t) {
  const r = Object.getPrototypeOf(e);
  return t in r ? void 0 : r;
}
var Ur, ge = !1, Rd = {
  configurable: !0,
  get() {
    ge = !0;
  }
};
function O(e, t, r) {
  const n = Object.getPrototypeOf(e._zod);
  if (t in n && Ur !== e._zod) {
    Ur = void 0;
    return;
  }
  Ur = e._zod, Object.defineProperty(n, t, {
    configurable: !0,
    get() {
      Object.defineProperty(this, t, Rd);
      const o = ge;
      ge = !1;
      try {
        const i = r(this);
        return ge ? delete this[t] : Object.defineProperty(this, t, {
          configurable: !0,
          writable: !0,
          value: i
        }), ge = ge || o, i;
      } catch (i) {
        throw delete this[t], ge = ge || o, i;
      }
    },
    set(o) {
      Object.defineProperty(this, t, {
        configurable: !0,
        writable: !0,
        value: o
      });
    }
  });
}
function Cd(e, t, r, n) {
  const o = Od(e, t);
  o && Object.defineProperty(o, t, {
    configurable: !0,
    get() {
      const i = {
        configurable: !0,
        writable: !0,
        enumerable: n,
        value: void 0
      };
      return Object.defineProperty(this, t, i), i.value = r(this), Object.defineProperty(this, t, i), i.value;
    },
    set(i) {
      Object.defineProperty(this, t, {
        configurable: !0,
        writable: !0,
        enumerable: n,
        value: i
      });
    }
  });
}
var kd = "~constantCatch";
function Nd(e) {
  const t = () => e;
  return t[kd] = !0, t;
}
var Oo, xr = {
  value: void 0,
  enumerable: !1
}, Ro = "captureStackTrace" in Error ? Error : null;
function Md(e) {
  const t = Ro;
  if (t) {
    const r = t.stackTraceLimit;
    if (typeof r == "number") {
      try {
        t.stackTraceLimit = 0;
      } catch {
        return Ro = null, new e();
      }
      try {
        return new e();
      } finally {
        t.stackTraceLimit = r;
      }
    }
  }
  return new e();
}
function y(e, t, r, n) {
  const o = {};
  function i(d) {
    this.def = d, this.constr = f, this.traits = /* @__PURE__ */ new Set();
  }
  i.prototype = o;
  const s = r, a = s && /* @__PURE__ */ new WeakSet();
  function c(d, h) {
    if (d._zod) {
      if (d._zod.traits.has(e)) return;
    } else {
      xr.value = new i(h);
      try {
        Object.defineProperty(d, "_zod", xr);
      } finally {
        xr.value = void 0;
      }
    }
    if (d._zod.traits.add(e), t(d, h), a) {
      const v = Object.getPrototypeOf(d), w = d._zod.constr.prototype;
      let b = v;
      for (; b && b !== w; ) b = Object.getPrototypeOf(b);
      const S = b ?? v;
      a.has(S) || (a.add(S), Pd(S, s));
    }
    const g = f.prototype;
    for (const v in g)
      Object.prototype.hasOwnProperty.call(g, v) && (v in d || (d[v] = g[v].bind(d)));
  }
  const u = n?.Parent ?? Object;
  class l extends u {
  }
  Object.defineProperty(l, "name", { value: e });
  function f(d) {
    const h = n?.Parent ? Md(l) : this;
    c(h, d);
    const g = h._zod.deferred;
    if (g) {
      for (const w of g) w();
      h._zod.deferred = void 0;
    }
    const v = globalThis.__zod_globalConfig?.postProcessor;
    return v && v(h), h;
  }
  return Object.defineProperty(f, "init", { value: c }), Object.defineProperty(f, Symbol.hasInstance, { value: (d) => n?.Parent && d instanceof n.Parent ? !0 : d?._zod?.traits?.has(e) }), Object.defineProperty(f, "name", { value: e }), f;
}
var De = class extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}, Fs = class extends Error {
  constructor(e) {
    super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
  }
};
(Oo = globalThis).__zod_globalConfig ?? (Oo.__zod_globalConfig = {});
var ie = globalThis.__zod_globalConfig;
function ue(e) {
  return e && Object.assign(ie, e), ie;
}
function Dd() {
  const e = this._zod;
  return e.message ?? (e.message = JSON.stringify(e.def, fn, 2)), e.message;
}
function $d(e) {
  this._zod.message = e;
}
var Ld = {
  get: Dd,
  set: $d,
  enumerable: !0,
  configurable: !0
}, zr = {
  value: void 0,
  enumerable: !1
}, Co = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), js = (e, t) => {
  e.name = "$ZodError", zr.value = t, Object.defineProperty(e, "issues", zr), zr.value = void 0, Object.defineProperty(e, "message", Ld);
  const r = Object.getPrototypeOf(e);
  Co.has(r) || (Co.add(r), Object.defineProperty(r, "toString", {
    configurable: !0,
    enumerable: !1,
    get() {
      const n = () => this.message;
      return Object.defineProperty(this, "toString", {
        value: n,
        configurable: !0,
        writable: !0
      }), n;
    },
    set(n) {
      Object.defineProperty(this, "toString", {
        value: n,
        configurable: !0,
        writable: !0
      });
    }
  }));
}, Ud = y("$ZodError", js), Ub = y("$ZodError", js, void 0, { Parent: Error });
function xd(e, t, r) {
  return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
    value: r(),
    writable: !0,
    enumerable: !0,
    configurable: !0
  }) : e[t] = r()), e[t];
}
function zd(e, t = (r) => r.message) {
  const r = {}, n = [];
  for (const o of e.issues) o.path.length > 0 ? xd(r, o.path[0], () => []).push(t(o)) : n.push(t(o));
  return {
    formErrors: n,
    fieldErrors: r
  };
}
function Fd(e, t = (r) => r.message) {
  const r = { _errors: [] }, n = (o, i = []) => {
    for (const s of o.issues) if (s.code === "invalid_union" && s.errors.length) s.errors.map((a) => n({ issues: a }, [...i, ...s.path]));
    else if (s.code === "invalid_key") n({ issues: s.issues }, [...i, ...s.path]);
    else if (s.code === "invalid_element") n({ issues: s.issues }, [...i, ...s.path]);
    else {
      const a = [...i, ...s.path];
      if (a.length === 0) r._errors.push(t(s));
      else {
        let c = r, u = 0;
        for (; u < a.length; ) {
          const l = a[u], f = u === a.length - 1;
          if (l === "_errors") {
            f && c._errors.push(t(s)), u++;
            continue;
          }
          Object.prototype.hasOwnProperty.call(c, l) || Object.defineProperty(c, l, {
            value: { _errors: [] },
            enumerable: !0,
            writable: !0,
            configurable: !0
          });
          const d = c[l];
          f && d._errors.push(t(s)), c = d, u++;
        }
      }
    }
  };
  return n(e), r;
}
function Rr(e, t) {
  return {
    callee: t?.callee ?? e,
    Err: t?.Err
  };
}
var $n = (e) => {
  const t = (r, n, o, i) => {
    const s = o ? {
      ...o,
      async: !1
    } : { async: !1 }, a = r._zod.run({
      value: n,
      issues: []
    }, s);
    if (a instanceof Promise) throw new De();
    if (a.issues.length) {
      const c = new (i?.Err ?? e)(a.issues.map((u) => _e(u, s, ue())));
      throw Ms(c, i?.callee ?? t), c;
    }
    return a.value;
  };
  return t;
}, Ln = (e) => {
  const t = async (r, n, o, i) => {
    const s = o ? {
      ...o,
      async: !0
    } : { async: !0 };
    let a = r._zod.run({
      value: n,
      issues: []
    }, s);
    if (a instanceof Promise && (a = await a), a.issues.length) {
      const c = new (i?.Err ?? e)(a.issues.map((u) => _e(u, s, ue())));
      throw Ms(c, i?.callee ?? t), c;
    }
    return a.value;
  };
  return t;
}, Un = (e) => (t, r, n) => {
  const o = n ? {
    ...n,
    async: !1
  } : { async: !1 }, i = t._zod.run({
    value: r,
    issues: []
  }, o);
  if (i instanceof Promise) throw new De();
  return i.issues.length ? qs(e, i.issues, o) : {
    success: !0,
    data: i.value
  };
};
function qs(e, t, r) {
  let n;
  return {
    success: !1,
    get error() {
      return n || (n = new e(t.map((o) => _e(o, r, ue()))), t = void 0, r = void 0), n;
    },
    set error(o) {
      n = o, t = void 0, r = void 0;
    }
  };
}
var xn = (e) => async (t, r, n) => {
  const o = n ? {
    ...n,
    async: !0
  } : { async: !0 };
  let i = t._zod.run({
    value: r,
    issues: []
  }, o);
  return i instanceof Promise && (i = await i), i.issues.length ? qs(e, i.issues, o) : {
    success: !0,
    data: i.value
  };
}, jd = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), qd = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Zd = ((e, t, r) => {
  const n = e._zod.bag.validator;
  if (n !== void 0) {
    if (n(t) !== jd) return !0;
    if (n.definite === !0 && r === void 0) return !1;
  }
  return Bd(e, t, r);
});
function Bd(e, t, r) {
  const n = r ? {
    ...r,
    async: !1,
    abortEarly: !0
  } : {
    async: !1,
    abortEarly: !0
  }, o = e._zod.bag.fallbackRun;
  let i;
  if (o ? (n[qd] = !0, i = o({
    value: t,
    issues: []
  }, n)) : i = e._zod.run({
    value: t,
    issues: []
  }, n), i instanceof Promise) throw new De();
  return i.issues.length === 0;
}
var Gd = async (e, t, r) => {
  const n = r ? {
    ...r,
    async: !0,
    abortEarly: !0
  } : {
    async: !0,
    abortEarly: !0
  };
  let o = e._zod.run({
    value: t,
    issues: []
  }, n);
  return o instanceof Promise && (o = await o), o.issues.length === 0;
}, Kd = (e) => {
  const t = $n(e), r = (n, o, i, s) => {
    const a = i ? {
      ...i,
      direction: "backward"
    } : { direction: "backward" };
    return t(n, o, a, Rr(r, s));
  };
  return r;
}, Wd = (e) => {
  const t = $n(e), r = (n, o, i, s) => t(n, o, i, Rr(r, s));
  return r;
}, Vd = (e) => {
  const t = Ln(e), r = async (n, o, i, s) => {
    const a = i ? {
      ...i,
      direction: "backward"
    } : { direction: "backward" };
    return await t(n, o, a, Rr(r, s));
  };
  return r;
}, Hd = (e) => {
  const t = Ln(e), r = async (n, o, i, s) => await t(n, o, i, Rr(r, s));
  return r;
}, Jd = (e) => (t, r, n) => {
  const o = n ? {
    ...n,
    direction: "backward"
  } : { direction: "backward" };
  return Un(e)(t, r, o);
}, Qd = (e) => (t, r, n) => Un(e)(t, r, n), Yd = (e) => async (t, r, n) => {
  const o = n ? {
    ...n,
    direction: "backward"
  } : { direction: "backward" };
  return xn(e)(t, r, o);
}, Xd = (e) => async (t, r, n) => xn(e)(t, r, n), ef = /^[cC][0-9a-z]{6,}$/, tf = /^[0-9a-z]+$/, rf = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, nf = /^[0-9a-vA-V]{20}$/, of = /^[A-Za-z0-9]{27}$/, sf = /^[a-zA-Z0-9_-]{21}$/;
function af(e) {
  return new RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var cf = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, uf = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, ko = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, lf = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, df = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function ff() {
  return new RegExp(df, "u");
}
var hf = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, pf = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, mf = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, gf = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, vf = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, yf = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, wf = /^https?$/, bf = /^\+[1-9]\d{6,14}$/, Zs = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function Sf(e) {
  return new RegExp(`^${e}$`);
}
var _f = /* @__PURE__ */ Sf(Zs);
function hn(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function If(e) {
  return new RegExp(`^${hn(e)}$`);
}
function Ef(e) {
  const t = ["Z"];
  e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const r = `${hn({
    precision: e.precision,
    seconds: !0
  })}(?:${t.join("|")})`, n = e.local ? `${r}|${hn({ precision: e.precision })}` : r;
  return new RegExp(`^${Zs}T(?:${n})$`);
}
var Af = /^[\s\S]{0,}$/, Pf = /^-?\d+$/, zn = /^-?\d+(?:\.\d+)?$/, Tf = /^(?:true|false)$/i, Of = /^[^A-Z]*$/, Rf = /^[^a-z]*$/, H = /* @__PURE__ */ y("$ZodCheck", (e, t) => {
  var r;
  e._zod ?? (e._zod = {}), e._zod.def = t, (r = e._zod).onattach ?? (r.onattach = []);
}), Fn = (e) => {
  const t = e.value;
  return !cd(t) && t.length !== void 0;
}, hr = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Bs = /* @__PURE__ */ y("$ZodCheckLessThan", (e, t) => {
  H.init(e, t);
  const r = hr[typeof t.value];
  e._zod.check = (n) => {
    (t.inclusive ? n.value <= t.value : n.value < t.value) || n.issues.push({
      origin: hr[typeof n.value] ?? r,
      code: "too_big",
      maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: n.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), Gs = /* @__PURE__ */ y("$ZodCheckGreaterThan", (e, t) => {
  H.init(e, t);
  const r = hr[typeof t.value];
  e._zod.check = (n) => {
    (t.inclusive ? n.value >= t.value : n.value > t.value) || n.issues.push({
      origin: hr[typeof n.value] ?? r,
      code: "too_small",
      minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: n.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), Cf = /* @__PURE__ */ y("$ZodCheckMultipleOf", (e, t) => {
  H.init(e, t), e._zod.check = (r) => {
    if (typeof r.value != typeof t.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof r.value == "bigint" ? t.value !== BigInt(0) && r.value % t.value === BigInt(0) : ud(r.value, t.value) === 0) || r.issues.push({
      origin: typeof r.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), kf = /* @__PURE__ */ y("$ZodCheckNumberFormat", (e, t) => {
  H.init(e, t), t.format = t.format || "float64";
  const r = t.format?.includes("int"), n = r ? "int" : "number", [o, i] = Ls[t.format];
  e._zod.check = (s) => {
    const a = s.value;
    if (r) {
      if (!Number.isInteger(a)) {
        s.issues.push({
          expected: n,
          format: t.format,
          code: "invalid_type",
          continue: !1,
          input: a,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(a)) {
        a > 0 ? s.issues.push({
          input: a,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: n,
          inclusive: !0,
          continue: !t.abort
        }) : s.issues.push({
          input: a,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: n,
          inclusive: !0,
          continue: !t.abort
        });
        return;
      }
    }
    a < o && s.issues.push({
      origin: "number",
      input: a,
      code: "too_small",
      minimum: o,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    }), a > i && s.issues.push({
      origin: "number",
      input: a,
      code: "too_big",
      maximum: i,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    });
  };
}), Nf = /* @__PURE__ */ y("$ZodCheckMaxLength", (e, t) => {
  var r;
  H.init(e, t), (r = e._zod.def).when ?? (r.when = Fn), e._zod.check = (n) => {
    const o = n.value, i = o.length;
    if ((typeof o == "string" && i > t.maximum ? Mn(o) : i) <= t.maximum) return;
    const s = Dn(o);
    n.issues.push({
      origin: s,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), Mf = /* @__PURE__ */ y("$ZodCheckMinLength", (e, t) => {
  var r;
  H.init(e, t), (r = e._zod.def).when ?? (r.when = Fn), e._zod.check = (n) => {
    const o = n.value, i = o.length;
    if ((typeof o == "string" && i >= t.minimum && i < t.minimum * 2 ? Mn(o) : i) >= t.minimum) return;
    const s = Dn(o);
    n.issues.push({
      origin: s,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), Df = /* @__PURE__ */ y("$ZodCheckLengthEquals", (e, t) => {
  var r;
  H.init(e, t), (r = e._zod.def).when ?? (r.when = Fn), e._zod.check = (n) => {
    const o = n.value, i = o.length, s = typeof o == "string" && i >= t.length && i <= t.length * 2 ? Mn(o) : i;
    if (s === t.length) return;
    const a = Dn(o), c = s > t.length;
    n.issues.push({
      origin: a,
      ...c ? {
        code: "too_big",
        maximum: t.length
      } : {
        code: "too_small",
        minimum: t.length
      },
      inclusive: !0,
      exact: !0,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Cr = /* @__PURE__ */ y("$ZodCheckStringFormat", (e, t) => {
  var r, n;
  H.init(e, t), t.pattern ? (r = e._zod).check ?? (r.check = (o) => {
    t.pattern.lastIndex = 0, !t.pattern.test(o.value) && o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: o.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (n = e._zod).check ?? (n.check = () => {
  });
}), $f = /* @__PURE__ */ y("$ZodCheckRegex", (e, t) => {
  Cr.init(e, t), e._zod.check = (r) => {
    t.pattern.lastIndex = 0, !t.pattern.test(r.value) && r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: r.value,
      pattern: t.pattern.toString(),
      inst: e,
      continue: !t.abort
    });
  };
}), Lf = /* @__PURE__ */ y("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = Of), Cr.init(e, t);
}), Uf = /* @__PURE__ */ y("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = Rf), Cr.init(e, t);
}), xf = /* @__PURE__ */ y("$ZodCheckIncludes", (e, t) => {
  H.init(e, t);
  const r = et(t.includes);
  t.pattern = new RegExp(typeof t.position == "number" ? `^.{${t.position},}${r}` : r), e._zod.check = (n) => {
    n.value.includes(t.includes, t.position) || n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), zf = /* @__PURE__ */ y("$ZodCheckStartsWith", (e, t) => {
  H.init(e, t);
  const r = new RegExp(`^${et(t.prefix)}.*`);
  t.pattern ?? (t.pattern = r), e._zod.check = (n) => {
    n.value.startsWith(t.prefix) || n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ff = /* @__PURE__ */ y("$ZodCheckEndsWith", (e, t) => {
  H.init(e, t);
  const r = new RegExp(`.*${et(t.suffix)}$`);
  t.pattern ?? (t.pattern = r), e._zod.check = (n) => {
    n.value.endsWith(t.suffix) || n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), jf = /* @__PURE__ */ y("$ZodCheckOverwrite", (e, t) => {
  H.init(e, t), e._zod.check = (r) => {
    r.value = t.tx(r.value);
  };
}), qf = class {
  constructor(e = [], t = {}) {
    this.content = [], this.indent = 0, this.args = e, this.closed = t;
  }
  indented(e) {
    this.indent += 1;
    try {
      e(this);
    } finally {
      this.indent -= 1;
    }
  }
  write(e) {
    if (typeof e == "function") {
      e(this, { execution: "sync" }), e(this, { execution: "async" });
      return;
    }
    const t = e.split(`
`).filter((o) => o), r = Math.min(...t.map((o) => o.length - o.trimStart().length)), n = t.map((o) => o.slice(r)).map((o) => " ".repeat(this.indent * 2) + o);
    for (const o of n) this.content.push(o);
  }
  compile() {
    const e = Function, t = this?.content ?? [""];
    return new e(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {
${t.join(`
`)}
};`)(...Object.values(this.closed));
  }
}, Zf = {
  major: 4,
  minor: 6,
  patch: 5
}, x = /* @__PURE__ */ y("$ZodType", (e, t) => {
  var r;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Zf;
  const n = e._zod.def.checks, o = e._zod.traits.has("$ZodCheck") ? [e, ...n ?? []] : n?.length ? [...n] : [];
  for (const i of o) for (const s of i._zod.onattach) s(e);
  if (o.length === 0)
    (r = e._zod).deferred ?? (r.deferred = []), e._zod.deferred?.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const i = (a, c, u) => {
      if (a.memo) return a;
      let l = he(a), f;
      for (const d of c) {
        if (d._zod.def.when) {
          if (Id(a) || !d._zod.def.when(a)) continue;
        } else if (l) continue;
        const h = a.issues.length, g = d._zod.check(a);
        if (g instanceof Promise && u?.async === !1) throw new De();
        if (f || g instanceof Promise) f = (f ?? Promise.resolve()).then(async () => {
          await g, a.issues.length !== h && (To(a.issues, h, e), l || (l = he(a, h)));
        });
        else {
          if (a.issues.length === h) continue;
          To(a.issues, h, e), l || (l = he(a, h));
        }
      }
      return f ? f.then(() => a) : a;
    }, s = (a, c, u) => {
      if (he(a))
        return a.aborted = !0, a;
      const l = i(c, o, u);
      if (l instanceof Promise) {
        if (u.async === !1) throw new De();
        return l.then((f) => e._zod.parse(f, u));
      }
      return e._zod.parse(l, u);
    };
    e._zod.run = (a, c) => {
      if (c.skipChecks) return e._zod.parse(a, c);
      if (c.direction === "backward") {
        const l = e._zod.parse({
          value: a.value,
          issues: []
        }, {
          ...c,
          skipChecks: !0
        });
        return l instanceof Promise ? l.then((f) => s(f, a, c)) : s(l, a, c);
      }
      const u = e._zod.parse(a, c);
      if (u instanceof Promise) {
        if (c.async === !1) throw new De();
        return u.then((l) => i(l, o, c));
      }
      return i(u, o, c);
    };
  }
}, {
  get "~standard"() {
    return xs(this, "~standard", Ws(this));
  },
  set "~standard"(e) {
    Ie(this, "~standard", e);
  }
}), Ks = (e, t) => e.issues.length ? { issues: e.issues.map((r) => _e(r, t, ue())) } : { value: e.value };
async function Bf(e, t) {
  const r = { async: !0 };
  return Ks(await e._zod.run({
    value: t,
    issues: []
  }, r), r);
}
function Ws(e) {
  return {
    validate: (t) => {
      const r = { async: !1 };
      try {
        const n = e._zod.run({
          value: t,
          issues: []
        }, r);
        if (!(n instanceof Promise)) return Ks(n, r);
      } catch {
      }
      return Bf(e, t);
    },
    vendor: "zod",
    version: 1
  };
}
var jn = /* @__PURE__ */ y("$ZodString", (e, t) => {
  x.init(e, t), e._zod.pattern = t.pattern ?? Af, e._zod.parse = (r, n) => {
    if (t.coerce) try {
      r.value = String(r.value);
    } catch {
    }
    return typeof r.value == "string" || r.issues.push({
      expected: "string",
      code: "invalid_type",
      input: r.value,
      inst: e
    }), r;
  };
}), L = /* @__PURE__ */ y("$ZodStringFormat", (e, t) => {
  Cr.init(e, t), jn.init(e, t);
}), Gf = /* @__PURE__ */ y("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = uf), L.init(e, t);
}), Kf = /* @__PURE__ */ y("$ZodUUID", (e, t) => {
  if (t.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (r === void 0) throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = ko(r));
  } else t.pattern ?? (t.pattern = ko());
  L.init(e, t);
}), Wf = /* @__PURE__ */ y("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = lf), L.init(e, t);
});
function Vs(e) {
  try {
    return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
  } catch {
    return !1;
  }
}
function Vf(e, t) {
  return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? Vs(e) || 2 : Hf(e, t);
}
function Hf(e, t) {
  if (!t.normalize && t.protocol?.source === wf.source && !/^https?:\/\//i.test(e)) return 1;
  try {
    if (typeof URL < "u") {
      const r = URL;
      if (typeof r.parse == "function") return r.parse(e) ?? 2;
    }
    return new URL(e);
  } catch {
    return 2;
  }
}
var Jf = /[\t\n\r]/g;
function No(e) {
  return e.replace(Jf, "");
}
function Qf(e, t) {
  return t.lastIndex = 0, t.test(e.hostname);
}
function Yf(e, t) {
  return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var Xf = /* @__PURE__ */ y("$ZodURL", (e, t) => {
  L.init(e, t), e._zod.check = (r) => {
    try {
      const n = r.value.trim(), o = Vf(n, t);
      if (o === 1) {
        r.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid URL format",
          input: r.value,
          inst: e,
          continue: !t.abort
        });
        return;
      }
      if (o === 2) {
        r.issues.push({
          code: "invalid_format",
          format: "url",
          input: r.value,
          inst: e,
          continue: !t.abort
        });
        return;
      }
      if (o === !0) {
        r.value = No(n);
        return;
      }
      t.hostname && !Qf(o, t.hostname) && r.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: r.value,
        inst: e,
        continue: !t.abort
      }), t.protocol && !Yf(o, t.protocol) && r.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: r.value,
        inst: e,
        continue: !t.abort
      }), r.value = t.normalize ? o.href : No(n);
      return;
    } catch {
      r.issues.push({
        code: "invalid_format",
        format: "url",
        input: r.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), eh = /* @__PURE__ */ y("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = ff()), L.init(e, t);
}), th = /* @__PURE__ */ y("$ZodNanoID", (e, t) => {
  if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw new Error(`Invalid nanoid length: ${t.length}`);
  t.pattern ?? (t.pattern = t.length === void 0 ? sf : af(t.length)), L.init(e, t);
}), rh = /* @__PURE__ */ y("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = ef), L.init(e, t);
}), nh = /* @__PURE__ */ y("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = tf), L.init(e, t);
}), oh = /* @__PURE__ */ y("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = rf), L.init(e, t);
}), ih = /* @__PURE__ */ y("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = nf), L.init(e, t);
}), sh = /* @__PURE__ */ y("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = of), L.init(e, t);
}), ah = /* @__PURE__ */ y("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Ef(t)), L.init(e, t);
}), ch = /* @__PURE__ */ y("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = _f), L.init(e, t);
}), uh = /* @__PURE__ */ y("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = If(t)), L.init(e, t);
}), lh = /* @__PURE__ */ y("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = cf), L.init(e, t);
}), dh = /* @__PURE__ */ y("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = hf), L.init(e, t);
}), fh = /^[0-9a-fA-F:.]+$/;
function Hs(e) {
  return fh.test(e) ? Vs(`http://[${e}]`) : !1;
}
var hh = /* @__PURE__ */ y("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = pf), L.init(e, t), e._zod.check = (r) => {
    Hs(r.value) || r.issues.push({
      code: "invalid_format",
      format: "ipv6",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), ph = /* @__PURE__ */ y("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = mf), L.init(e, t);
});
function mh(e) {
  const t = e.split("/");
  if (t.length !== 2) return !1;
  const [r, n] = t;
  if (!n) return !1;
  const o = Number(n);
  return `${o}` !== n || o < 0 || o > 128 ? !1 : Hs(r);
}
var gh = /* @__PURE__ */ y("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = gf), L.init(e, t), e._zod.check = (r) => {
    mh(r.value) || r.issues.push({
      code: "invalid_format",
      format: "cidrv6",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function Js(e) {
  if (e === "") return !0;
  if (/\s/.test(e) || e.length % 4 !== 0) return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
var Qs = /^[0-9a-zA-Z+/]*={0,2}$/, vh = /* @__PURE__ */ y("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = Qs), L.init(e, t), e._zod.check = (r) => {
    Js(r.value) || r.issues.push({
      code: "invalid_format",
      format: "base64",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), qn = /^[A-Za-z0-9_-]*$/;
function yh(e) {
  if (!qn.test(e)) return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/");
  return Js(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var wh = /* @__PURE__ */ y("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = qn), L.init(e, t), e._zod.check = (r) => {
    yh(r.value) || r.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), bh = /* @__PURE__ */ y("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = bf), L.init(e, t);
});
function Sh(e, t = null) {
  try {
    const r = e.split(".");
    if (r.length !== 3) return !1;
    const [n] = r;
    if (!n) return !1;
    const o = JSON.parse(atob(n));
    return !("typ" in o && o?.typ !== "JWT" || !o.alg || t && (!("alg" in o) || o.alg !== t));
  } catch {
    return !1;
  }
}
var _h = /* @__PURE__ */ y("$ZodJWT", (e, t) => {
  L.init(e, t), e._zod.check = (r) => {
    Sh(r.value, t.alg) || r.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ys = /* @__PURE__ */ y("$ZodNumber", (e, t) => {
  x.init(e, t), e._zod.pattern = zn, e._zod.parse = (r, n) => {
    if (t.coerce) try {
      r.value = Number(r.value);
    } catch {
    }
    const o = r.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o)) return r;
    const i = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : String(o) : void 0;
    return r.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: e,
      ...i ? { received: i } : {}
    }), r;
  };
}), Ih = /* @__PURE__ */ y("$ZodNumberFormat", (e, t) => {
  kf.init(e, t), Ys.init(e, t);
}), Eh = /* @__PURE__ */ y("$ZodBoolean", (e, t) => {
  x.init(e, t), e._zod.pattern = Tf, e._zod.parse = (r, n) => {
    if (t.coerce) try {
      r.value = !!r.value;
    } catch {
    }
    const o = r.value;
    return typeof o == "boolean" || r.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: o,
      inst: e
    }), r;
  };
}), Ah = /* @__PURE__ */ y("$ZodUnknown", (e, t) => {
  x.init(e, t), e._zod.parse = (r) => r;
}), Ph = /* @__PURE__ */ y("$ZodNever", (e, t) => {
  x.init(e, t), e._zod.parse = (r, n) => (r.issues.push({
    expected: "never",
    code: "invalid_type",
    input: r.value,
    inst: e
  }), r);
});
function Mo(e, t, r) {
  e.issues.length && t.issues.push(...Ve(r, e.issues)), t.value[r] = e.value;
}
var Th = /* @__PURE__ */ y("$ZodArray", (e, t) => {
  x.init(e, t);
  const r = ie.memoizer;
  r?.attach(e), e._zod.parse = (n, o) => {
    const i = n.value;
    if (!Array.isArray(i))
      return n.issues.push({
        expected: "array",
        code: "invalid_type",
        input: i,
        inst: e
      }), n;
    n.value = r ? r.alloc(e, n, Array(i.length), o) : Array(i.length);
    const s = [], a = o?.abortEarly;
    for (let c = 0; c < i.length; c++) {
      const u = i[c], l = t.element._zod.run({
        value: u,
        issues: []
      }, o);
      if (l instanceof Promise) s.push(l.then((f) => Mo(f, n, c)));
      else if (Mo(l, n, c), a && l.issues.length !== 0 && he(l)) break;
    }
    return s.length ? Promise.all(s).then(() => n) : n;
  };
});
function pr(e, t, r, n, o, i) {
  const s = r in n, a = i === "optional";
  if (!(!s && a && o === "optional")) {
    if (e.issues.length) {
      if (o !== void 0 && a && !s) return;
      t.issues.push(...Ve(r, e.issues));
    }
    if (!s && o === void 0) {
      e.issues.length || t.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: void 0,
        path: [r]
      });
      return;
    }
    e.value === void 0 ? (s || o === "defaulted" && !a) && (t.value[r] = void 0) : t.value[r] = e.value;
  }
}
var Oh = [];
function Xs(e) {
  const t = Object.keys(e.shape), r = Object.getOwnPropertySymbols(e.shape), n = r.length ? r : Oh, o = n.length ? [...t, ...n] : t;
  for (const s of o) if (!e.shape?.[s]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${String(s)}": expected a Zod schema`);
  const i = md(e.shape);
  return {
    ...e,
    allKeys: o,
    symbolKeys: n,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(i)
  };
}
function ea(e, t, r, n, o, i, s) {
  const a = [], c = o.keySet, u = o.catchall._zod, l = u.def.type, f = u.optin, d = u.optout;
  let h = 0;
  for (const g in t) {
    if (s && r.issues.length !== h) {
      if (he(r, h)) break;
      h = r.issues.length;
    }
    if (c.has(g)) continue;
    if (g === "__proto__") {
      l === "never" && a.push(g);
      continue;
    }
    if (l === "never") {
      a.push(g);
      continue;
    }
    const v = u.run({
      value: t[g],
      issues: []
    }, n);
    v instanceof Promise ? e.push(v.then((w) => pr(w, r, g, t, f, d))) : pr(v, r, g, t, f, d);
  }
  return a.length && r.issues.push({
    code: "unrecognized_keys",
    keys: a,
    input: t,
    inst: i,
    continue: !0
  }), e.length ? Promise.all(e).then(() => r) : r;
}
var Rh = /* @__PURE__ */ y("$ZodObject", (e, t) => {
  x.init(e, t);
  const r = Object.getOwnPropertyDescriptor(t, "shape"), n = r?.get ? r.get.raw : t.shape ?? {};
  if (n) {
    const u = () => {
      const l = { ...n };
      return Object.defineProperty(t, "shape", { value: l }), u.raw = l, l;
    };
    u.raw = n, Object.defineProperty(t, "shape", { get: u });
  }
  const o = Tr(() => Xs(t));
  O(e, "propValues", (u) => {
    const l = u.def.shape, f = {};
    for (const d in l) {
      const h = l[d]._zod;
      if (h.values) {
        Object.prototype.hasOwnProperty.call(f, d) || me(f, d, /* @__PURE__ */ new Set());
        for (const g of h.values) f[d].add(g);
        h.optin !== void 0 && f[d].add(void 0);
      }
    }
    return f;
  });
  const i = Rt, s = t.catchall;
  let a;
  const c = ie.memoizer;
  c?.attach(e), e._zod.parse = (u, l) => {
    a ?? (a = o.value);
    const f = u.value;
    if (!i(f))
      return u.issues.push({
        expected: "object",
        code: "invalid_type",
        input: f,
        inst: e
      }), u;
    u.value = c ? c.alloc(e, u, {}, l) : {};
    const d = [], h = a.shape, g = l?.abortEarly;
    let v = u.issues.length;
    for (const w of a.allKeys) {
      if (g && u.issues.length !== v) {
        if (he(u, v)) break;
        v = u.issues.length;
      }
      if (w === "__proto__") continue;
      const b = h[w], S = b._zod.optin, A = b._zod.optout, R = b._zod.run({
        value: f[w],
        issues: []
      }, l);
      R instanceof Promise ? d.push(R.then((_) => pr(_, u, w, f, S, A))) : pr(R, u, w, f, S, A);
    }
    return s ? ea(d, f, u, l, o.value, e, g === !0) : d.length ? Promise.all(d).then(() => u) : u;
  };
}), Ch = /* @__PURE__ */ y("$ZodObjectJIT", (e, t) => {
  Rh.init(e, t);
  const r = e._zod.parse, n = Tr(() => Xs(t)), o = ie.memoizer, i = (h) => {
    const g = n.value, v = g.symbolKeys, w = new qf(["payload", "ctx"], {
      shape: h,
      inst: e,
      memo: o,
      syms: v
    }), b = (_) => `shape[${_}]._zod.run({ value: input[${_}], issues: [] }, ctx)`, S = (_, P) => `
          let ${_}_ab = false;
          for (let i = 0; i < ${_}.issues.length; i++) {
            const iss = ${_}.issues[i];
            iss.path = iss.path ? [${P}, ...iss.path] : [${P}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${_}_ab = true;
          }
          if (${_}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
    w.write("const input = payload.value;");
    const A = /* @__PURE__ */ Object.create(null);
    let R = 0;
    for (const _ of g.allKeys) A[_] = `key_${R++}`;
    w.write(o ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
    for (const _ of g.allKeys) {
      if (_ === "__proto__") continue;
      const P = A[_], k = typeof _ == "symbol" ? `syms[${v.indexOf(_)}]` : dd(_), q = `${k} in input`, ze = h[_], te = ze?._zod?.optin, Pe = te !== void 0, st = ze?._zod?.optout === "optional";
      if (w.write(`const ${P} = ${b(k)};`), Pe && st) {
        const at = te === "optional" ? `${P}_present` : `${P}.value !== undefined || ${P}_present`;
        w.write(`
        const ${P}_present = ${q};
        if (!${P}.issues.length || ${P}_present) {
          if (${P}.issues.length) {${S(P, k)}
          }

          if (${at}) {
            newResult[${k}] = ${P}.value;
          }
        }

      `);
      } else Pe ? (w.write(`
        if (${P}.issues.length) {${S(P, k)}
        }
      `), te === "defaulted" ? w.write(`newResult[${k}] = ${P}.value;`) : w.write(`
        if (${P}.value !== undefined || ${q}) {
          newResult[${k}] = ${P}.value;
        }
      `)) : w.write(`
        const ${P}_present = ${q};
        if (${P}.issues.length) {${S(P, k)}
        }
        if (!${P}_present && !${P}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${P}_present) {
          newResult[${k}] = ${P}.value;
        }

      `);
    }
    return w.write("payload.value = newResult;"), w.write("return payload;"), w.compile();
  };
  let s;
  const a = Rt, c = !ie.jitless, l = c && hd.value, f = t.catchall;
  let d;
  e._zod.parse = (h, g) => {
    d ?? (d = n.value);
    const v = h.value;
    return a(v) ? c && l && g?.async === !1 && g.jitless !== !0 ? (s || (s = i(t.shape)), h = s(h, g), f ? ea([], v, h, g, d, e, g?.abortEarly === !0) : h) : r(h, g) : (h.issues.push({
      expected: "object",
      code: "invalid_type",
      input: v,
      inst: e
    }), h);
  };
});
function Do(e, t, r, n) {
  for (const i of e) if (i.issues.length === 0)
    return t.value = i.value, t;
  const o = e.filter((i) => !he(i));
  return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: r,
    errors: e.map((i) => i.issues.map((s) => _e(s, n, ue())))
  }), t);
}
var ta = /* @__PURE__ */ y("$ZodUnion", (e, t) => {
  x.init(e, t), O(e, "optin", (n) => n.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : n.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0), O(e, "optout", (n) => n.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), O(e, "values", (n) => {
    if (n.def.options.every((o) => o._zod.values)) return new Set(n.def.options.flatMap((o) => Array.from(o._zod.values)));
  }), O(e, "pattern", (n) => {
    if (n.def.options.every((o) => o._zod.pattern)) {
      const o = n.def.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${o.map((i) => kn(i.source)).join("|")})$`);
    }
  });
  const r = t.options.length === 1 ? t.options[0]._zod.run : null;
  e._zod.parse = (n, o) => {
    if (r) return r(n, o);
    let i = !1;
    const s = [];
    for (const a of t.options) {
      const c = a._zod.run({
        value: n.value,
        issues: []
      }, o);
      if (c instanceof Promise)
        s.push(c), i = !0;
      else {
        if (c.issues.length === 0) return c;
        s.push(c);
      }
    }
    return i ? Promise.all(s).then((a) => Do(a, n, e, o)) : Do(s, n, e, o);
  };
});
function kh(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e.options) {
    const n = r._zod.propValues?.[e.discriminator];
    if (!n || n.size === 0) throw new Error(`Invalid discriminated union option at index "${e.options.indexOf(r)}"`);
    for (const o of n) if (t.has(o)) {
      if (o !== void 0) throw new Error(`Duplicate discriminator value "${String(o)}"`);
      t.set(o, null);
    } else t.set(o, r);
  }
  return t;
}
var Nh = /* @__PURE__ */ y("$ZodDiscriminatedUnion", (e, t) => {
  t.inclusive = !1, ta.init(e, t);
  const r = e._zod.parse;
  O(e, "propValues", (o) => {
    const i = {};
    let s = 0;
    for (const a of o.def.options) {
      const c = a._zod.propValues;
      if (!c || Object.keys(c).length === 0) throw new Error(`Invalid discriminated union option at index "${o.def.options.indexOf(a)}"`);
      c[o.def.discriminator]?.has(void 0) && s++;
      for (const [u, l] of Object.entries(c)) {
        Object.prototype.hasOwnProperty.call(i, u) || me(i, u, /* @__PURE__ */ new Set());
        for (const f of l) i[u].add(f);
      }
    }
    return !o.def.unionFallback && s > 1 && i[o.def.discriminator]?.delete(void 0), i;
  }), t.options.forEach((o, i) => {
    const s = Nn(o._zod.def);
    if (s && !Object.prototype.hasOwnProperty.call(s, t.discriminator)) throw new Error(`Invalid discriminated union option at index "${i}"`);
  });
  const n = Tr(() => kh(t));
  e._zod.parse = (o, i) => {
    const s = o.value;
    if (!Rt(s))
      return o.issues.push({
        code: "invalid_type",
        expected: "object",
        input: s,
        inst: e
      }), o;
    const a = s?.[t.discriminator], c = n.value.get(a);
    return c && (a !== void 0 || i.direction !== "backward") ? c._zod.run(o, i) : t.unionFallback || i.direction === "backward" ? r(o, i) : (o.issues.push({
      code: "invalid_union",
      errors: [],
      note: "No matching discriminator",
      discriminator: t.discriminator,
      options: Array.from(n.value.keys()).filter((u) => n.value.get(u) !== null),
      input: s,
      path: [t.discriminator],
      inst: e
    }), o);
  };
}), Mh = /* @__PURE__ */ y("$ZodIntersection", (e, t) => {
  x.init(e, t), e._zod.parse = (r, n) => {
    const o = r.value, i = t.left._zod.run({
      value: o,
      issues: []
    }, n), s = t.right._zod.run({
      value: o,
      issues: []
    }, n);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([a, c]) => $o(r, a, c)) : $o(r, i, s);
  };
});
function pn(e, t) {
  if (e === t) return {
    valid: !0,
    data: e
  };
  if (e instanceof Date && t instanceof Date && +e == +t) return {
    valid: !0,
    data: e
  };
  if (Xe(e) && Xe(t)) {
    const r = Object.keys(t), n = Object.keys(e).filter((i) => r.indexOf(i) !== -1), o = {
      ...e,
      ...t
    };
    Object.prototype.hasOwnProperty.call(o, "__proto__") && delete o.__proto__;
    for (const i of n) {
      if (i === "__proto__") continue;
      const s = pn(e[i], t[i]);
      if (!s.valid) return {
        valid: !1,
        mergeErrorPath: [i, ...s.mergeErrorPath]
      };
      o[i] = s.data;
    }
    return {
      valid: !0,
      data: o
    };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return {
      valid: !1,
      mergeErrorPath: []
    };
    const r = [];
    for (let n = 0; n < e.length; n++) {
      const o = e[n], i = t[n], s = pn(o, i);
      if (!s.valid) return {
        valid: !1,
        mergeErrorPath: [n, ...s.mergeErrorPath]
      };
      r.push(s.data);
    }
    return {
      valid: !0,
      data: r
    };
  }
  return {
    valid: !1,
    mergeErrorPath: []
  };
}
function $o(e, t, r) {
  const n = /* @__PURE__ */ new Map();
  let o;
  const i = /* @__PURE__ */ new Map(), s = (u, l) => {
    let f;
    if (u.code === "unrecognized_keys" && !u.path?.length)
      o ?? (o = u), f = u.keys;
    else if (u.code === "invalid_key" && u.origin === "record" && u.path?.length === 1) {
      const d = String(u.path[0]);
      i.has(d) || i.set(d, u), f = [d];
    } else return !1;
    for (const d of f)
      n.has(d) || n.set(d, {}), n.get(d)[l] = !0;
    return !0;
  };
  for (const u of t.issues) s(u, "l") || e.issues.push(u);
  for (const u of r.issues) s(u, "r") || e.issues.push(u);
  const a = [...n].filter(([, u]) => u.l && u.r).map(([u]) => u);
  if (a.length) {
    const u = o ? a.filter((l) => o.keys.includes(l)) : [];
    u.length && e.issues.push({
      ...o,
      keys: u
    });
    for (const l of a) !u.includes(l) && i.has(l) && e.issues.push(i.get(l));
  }
  const c = pn(t.value, r.value);
  if (!c.valid) {
    if (he(e)) return e;
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
  }
  return e.value = c.data, e;
}
var Dh = /* @__PURE__ */ y("$ZodRecord", (e, t) => {
  x.init(e, t);
  const r = ie.memoizer;
  r?.attach(e), e._zod.parse = (n, o) => {
    const i = n.value;
    if (!Xe(i))
      return n.issues.push({
        expected: "record",
        code: "invalid_type",
        input: i,
        inst: e
      }), n;
    const s = [], a = t.keyType._zod.values;
    if (a && !t.partial) {
      n.value = r ? r.alloc(e, n, {}, o) : {};
      const c = /* @__PURE__ */ new Set();
      for (const l of a) if (typeof l == "string" || typeof l == "number" || typeof l == "symbol") {
        if (c.add(typeof l == "number" ? l.toString() : l), l === "__proto__") continue;
        const f = t.keyType._zod.run({
          value: l,
          issues: []
        }, o);
        if (f instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
        if (f.issues.length) {
          n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: f.issues.map((g) => _e(g, o, ue())),
            input: l,
            path: [l],
            inst: e
          });
          continue;
        }
        const d = f.value;
        if (d === "__proto__") continue;
        const h = t.valueType._zod.run({
          value: i[l],
          issues: []
        }, o);
        h instanceof Promise ? s.push(h.then((g) => {
          g.issues.length && n.issues.push(...Ve(l, g.issues)), n.value[d] = g.value;
        })) : (h.issues.length && n.issues.push(...Ve(l, h.issues)), n.value[d] = h.value);
      }
      let u;
      for (const l in i) if (!c.has(l))
        if (t.mode === "loose") {
          if (l === "__proto__") continue;
          n.value[l] = i[l];
        } else
          u = u ?? [], u.push(l);
      u && u.length > 0 && n.issues.push({
        code: "unrecognized_keys",
        input: i,
        inst: e,
        keys: u,
        continue: !0
      });
    } else {
      n.value = r ? r.alloc(e, n, {}, o) : {};
      let c;
      for (const u of Reflect.ownKeys(i)) {
        if (u === "__proto__" || !Object.prototype.propertyIsEnumerable.call(i, u)) continue;
        let l = t.keyType._zod.run({
          value: u,
          issues: []
        }, o);
        if (l instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
        if (typeof u == "string" && zn.test(u) && l.issues.length) {
          const h = t.keyType._zod.run({
            value: Number(u),
            issues: []
          }, o);
          if (h instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
          h.issues.length === 0 && (l = h);
        }
        if (l.issues.length) {
          t.mode === "loose" ? n.value[u] = i[u] : a ? (c = c ?? [], c.push(u)) : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: l.issues.map((h) => _e(h, o, ue())),
            input: u,
            path: [u],
            inst: e
          });
          continue;
        }
        const f = l.value;
        if (f === "__proto__") continue;
        const d = t.valueType._zod.run({
          value: i[u],
          issues: []
        }, o);
        d instanceof Promise ? s.push(d.then((h) => {
          h.issues.length && n.issues.push(...Ve(u, h.issues)), n.value[f] = h.value;
        })) : (d.issues.length && n.issues.push(...Ve(u, d.issues)), n.value[f] = d.value);
      }
      c && c.length > 0 && n.issues.push({
        code: "unrecognized_keys",
        input: i,
        inst: e,
        keys: c,
        continue: !0
      });
    }
    return s.length ? Promise.all(s).then(() => n) : n;
  };
}), $h = /* @__PURE__ */ y("$ZodEnum", (e, t) => {
  x.init(e, t);
  const r = dn(t.entries), n = new Set(r);
  e._zod.values = n, O(e, "pattern", (o) => {
    const i = dn(o.def.entries).filter((s) => pd.has(typeof s));
    return new RegExp(i.length ? `^(${i.map((s) => et(s.toString())).join("|")})$` : "^[^\\s\\S]$");
  }), e._zod.parse = (o, i) => {
    const s = o.value;
    return n.has(s) || o.issues.push({
      code: "invalid_value",
      values: r,
      input: s,
      inst: e
    }), o;
  };
}), Lh = /* @__PURE__ */ y("$ZodLiteral", (e, t) => {
  x.init(e, t);
  const r = new Set(t.values);
  e._zod.values = r, O(e, "pattern", (n) => {
    const o = n.def.values;
    return new RegExp(o.length ? `^(${o.map((i) => typeof i == "string" ? et(i) : i ? et(i.toString()) : String(i)).join("|")})$` : "^[^\\s\\S]$");
  }), e._zod.parse = (n, o) => {
    const i = n.value;
    return r.has(i) || n.issues.push({
      code: "invalid_value",
      values: t.values,
      input: i,
      inst: e
    }), n;
  };
}), Uh = /* @__PURE__ */ y("$ZodTransform", (e, t) => {
  x.init(e, t), e._zod.optin = "optional", ie.memoizer?.guard(e), e._zod.parse = (r, n) => {
    if (n.direction === "backward") throw new Fs(e.constructor.name);
    const o = t.transform(r.value, r);
    if (n.async) return (o instanceof Promise ? o : Promise.resolve(o)).then((i) => (r.value = i, r));
    if (o instanceof Promise) throw new De();
    return r.value = o, r;
  };
});
function Lo(e, t) {
  return e.value = t.issues.length ? void 0 : t.value, e;
}
var ra = /* @__PURE__ */ y("$ZodOptional", (e, t) => {
  x.init(e, t), O(e, "optin", (r) => r.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", O(e, "values", (r) => {
    const n = r.def.innerType._zod.values;
    return n ? /* @__PURE__ */ new Set([...n, void 0]) : void 0;
  }), O(e, "pattern", (r) => {
    const n = r.def.innerType._zod.pattern;
    return n ? new RegExp(`^(${kn(n.source)})?$`) : void 0;
  }), e._zod.parse = (r, n) => {
    if (r.value === void 0) {
      if (t.innerType._zod.optin !== "defaulted") return r;
      const o = t.innerType._zod.run({
        value: r.value,
        issues: []
      }, n);
      return o instanceof Promise ? o.then((i) => Lo(r, i)) : Lo(r, o);
    }
    return t.innerType._zod.run(r, n);
  };
}), xh = /* @__PURE__ */ y("$ZodExactOptional", (e, t) => {
  ra.init(e, t), O(e, "values", (r) => r.def.innerType._zod.values), O(e, "pattern", (r) => r.def.innerType._zod.pattern), e._zod.parse = (r, n) => t.innerType._zod.run(r, n);
}), zh = /* @__PURE__ */ y("$ZodNullable", (e, t) => {
  x.init(e, t), O(e, "optin", (r) => r.def.innerType._zod.optin), O(e, "optout", (r) => r.def.innerType._zod.optout), O(e, "pattern", (r) => {
    const n = r.def.innerType._zod.pattern;
    return n ? new RegExp(`^(${kn(n.source)}|null)$`) : void 0;
  }), O(e, "values", (r) => r.def.innerType._zod.values ? /* @__PURE__ */ new Set([...r.def.innerType._zod.values, null]) : void 0), e._zod.parse = (r, n) => r.value === null ? r : t.innerType._zod.run(r, n);
}), Fh = /* @__PURE__ */ y("$ZodDefault", (e, t) => {
  x.init(e, t), e._zod.optin = "defaulted", O(e, "values", (r) => r.def.innerType._zod.values), e._zod.parse = (r, n) => {
    if (n.direction === "backward") return t.innerType._zod.run(r, n);
    if (r.value === void 0)
      return r.value = t.defaultValue, r;
    const o = t.innerType._zod.run(r, n);
    return o instanceof Promise ? o.then((i) => Uo(i, t)) : Uo(o, t);
  };
});
function Uo(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
var jh = /* @__PURE__ */ y("$ZodPrefault", (e, t) => {
  x.init(e, t), e._zod.optin = "defaulted", O(e, "values", (r) => r.def.innerType._zod.values), e._zod.parse = (r, n) => (n.direction === "backward" || r.value === void 0 && (r.value = t.defaultValue), t.innerType._zod.run(r, n));
}), qh = /* @__PURE__ */ y("$ZodNonOptional", (e, t) => {
  x.init(e, t), O(e, "values", (r) => {
    const n = r.def.innerType._zod.values;
    return n ? new Set([...n].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (r, n) => {
    const o = t.innerType._zod.run(r, n);
    return o instanceof Promise ? o.then((i) => xo(i, e)) : xo(o, e);
  };
});
function xo(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
function zo(e, t, r, n) {
  return t.issues.length ? (e.value = r.catchValue({
    ...t,
    value: e.value,
    error: { issues: t.issues.map((o) => _e(o, n, ue())) },
    input: e.value
  }), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var Zh = /* @__PURE__ */ y("$ZodCatch", (e, t) => {
  x.init(e, t), O(e, "optin", (r) => r.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), O(e, "optout", (r) => r.def.innerType._zod.optout), O(e, "values", (r) => r.def.innerType._zod.values), e._zod.parse = (r, n) => {
    if (n.direction === "backward") return t.innerType._zod.run(r, n);
    const o = t.innerType._zod.run({
      value: r.value,
      issues: []
    }, n);
    return o instanceof Promise ? o.then((i) => zo(r, i, t, n)) : zo(r, o, t, n);
  };
}), Bh = /* @__PURE__ */ y("$ZodPipe", (e, t) => {
  x.init(e, t), O(e, "values", (r) => r.def.in._zod.values), O(e, "optin", (r) => r.def.in._zod.optin), O(e, "optout", (r) => r.def.out._zod.optout), O(e, "propValues", (r) => r.def.in._zod.propValues), e._zod.parse = (r, n) => {
    if (n.direction === "backward") {
      const i = t.out._zod.run(r, n);
      return i instanceof Promise ? i.then((s) => Bt(s, t.in, n)) : Bt(i, t.in, n);
    }
    const o = t.in._zod.run(r, n);
    return o instanceof Promise ? o.then((i) => Bt(i, t.out, n)) : Bt(o, t.out, n);
  };
});
function Bt(e, t, r) {
  return e.issues.some((n) => n.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
    value: e.value,
    issues: e.issues
  }, r);
}
var Gh = /* @__PURE__ */ y("$ZodReadonly", (e, t) => {
  x.init(e, t), O(e, "propValues", (r) => r.def.innerType._zod.propValues), O(e, "values", (r) => r.def.innerType._zod.values), O(e, "optin", (r) => r.def.innerType?._zod?.optin), O(e, "optout", (r) => r.def.innerType?._zod?.optout), e._zod.parse = (r, n) => {
    if (n.direction === "backward") return t.innerType._zod.run(r, n);
    const o = t.innerType._zod.run(r, n);
    return o instanceof Promise ? o.then(Fo) : Fo(o);
  };
});
function Fo(e) {
  return e.memo || (e.value = Object.freeze(e.value)), e;
}
var Kh = /* @__PURE__ */ y("$ZodCustom", (e, t) => {
  H.init(e, t), x.init(e, t), e._zod.parse = (r, n) => r, e._zod.check = (r) => {
    const n = r.value, o = t.fn(n);
    if (o instanceof Promise) return o.then((i) => jo(i, r, n, e));
    jo(o, r, n, e);
  };
});
function jo(e, t, r, n) {
  if (!e) {
    const o = {
      code: "custom",
      input: r,
      inst: n,
      path: [...n._zod.def.path ?? []],
      continue: !n._zod.def.abort
    };
    n._zod.def.params && (o.params = n._zod.def.params), t.issues.push(Ct(o));
  }
}
var Wh = class extends Error {
  constructor() {
    super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
  }
}, mn = "~memo", qo = [];
function na(e) {
  return e !== null && typeof e == "object";
}
function Fr(e) {
  return e.map((t) => t.path ? {
    ...t,
    path: t.path.slice()
  } : { ...t });
}
var oa = /* @__PURE__ */ new WeakMap(), gt = 0, nr = 1, St = 2;
function or(e, t, r) {
  const n = oa.get(e);
  if (n !== void 0) return n ? St : gt;
  if (t.has(e)) return St;
  t.add(e);
  let o = gt;
  const i = (u) => {
    if (o !== St && u?._zod) {
      const l = or(u, t, r);
      l > o && (o = l);
    }
  }, s = (u, l) => {
    let f = gt;
    for (const d of Reflect.ownKeys(u)) {
      const h = Object.getOwnPropertyDescriptor(u, d);
      if (l && !h.enumerable) continue;
      const g = h.get ? nr : h.value?._zod ? or(h.value, t, r) : gt;
      g > f && (f = g);
    }
    return f;
  }, a = (u) => {
    u > o && (o = u);
  }, c = e._zod.def;
  switch (c.type) {
    case "object": {
      const u = Nn(c);
      a(u ? s(u, !0) : nr), i(c.catchall);
      break;
    }
    case "array":
      i(c.element);
      break;
    case "tuple":
      for (const u of c.items) i(u);
      i(c.rest);
      break;
    case "record":
    case "map":
      i(c.keyType), i(c.valueType);
      break;
    case "set":
      i(c.valueType);
      break;
    case "union":
      for (const u of c.options) i(u);
      break;
    case "intersection":
      i(c.left), i(c.right);
      break;
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "catch":
    case "readonly":
    case "nonoptional":
    case "promise":
    case "success":
      i(c.innerType);
      break;
    case "pipe":
      i(c.in), i(c.out);
      break;
    case "function":
      i(c.input), i(c.output);
      break;
    case "lazy": {
      const u = c._cachedInner ?? (r ? e._zod.innerType : void 0);
      a(u ? or(u, t, !1) : nr);
      break;
    }
    case "template_literal":
    case "string":
    case "number":
    case "int":
    case "boolean":
    case "bigint":
    case "symbol":
    case "undefined":
    case "null":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "date":
    case "nan":
    case "enum":
    case "literal":
    case "file":
    case "transform":
    case "custom":
      break;
    default:
      for (const u in c) {
        const l = Object.getOwnPropertyDescriptor(c, u);
        if (!l || l.get) continue;
        const f = l.value;
        if (!(!f || typeof f != "object")) {
          if (f._zod) i(f);
          else if (Array.isArray(f)) for (const d of f) i(d);
        }
      }
  }
  return t.delete(e), Vh(e, o);
}
function Vh(e, t) {
  return t !== nr && oa.set(e, t === St), t;
}
function Hh(e, t) {
  let r = e.buckets.get(t);
  return r || (r = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, r)), r;
}
var Gt, Kt = [], Jh = {
  alloc(e, t, r) {
    const n = Gt;
    if (!n) return r;
    Gt = void 0;
    const o = {
      value: r,
      issues: null
    };
    return n.set(t.value, o), Kt.push(o), r;
  },
  guard(e) {
    var t;
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
      const r = e._zod.parse, n = (o, i) => {
        if (i.direction !== "backward" && Yh(i, o.value)) throw new Wh();
        return r(o, i);
      };
      e._zod.parse = n, e._zod.run === r && (e._zod.run = n);
    });
  },
  attach(e) {
    var t;
    let r, n = !1, o, i;
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
      const s = e._zod.parse, a = (c, u) => {
        if (r === void 0) {
          const b = or(e, /* @__PURE__ */ new Set(), !1);
          if (b === gt)
            return e._zod.parse = s, e._zod.run === a && (e._zod.run = s), s(c, u);
          b === St || n ? r = !0 : n = !0;
        }
        const l = c.value;
        if (!na(l)) return s(c, u);
        let f = u[mn];
        f || (f = {
          buckets: /* @__PURE__ */ new WeakMap(),
          backEdges: void 0
        }, u[mn] = f);
        let d;
        o === u ? d = i : (d = Hh(f, e), o = u, i = d);
        const h = d.get(l);
        if (h)
          return c.value = h.value, h.issues ? h.issues.length && c.issues.push(...Fr(h.issues)) : (c.memo = !0, f.backEdges ?? (f.backEdges = /* @__PURE__ */ new WeakSet()), f.backEdges.add(h.value)), c;
        Gt = d;
        const g = Kt.length, v = s(c, u);
        Gt = void 0;
        const w = Kt.length > g ? Kt.pop() : void 0;
        return v instanceof Promise ? v.then((b) => (w && (w.issues = b.issues.length ? Fr(b.issues) : qo), b)) : (w && (w.issues = v.issues.length ? Fr(v.issues) : qo), v);
      };
      e._zod.parse = a, e._zod.run === s && (e._zod.run = a);
    });
  }
};
function Qh() {
  return Jh;
}
function Yh(e, t) {
  const r = e[mn]?.backEdges;
  return r !== void 0 && na(t) && r.has(t);
}
var Xh = () => {
  const e = {
    string: {
      unit: "characters",
      verb: "to have"
    },
    file: {
      unit: "bytes",
      verb: "to have"
    },
    array: {
      unit: "items",
      verb: "to have"
    },
    set: {
      unit: "items",
      verb: "to have"
    },
    map: {
      unit: "entries",
      verb: "to have"
    }
  };
  function t(i) {
    return e[i] ?? null;
  }
  const r = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    mac: "MAC address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    currency_code: "currency code",
    credit_card: "credit card number",
    iban: "IBAN",
    jwt: "JWT",
    template_literal: "input"
  }, n = { nan: "NaN" };
  function o(i, s) {
    return i === "number" && typeof s == "number" && !Number.isFinite(s) ? String(s) : n[i] ?? i;
  }
  return (i) => {
    switch (i.code) {
      case "invalid_type":
        return `Invalid input: expected ${o(i.expected)}, received ${o(Ad(i.input), i.input)}`;
      case "invalid_value":
        return i.values.length === 1 ? `Invalid input: expected ${$s(i.values[0])}` : `Invalid option: expected one of ${Ao(i.values, "|")}`;
      case "too_big": {
        const s = i.exact ? "exactly " : i.inclusive ? "<=" : "<", a = t(i.origin);
        return a ? `Too big: expected ${i.origin ?? "value"} to have ${s}${i.maximum.toString()} ${a.unit ?? "elements"}` : `Too big: expected ${i.origin ?? "value"} to be ${s}${i.maximum.toString()}`;
      }
      case "too_small": {
        const s = i.exact ? "exactly " : i.inclusive ? ">=" : ">", a = t(i.origin);
        return a ? `Too small: expected ${i.origin} to have ${s}${i.minimum.toString()} ${a.unit}` : `Too small: expected ${i.origin} to be ${s}${i.minimum.toString()}`;
      }
      case "invalid_format": {
        const s = i;
        return s.format === "starts_with" ? `Invalid string: must start with "${s.prefix}"` : s.format === "ends_with" ? `Invalid string: must end with "${s.suffix}"` : s.format === "includes" ? `Invalid string: must include "${s.includes}"` : s.format === "regex" ? `Invalid string: must match pattern ${s.pattern}` : `Invalid ${r[s.format] ?? i.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${i.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${i.keys.length > 1 ? "s" : ""}: ${Ao(i.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${i.origin}`;
      case "invalid_union":
        return i.options && Array.isArray(i.options) && i.options.length > 0 ? `Invalid discriminator value. Expected ${i.options.map((s) => `'${s}'`).join(" | ")}` : i.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
      case "invalid_element":
        return `Invalid value in ${i.origin}`;
      default:
        return "Invalid input";
    }
  };
};
function ep() {
  return { localeError: Xh() };
}
var Zo, tp = class {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(e, ...t) {
    const r = t[0];
    return this._map.set(e, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, e), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(e) {
    const t = this._map.get(e);
    return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
  }
  get(e) {
    const t = e._zod.parent;
    if (t) {
      const r = { ...this.get(t) ?? {} };
      delete r.id;
      const n = {
        ...r,
        ...this._map.get(e)
      };
      return Object.keys(n).length ? n : void 0;
    }
    return this._map.get(e);
  }
  has(e) {
    return this._map.has(e);
  }
};
function rp() {
  return new tp();
}
(Zo = globalThis).__zod_globalRegistry ?? (Zo.__zod_globalRegistry = rp());
var vt = globalThis.__zod_globalRegistry;
function ia(e) {
  return e.checks && (e.checks = [...e.checks]), e;
}
// @__NO_SIDE_EFFECTS__
function np(e, t) {
  return new e(ia({
    type: "string",
    ...I(t)
  }));
}
// @__NO_SIDE_EFFECTS__
function op(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ip(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function sa(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function sp(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ap(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function cp(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function aa(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function up(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function lp(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function dp(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function fp(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function hp(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function pp(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function mp(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function gp(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vp(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function yp(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function wp(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function bp(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Sp(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _p(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ip(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ep(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ap(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Pp(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Tp(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Op(e, t) {
  return new e(ia({
    type: "number",
    checks: [],
    ...I(t)
  }));
}
// @__NO_SIDE_EFFECTS__
function Rp(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Cp(e, t) {
  return new e({
    type: "boolean",
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function kp(e) {
  return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function Np(e, t) {
  return new e({
    type: "never",
    ...I(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Bo(e, t) {
  return new Bs({
    check: "less_than",
    ...I(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function jr(e, t) {
  return new Bs({
    check: "less_than",
    ...I(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Go(e, t) {
  return new Gs({
    check: "greater_than",
    ...I(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function qr(e, t) {
  return new Gs({
    check: "greater_than",
    ...I(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Ko(e, t) {
  return new Cf({
    check: "multiple_of",
    ...I(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function ca(e, t) {
  return new Nf({
    check: "max_length",
    ...I(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function mr(e, t) {
  return new Mf({
    check: "min_length",
    ...I(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function ua(e, t) {
  return new Df({
    check: "length_equals",
    ...I(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Mp(e, t) {
  return new $f({
    check: "string_format",
    format: "regex",
    ...I(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function Dp(e) {
  return new Lf({
    check: "string_format",
    format: "lowercase",
    ...I(e)
  });
}
// @__NO_SIDE_EFFECTS__
function $p(e) {
  return new Uf({
    check: "string_format",
    format: "uppercase",
    ...I(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Lp(e, t) {
  return new xf({
    check: "string_format",
    format: "includes",
    ...I(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Up(e, t) {
  return new zf({
    check: "string_format",
    format: "starts_with",
    ...I(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function xp(e, t) {
  return new Ff({
    check: "string_format",
    format: "ends_with",
    ...I(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function it(e) {
  return new jf({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function zp(e) {
  return /* @__PURE__ */ it((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Fp() {
  return /* @__PURE__ */ it((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function jp() {
  return /* @__PURE__ */ it((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function qp() {
  return /* @__PURE__ */ it((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Zp() {
  return /* @__PURE__ */ it((e) => fd(e));
}
// @__NO_SIDE_EFFECTS__
function Bp(e, t, r) {
  return new e({
    type: "array",
    element: t,
    ...I(r)
  });
}
// @__NO_SIDE_EFFECTS__
function Gp(e, t, r) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...I(r)
  });
}
// @__NO_SIDE_EFFECTS__
function Kp(e, t) {
  const r = /* @__PURE__ */ Wp((n) => (n.addIssue = (o) => {
    if (typeof o == "string") n.issues.push(Ct(o, n.value, r._zod.def));
    else {
      const i = o;
      i.fatal && (i.continue = !1), i.code ?? (i.code = "custom"), "input" in i || (i.input = n.value), i.inst ?? (i.inst = r), i.continue ?? (i.continue = !r._zod.def.abort), n.issues.push(Ct(i));
    }
  }, e(n.value, n)), t);
  return r;
}
// @__NO_SIDE_EFFECTS__
function Wp(e, t) {
  const r = new H({
    check: "custom",
    ...I(t)
  });
  return r._zod.check = e, r;
}
function _t(e, ...t) {
  for (const r of t) for (const n of Reflect.ownKeys(r)) Object.prototype.propertyIsEnumerable.call(r, n) && me(e, n, r[n]);
  return e;
}
function la(e) {
  let t = e?.target ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: e?.metadata ?? vt,
    target: t,
    unrepresentable: e?.unrepresentable ?? "throw",
    override: e?.override ?? (() => {
    }),
    io: e?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    sharedDefsExtractedFor: void 0,
    sharedEmitDoneFor: void 0,
    cycles: e?.cycles ?? "ref",
    reused: e?.reused ?? "inline",
    intersections: [],
    deferred: [],
    external: e?.external ?? void 0
  };
}
function Ee(e, t, r, n, o) {
  const i = typeof t.unrepresentable == "function" ? t.unrepresentable({
    zodSchema: e,
    path: n.path,
    message: o
  }) : t.unrepresentable;
  if (i === "any") return !1;
  if (i === void 0 || i === "throw") throw new Error(o);
  return Object.assign(r, i), !0;
}
function j(e, t, r = {
  path: [],
  schemaPath: []
}) {
  var n;
  const o = e._zod.def, i = t.seen.get(e);
  if (i)
    return i.count++, r.schemaPath.includes(e) && (i.cycle = r.path), i.schema;
  const s = {
    schema: {},
    count: 1,
    cycle: void 0,
    path: r.path
  };
  t.seen.set(e, s), t.sharedDefsExtractedFor = void 0, t.sharedEmitDoneFor = void 0;
  const a = e._zod.toJSONSchema?.();
  if (a) s.schema = a;
  else {
    const u = {
      ...r,
      schemaPath: [...r.schemaPath, e],
      path: r.path
    };
    if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, s.schema, u);
    else {
      const f = s.schema, d = t.processors[o.type];
      if (!d) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      d(e, t, f, u);
    }
    const l = e._zod.parent;
    l && (s.ref || (s.ref = l), j(l, t, u), t.seen.get(l).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && _t(s.schema, c), t.io === "input" && K(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && "_prefault" in s.schema && ((n = s.schema).default ?? (n.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function Wo(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function da(e, t) {
  const r = e.seen.get(t);
  if (!r) throw new Error("Unprocessed schema. This is a bug in Zod.");
  if (e.external && e.sharedDefsExtractedFor === e.external) return;
  const n = /* @__PURE__ */ new Map();
  for (const s of e.seen.entries()) {
    const a = e.metadataRegistry.get(s[0])?.id;
    if (a) {
      const c = n.get(a);
      if (c && c !== s[0]) throw new Error(`Duplicate schema id "${a}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      n.set(a, s[0]);
    }
  }
  const o = (s) => {
    const a = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const f = e.external.registry.get(s[0])?.id, d = e.external.uri ?? ((g) => g);
      if (f) return { ref: d(f) };
      const h = s[1].defId ?? s[1].schema.id ?? `schema${e.counter++}`;
      return s[1].defId = h, {
        defId: h,
        ref: `${d("__shared")}#/${a}/${Wo(h)}`
      };
    }
    const c = "#", u = `${c}/${a}/`;
    if (s[1] === r && !s[1].schema.id) return { ref: c };
    const l = s[1].schema.id ?? `__schema${e.counter++}`;
    return {
      defId: l,
      ref: u + Wo(l)
    };
  }, i = (s) => {
    if (s[1].schema.$ref) return;
    const a = s[1], { ref: c, defId: u } = o(s);
    a.def = { ...a.schema }, u && (a.defId = u);
    const l = a.schema;
    for (const f in l) delete l[f];
    l.$ref = c;
  };
  if (e.cycles === "throw") for (const s of e.seen.entries()) {
    const a = s[1];
    if (a.cycle) throw new Error(`Cycle detected: #/${a.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
  }
  for (const s of e.seen.entries()) {
    const a = s[1];
    if (t === s[0]) {
      i(s);
      continue;
    }
    if (e.external) {
      const c = e.external.registry.get(s[0])?.id;
      if (t !== s[0] && c) {
        i(s);
        continue;
      }
    }
    if (e.metadataRegistry.get(s[0])?.id) {
      i(s);
      continue;
    }
    if (a.cycle) {
      i(s);
      continue;
    }
    a.count > 1 && e.reused === "ref" && i(s);
  }
  e.external && (e.sharedDefsExtractedFor = e.external);
}
function fa(e) {
  const t = e.anyOf;
  if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
  const r = [];
  for (const n of t) {
    if (!n || typeof n != "object") return;
    fa(n);
    const o = Object.keys(n);
    if (o.length !== 1 || o[0] !== "type") return;
    const i = n.type;
    for (const s of Array.isArray(i) ? i : [i]) {
      if (typeof s != "string") return;
      r.includes(s) || r.push(s);
    }
  }
  delete e.anyOf, e.type = r.length === 1 ? r[0] : r;
}
var ha = /* @__PURE__ */ new Set([
  "type",
  "properties",
  "required",
  "additionalProperties"
]), Vo = ["oneOf", "anyOf"];
function Ho(e) {
  const t = e.additionalProperties;
  return t === void 0 || t === !1 || typeof t != "object" || t === null ? null : Object.keys(t).length ? t : null;
}
function gn(e) {
  const t = [];
  for (const i of e) {
    if (typeof i != "object" || i.type !== "object") return null;
    for (const s in i) if (!ha.has(s)) return null;
    t.push(i);
  }
  const r = {}, n = /* @__PURE__ */ new Set();
  for (const i of t) {
    for (const s in i.properties) {
      if (Object.prototype.hasOwnProperty.call(r, s)) continue;
      const a = [];
      for (const u of t) {
        const l = u.properties?.[s] ?? Ho(u);
        l != null && (a.some((f) => JSON.stringify(f) === JSON.stringify(l)) || a.push(l));
      }
      const c = a.length === 1 ? a[0] : gn(a) ?? { allOf: a };
      me(r, s, c);
    }
    for (const s of i.required ?? []) n.add(s);
  }
  const o = {
    type: "object",
    properties: r
  };
  if (n.size && (o.required = [...n]), t.every((i) => i.additionalProperties === !1)) o.additionalProperties = !1;
  else {
    const i = [];
    for (const s of t) {
      const a = Ho(s);
      a && !i.some((c) => JSON.stringify(c) === JSON.stringify(a)) && i.push(a);
    }
    i.length === 1 ? o.additionalProperties = i[0] : i.length > 1 && (o.additionalProperties = { allOf: i });
  }
  return o;
}
function Vp(e) {
  const t = e.allOf;
  if (!Array.isArray(t) || t.length < 2) return;
  for (const o of ha) if (o in e) return;
  const r = t.filter((o) => Vo.some((i) => Array.isArray(o[i])));
  let n = null;
  if (!r.length) n = gn(t);
  else {
    const o = r[0], i = Vo.find((c) => Array.isArray(o[c]));
    if (Object.keys(o).length !== 1) return;
    const s = t.filter((c) => c !== o), a = o[i].map((c) => gn([...s, c]));
    if (a.some((c) => !c)) return;
    n = { [i]: a };
  }
  n && (delete e.allOf, _t(e, n));
}
function pa(e, t) {
  const r = e.seen.get(t);
  if (!r) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const n = (a) => {
    const c = e.seen.get(a);
    if (c.ref === null) return;
    const u = c.def ?? c.schema, l = { ...u }, f = c.ref;
    if (c.ref = null, f) {
      n(f);
      const h = e.seen.get(f), g = h.schema;
      if (g.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (u.allOf = u.allOf ?? [], u.allOf.push(g)) : _t(u, g), _t(u, l), a._zod.parent === f) for (const v in u)
        v === "$ref" || v === "allOf" || v in l || delete u[v];
      if (g.$ref && h.def) for (const v in u)
        v === "$ref" || v === "allOf" || v in h.def && JSON.stringify(u[v]) === JSON.stringify(h.def[v]) && delete u[v];
    }
    const d = a._zod.parent;
    if (d && d !== f) {
      n(d);
      const h = e.seen.get(d);
      if (h?.schema.$ref && (u.$ref = h.schema.$ref, h.def))
        for (const g in u)
          g === "$ref" || g === "allOf" || g in h.def && JSON.stringify(u[g]) === JSON.stringify(h.def[g]) && delete u[g];
    }
    e.override({
      zodSchema: a,
      jsonSchema: u,
      path: c.path ?? []
    });
  };
  if (!e.external || e.sharedEmitDoneFor !== e.external) {
    for (const a of [...e.seen.entries()].reverse()) n(a[0]);
    if (e.target !== "openapi-3.0") for (const a of e.seen.entries()) fa(a[1].def ?? a[1].schema);
    for (const a of e.deferred) a();
    if (e.intersections.length) {
      const a = /* @__PURE__ */ new Map();
      for (const c of e.seen.values()) for (const u of [c.schema, c.def]) {
        const l = u?.allOf;
        if (!Array.isArray(l)) continue;
        const f = a.get(l);
        f ? f.push(u) : a.set(l, [u]);
      }
      for (const c of e.intersections) for (const u of a.get(c) ?? []) Vp(u);
    }
  }
  const o = {};
  if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
    const a = e.external.registry.get(t)?.id;
    if (!a) throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(a);
  }
  _t(o, r.defId ? r.schema : r.def ?? r.schema);
  const i = e.metadataRegistry.get(t)?.id;
  i !== void 0 && o.id === i && delete o.id;
  const s = e.external?.defs ?? {};
  if (!e.external || e.sharedEmitDoneFor !== e.external) for (const a of e.seen.entries()) {
    const c = a[1];
    c.def && c.defId && (c.def.id === c.defId && delete c.def.id, me(s, c.defId, c.def));
  }
  e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(s).length > 0 && (e.target === "draft-2020-12" ? o.$defs = s : o.definitions = s);
  try {
    const a = JSON.parse(JSON.stringify(o));
    return Object.defineProperty(a, "~standard", {
      value: {
        ...t["~standard"],
        jsonSchema: {
          input: gr(t, "input", e.processors),
          output: gr(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), a;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function K(e, t) {
  const r = t ?? { seen: /* @__PURE__ */ new Set() };
  if (r.seen.has(e)) return !1;
  r.seen.add(e);
  const n = e._zod.def;
  if (n.type === "transform") return !0;
  if (n.type === "array") return K(n.element, r);
  if (n.type === "set") return K(n.valueType, r);
  if (n.type === "lazy") return K(n.getter(), r);
  if (n.type === "promise" || n.type === "optional" || n.type === "nonoptional" || n.type === "nullable" || n.type === "readonly" || n.type === "default" || n.type === "prefault" || n.type === "catch") return K(n.innerType, r);
  if (n.type === "intersection") return K(n.left, r) || K(n.right, r);
  if (n.type === "record" || n.type === "map") return K(n.keyType, r) || K(n.valueType, r);
  if (n.type === "pipe")
    return e._zod.traits.has("$ZodCodec") ? !0 : K(n.in, r) || K(n.out, r);
  if (n.type === "object") {
    for (const o in n.shape) if (K(n.shape[o], r)) return !0;
    return !1;
  }
  if (n.type === "union") {
    for (const o of n.options) if (K(o, r)) return !0;
    return !1;
  }
  if (n.type === "tuple") {
    for (const o of n.items) if (K(o, r)) return !0;
    return !!(n.rest && K(n.rest, r));
  }
  return !1;
}
var Hp = (e, t = {}) => (r) => {
  const n = la({
    ...r,
    processors: t
  });
  return j(e, n), da(n, e), pa(n, e);
}, gr = (e, t, r = {}) => (n) => {
  const { libraryOptions: o, target: i } = n ?? {}, s = la({
    ...o ?? {},
    target: i,
    io: t,
    processors: r
  });
  return j(e, s), da(s, e), pa(s, e);
}, tt = (e, t, r) => {
  (e[t] === void 0 || r > e[t]) && (e[t] = r);
}, rt = (e, t, r) => {
  (e[t] === void 0 || r < e[t]) && (e[t] = r);
}, Jo = (e, t) => {
  tt(e, "minimum", t), rt(e, "maximum", t);
}, ma = (e, t) => {
  e.multipleOf ?? (e.multipleOf = []), e.multipleOf.includes(t) || e.multipleOf.push(t);
}, ga = (e, t) => {
  e.patterns ?? (e.patterns = /* @__PURE__ */ new Set()), e.patterns.add(t);
}, va = (e, t) => {
  e.mime = e.mime ? e.mime.filter((r) => t.includes(r)) : [...t];
}, ya = (e, t) => {
  e.format = t, t.includes("int") && (e.isInt = !0);
}, Qo = (e, t) => tt(e, "minimum", t.minimum), Yo = (e, t) => rt(e, "maximum", t.maximum), Xo = (e) => (t, r) => {
  ya(t, r.format);
  const [n, o] = e[r.format];
  tt(t, "minimum", n), rt(t, "maximum", o);
}, Jp = {
  greater_than: (e, t) => tt(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
  less_than: (e, t) => rt(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
  multiple_of: (e, t) => ma(e, t.value),
  number_format: Xo(Ls),
  bigint_format: Xo(gd),
  min_length: Qo,
  max_length: Yo,
  length_equals: (e, t) => Jo(e, t.length),
  min_size: Qo,
  max_size: Yo,
  size_equals: (e, t) => Jo(e, t.size),
  string_format: (e, t) => {
    ya(e, t.format), t.pattern && ga(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
  },
  mime_type: (e, t) => va(e, t.mime)
};
function oe(e) {
  const t = {}, r = e._zod.def, n = e._zod.traits.has("$ZodCheck") ? [e, ...r.checks ?? []] : r.checks ?? [];
  for (const i of n) Jp[i._zod.def.check]?.(t, i._zod.def);
  const o = e._zod.bag;
  o.minimum !== void 0 && tt(t, "minimum", o.minimum), o.exclusiveMinimum !== void 0 && tt(t, "exclusiveMinimum", o.exclusiveMinimum), o.maximum !== void 0 && rt(t, "maximum", o.maximum), o.exclusiveMaximum !== void 0 && rt(t, "exclusiveMaximum", o.exclusiveMaximum), o.multipleOf !== void 0 && ma(t, o.multipleOf), o.format !== void 0 && (t.format ?? (t.format = o.format), o.format.includes("int") && (t.isInt = !0)), o.mime && va(t, o.mime);
  for (const i of o.patterns ?? []) ga(t, i);
  return t;
}
var Qp = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
}, Yp = /* @__PURE__ */ new Map([[Qs, vf], [qn, yf]]), wa = (e) => Yp.get(e) ?? e, Xp = (e, t, r, n) => {
  const o = r;
  o.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u, laxFormat: l } = oe(e);
  if (typeof i == "number" && (o.minLength = i), typeof s == "number" && (o.maxLength = s), a && (o.format = Qp[a] ?? a, o.format === "" && delete o.format, (a === "time" || l) && delete o.format), u && (o.contentEncoding = u), c && c.size > 0) {
    const f = [...c].map(wa);
    f.length === 1 ? o.pattern = f[0].source : f.length > 1 && (o.allOf = [...f.map((d) => ({
      ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
      pattern: d.source
    }))]);
  }
}, em = (e, t, r, n) => {
  const o = r, { minimum: i, maximum: s, multipleOf: a, exclusiveMaximum: c, exclusiveMinimum: u, isInt: l } = oe(e);
  o.type = l ? "integer" : "number";
  const f = typeof u == "number" && u >= (i ?? Number.NEGATIVE_INFINITY), d = typeof c == "number" && c <= (s ?? Number.POSITIVE_INFINITY), h = t.target === "draft-04" || t.target === "openapi-3.0";
  if (f ? h ? (o.minimum = u, o.exclusiveMinimum = !0) : o.exclusiveMinimum = u : typeof i == "number" && (o.minimum = i), d ? h ? (o.maximum = c, o.exclusiveMaximum = !0) : o.exclusiveMaximum = c : typeof s == "number" && (o.maximum = s), a) {
    const g = /* @__PURE__ */ new Set();
    for (const b of a) Number.isFinite(b) && b !== 0 ? g.add(Math.abs(b)) : Ee(e, t, o, n, `A multipleOf divisor of ${b} cannot be represented in JSON Schema`);
    const [v, ...w] = g;
    v !== void 0 && (o.multipleOf = v), w.length && (o.allOf = [...o.allOf ?? [], ...w.map((b) => ({ multipleOf: b }))]);
  }
}, tm = (e, t, r, n) => {
  r.type = "boolean";
}, rm = (e, t, r, n) => {
  r.not = {};
}, nm = (e, t, r, n) => {
}, om = (e, t, r, n) => {
  const o = e._zod.def, i = dn(o.entries);
  if (i.length === 0) {
    r.not = {};
    return;
  }
  i.every((s) => typeof s == "number") && (r.type = "number"), i.every((s) => typeof s == "string") && (r.type = "string"), r.enum = i;
}, im = (e, t, r, n) => {
  const o = e._zod.def;
  if (o.values.length === 0) {
    r.not = {};
    return;
  }
  const i = [];
  for (const s of o.values) if (s === void 0) {
    if (Ee(e, t, r, n, "Literal `undefined` cannot be represented in JSON Schema")) return;
  } else if (typeof s == "bigint") {
    if (Ee(e, t, r, n, "BigInt literals cannot be represented in JSON Schema")) return;
    i.push(Number(s));
  } else i.push(s);
  if (i.length !== 0)
    if (i.length === 1) {
      const s = i[0];
      r.type = s === null ? "null" : typeof s, t.target === "draft-04" || t.target === "openapi-3.0" ? r.enum = [s] : r.const = s;
    } else
      i.every((s) => typeof s == "number") && (r.type = "number"), i.every((s) => typeof s == "string") && (r.type = "string"), i.every((s) => typeof s == "boolean") && (r.type = "boolean"), i.every((s) => s === null) && (r.type = "null"), r.enum = i;
}, sm = (e, t, r, n) => {
  Ee(e, t, r, n, "Custom types cannot be represented in JSON Schema");
}, am = (e, t, r, n) => {
  Ee(e, t, r, n, "Transforms cannot be represented in JSON Schema");
}, cm = (e, t, r, n) => {
  const o = r, i = e._zod.def, { minimum: s, maximum: a } = oe(e);
  typeof s == "number" && (o.minItems = s), typeof a == "number" && (o.maxItems = a), o.type = "array", o.items = j(i.element, t, {
    ...n,
    path: [...n.path, "items"]
  });
};
function vr(e) {
  const t = e._zod.def;
  return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? vr(t.out) : t.type === "catch" ? vr(t.innerType) : e._zod.optin;
}
var um = (e, t, r, n) => {
  const o = r, i = e._zod.def, s = i.shape;
  if (Object.getOwnPropertySymbols(s).length && Ee(e, t, o, n, "Symbol keys cannot be represented in JSON Schema")) return;
  o.type = "object", o.properties = {};
  for (const c in s) me(o.properties, c, j(s[c], t, {
    ...n,
    path: [
      ...n.path,
      "properties",
      c
    ]
  }));
  const a = [];
  for (const c of Object.keys(s)) {
    const u = i.shape[c];
    (t.io === "input" ? vr(u) === void 0 : u._zod.optout === void 0) && a.push(c);
  }
  a.length > 0 && (o.required = a), i.catchall?._zod.def.type === "never" ? o.additionalProperties = !1 : i.catchall ? i.catchall && (o.additionalProperties = j(i.catchall, t, {
    ...n,
    path: [...n.path, "additionalProperties"]
  })) : t.io === "output" && (o.additionalProperties = !1);
}, lm = (e, t, r, n) => {
  const o = e._zod.def, i = o.inclusive === !1, s = o.options.map((a, c) => j(a, t, {
    ...n,
    path: [
      ...n.path,
      i ? "oneOf" : "anyOf",
      c
    ]
  }));
  i ? r.oneOf = s : r.anyOf = s;
}, dm = (e, t, r, n) => {
  const o = e._zod.def, i = j(o.left, t, {
    ...n,
    path: [
      ...n.path,
      "allOf",
      0
    ]
  }), s = j(o.right, t, {
    ...n,
    path: [
      ...n.path,
      "allOf",
      1
    ]
  }), a = (u) => "allOf" in u && Object.keys(u).length === 1, c = [...a(i) ? i.allOf : [i], ...a(s) ? s.allOf : [s]];
  r.allOf = c, t.intersections.push(c);
};
function vn(e, t, r) {
  if (t.$ref) {
    if (r.has(t)) return t;
    r.add(t);
    const g = e.get(t)?.def;
    if (!g) return t;
    const v = vn(e, g, r);
    return v === g ? t : v;
  }
  for (const g of ["anyOf", "oneOf"]) {
    const v = t[g];
    if (!Array.isArray(v)) continue;
    const w = v.map((b) => vn(e, b, r));
    w.some((b, S) => b !== v[S]) && (t = {
      ...t,
      [g]: w
    });
  }
  const n = Array.isArray(t.type) ? t.type : [t.type], o = !n.includes("string") && n.some((g) => g === "number" || g === "integer"), i = t.enum ?? (t.const !== void 0 ? [t.const] : void 0);
  if (!o && !i?.some((g) => typeof g == "number")) return t;
  const { minimum: s, maximum: a, exclusiveMinimum: c, exclusiveMaximum: u, multipleOf: l, format: f, id: d, ...h } = t;
  return h.enum ? h.enum = h.enum.map((g) => typeof g == "number" ? String(g) : g) : typeof h.const == "number" && (h.const = String(h.const)), o && (h.type = "string", i || (h.pattern = (n.includes("number") ? zn : Pf).source)), h;
}
var yn = /* @__PURE__ */ new WeakMap();
function fm(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
  const r = /* @__PURE__ */ new Map();
  for (const n of yn.get(e) ?? []) {
    const o = e.seen.get(n), i = (o?.def ?? o?.schema)?.propertyNames;
    if (!i || i === !0 || r.has(i)) continue;
    const s = vn(t, i, /* @__PURE__ */ new Set());
    s !== i && r.set(i, s);
  }
  if (r.size)
    for (const n of e.seen.values()) for (const o of [n.schema, n.def]) {
      const i = o && r.get(o.propertyNames);
      i && (o.propertyNames = i);
    }
}
var hm = (e, t, r, n) => {
  const o = r, i = e._zod.def;
  o.type = "object";
  const s = i.keyType, a = oe(s).patterns;
  if (i.mode === "loose" && a && a.size > 0) {
    const l = j(i.valueType, t, {
      ...n,
      path: [
        ...n.path,
        "patternProperties",
        "*"
      ]
    });
    o.patternProperties = {};
    for (const f of a) me(o.patternProperties, wa(f).source, l);
  } else {
    if (t.target === "draft-07" || t.target === "draft-2020-12") {
      o.propertyNames = j(i.keyType, t, {
        ...n,
        path: [...n.path, "propertyNames"]
      });
      let l = yn.get(t);
      l || (l = [], yn.set(t, l), t.deferred.push(() => fm(t))), l.push(e);
    }
    o.additionalProperties = j(i.valueType, t, {
      ...n,
      path: [...n.path, "additionalProperties"]
    });
  }
  const c = s._zod.values, u = t.io === "input" && vr(i.valueType) !== void 0;
  if (c && !i.partial && !u) {
    const l = [...c].filter((f) => typeof f == "string" || typeof f == "number");
    l.length > 0 && (o.required = l.map(String));
  }
}, pm = (e, t, r, n) => {
  const o = e._zod.def, i = j(o.innerType, t, n), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = o.innerType, r.nullable = !0) : r.anyOf = [i, { type: "null" }];
}, mm = (e, t, r, n) => {
  const o = e._zod.def;
  j(o.innerType, t, n);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, Zn = /* @__PURE__ */ Symbol();
function ba(e, t, r, n, o) {
  let i = !1;
  const s = JSON.stringify(e, (a, c) => typeof c != "bigint" ? c : (i = !0, null));
  return i ? (Ee(t, r, n, o, "BigInt defaults cannot be represented in JSON Schema"), Zn) : JSON.parse(s);
}
var gm = (e, t, r, n) => {
  const o = e._zod.def;
  j(o.innerType, t, n);
  const i = t.seen.get(e);
  i.ref = o.innerType;
  const s = ba(o.defaultValue, e, t, r, n);
  s !== Zn && (r.default = s);
}, vm = (e, t, r, n) => {
  const o = e._zod.def;
  j(o.innerType, t, n);
  const i = t.seen.get(e);
  if (i.ref = o.innerType, t.io !== "input") return;
  const s = ba(o.defaultValue, e, t, r, n);
  s !== Zn && (r._prefault = s);
}, ym = (e, t, r, n) => {
  const o = e._zod.def;
  j(o.innerType, t, n);
  const i = t.seen.get(e);
  i.ref = o.innerType;
  let s;
  try {
    s = o.catchValue(void 0);
  } catch {
    Ee(e, t, r, n, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  r.default = s;
}, wm = (e, t, r, n) => {
  const o = e._zod.def, i = o.in._zod.traits.has("$ZodTransform"), s = t.io === "input" ? i ? o.out : o.in : o.out;
  j(s, t, n);
  const a = t.seen.get(e);
  a.ref = s;
}, bm = (e, t, r, n) => {
  const o = e._zod.def;
  j(o.innerType, t, n);
  const i = t.seen.get(e);
  i.ref = o.innerType, r.readOnly = !0;
}, Sa = (e, t, r, n) => {
  const o = e._zod.def;
  j(o.innerType, t, n);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, ei = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function Wt(e, t, r) {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    get() {
      const n = r(this);
      return Object.defineProperty(this, t, {
        value: n,
        configurable: !0,
        writable: !0
      }), n;
    },
    set(n) {
      Object.defineProperty(this, t, {
        value: n,
        configurable: !0,
        writable: !0
      });
    }
  });
}
var Sm = (e, t) => {
  Ud.init(e, t), e.name = "ZodError";
  const r = Object.getPrototypeOf(e);
  ei.has(r) || (ei.add(r), Wt(r, "format", (n) => (o) => Fd(n, o)), Wt(r, "flatten", (n) => (o) => zd(n, o)), Wt(r, "addIssue", (n) => (o) => {
    n.issues.push(o), n.message = JSON.stringify(n.issues, fn, 2);
  }), Wt(r, "addIssues", (n) => (o) => {
    n.issues.push(...o), n.message = JSON.stringify(n.issues, fn, 2);
  }), Object.defineProperty(r, "isEmpty", {
    configurable: !0,
    enumerable: !1,
    get() {
      return this.issues.length === 0;
    }
  }));
}, ee = /* @__PURE__ */ y("ZodError", Sm, void 0, { Parent: Error }), _m = /* @__PURE__ */ $n(ee), Im = /* @__PURE__ */ Ln(ee), Em = /* @__PURE__ */ Un(ee), Am = /* @__PURE__ */ xn(ee), Pm = /* @__PURE__ */ Kd(ee), Tm = /* @__PURE__ */ Wd(ee), Om = /* @__PURE__ */ Vd(ee), Rm = /* @__PURE__ */ Hd(ee), Cm = /* @__PURE__ */ Jd(ee), km = /* @__PURE__ */ Qd(ee), Nm = /* @__PURE__ */ Yd(ee), Mm = /* @__PURE__ */ Xd(ee);
function Dm() {
  ie.localeError || ue(ep());
}
function kr() {
  ie.memoizer || ue({ memoizer: Qh() });
}
var z = /* @__PURE__ */ y("ZodType", (e, t) => (Dm(), x.init(e, t), e.def = t, e.type = t.type, e), {
  check(...e) {
    const t = this.def;
    return this.clone(Q(t, { checks: [...t.checks ?? [], ...e.map((r) => typeof r == "function" ? { _zod: {
      check: r,
      def: { check: "custom" },
      onattach: []
    } } : r)] }), { parent: !0 });
  },
  with(...e) {
    return this.check(...e);
  },
  clone(e, t) {
    return Ae(this, e, t);
  },
  brand() {
    return this;
  },
  register(e, t) {
    return e.add(this, t), this;
  },
  refine(e, t) {
    return this.check(Cg(e, t));
  },
  superRefine(e, t) {
    return this.check(kg(e, t));
  },
  overwrite(e) {
    return this.check(/* @__PURE__ */ it(e));
  },
  optional() {
    return oi(this);
  },
  exactOptional() {
    return vg(this);
  },
  nullable() {
    return ii(this);
  },
  nullish() {
    return oi(ii(this));
  },
  nonoptional(e) {
    return Ig(this, e);
  },
  array() {
    return N(this);
  },
  or(e) {
    return Oa([this, e]);
  },
  and(e) {
    return hg(this, e);
  },
  transform(e) {
    return si(this, gg(e));
  },
  default(e) {
    return bg(this, e);
  },
  prefault(e) {
    return _g(this, e);
  },
  catch(e) {
    return Ag(this, e);
  },
  pipe(e) {
    return si(this, e);
  },
  readonly() {
    return Og(this);
  },
  describe(e) {
    const t = this.clone();
    return vt.add(t, { description: e }), t;
  },
  meta(...e) {
    if (e.length === 0) return vt.get(this);
    const t = this.clone();
    return vt.add(t, e[0]), t;
  },
  isOptional() {
    return this.safeParse(void 0).success;
  },
  isNullable() {
    return this.safeParse(null).success;
  },
  apply(e, ...t) {
    return t.length === 0 ? e(this) : e(this, ...t);
  },
  get "~standard"() {
    return xs(this, "~standard", {
      ...Ws(this),
      jsonSchema: {
        input: gr(this, "input"),
        output: gr(this, "output")
      }
    });
  },
  set "~standard"(e) {
    Ie(this, "~standard", e);
  },
  parse: function e(t, r) {
    return _m(this, t, r, { callee: e });
  },
  parseAsync: async function e(t, r) {
    return await Im(this, t, r, { callee: e });
  },
  safeParse(e, t) {
    return Em(this, e, t);
  },
  async safeParseAsync(e, t) {
    return Am(this, e, t);
  },
  get spa() {
    return this?.safeParseAsync;
  },
  set spa(e) {
    Ie(this, "spa", e);
  },
  validate(e, t) {
    return Zd(this, e, t);
  },
  validateAsync(e, t) {
    return Gd(this, e, t);
  },
  encode: function e(t, r) {
    return Pm(this, t, r, { callee: e });
  },
  decode: function e(t, r) {
    return Tm(this, t, r, { callee: e });
  },
  encodeAsync: async function e(t, r) {
    return await Om(this, t, r, { callee: e });
  },
  decodeAsync: async function e(t, r) {
    return await Rm(this, t, r, { callee: e });
  },
  safeEncode(e, t) {
    return Cm(this, e, t);
  },
  safeDecode(e, t) {
    return km(this, e, t);
  },
  async safeEncodeAsync(e, t) {
    return Nm(this, e, t);
  },
  async safeDecodeAsync(e, t) {
    return Mm(this, e, t);
  },
  toJSONSchema(e) {
    return Hp(this, {})(e);
  },
  get description() {
    return vt.get(this)?.description;
  },
  get _def() {
    return this._zod.def;
  }
}), _a = /* @__PURE__ */ y("_ZodString", (e, t) => {
  jn.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => Xp(e, r, n, o);
}, /* @__PURE__ */ zs({
  format: (e) => oe(e).format ?? null,
  minLength: (e) => oe(e).minimum ?? null,
  maxLength: (e) => oe(e).maximum ?? null
}, {
  regex(...e) {
    return this.check(/* @__PURE__ */ Mp(...e));
  },
  includes(...e) {
    return this.check(/* @__PURE__ */ Lp(...e));
  },
  startsWith(...e) {
    return this.check(/* @__PURE__ */ Up(...e));
  },
  endsWith(...e) {
    return this.check(/* @__PURE__ */ xp(...e));
  },
  min(...e) {
    return this.check(/* @__PURE__ */ mr(...e));
  },
  max(...e) {
    return this.check(/* @__PURE__ */ ca(...e));
  },
  length(...e) {
    return this.check(/* @__PURE__ */ ua(...e));
  },
  nonempty(...e) {
    return this.check(/* @__PURE__ */ mr(1, ...e));
  },
  lowercase(e) {
    return this.check(/* @__PURE__ */ Dp(e));
  },
  uppercase(e) {
    return this.check(/* @__PURE__ */ $p(e));
  },
  trim() {
    return this.check(/* @__PURE__ */ Fp());
  },
  normalize(...e) {
    return this.check(/* @__PURE__ */ zp(...e));
  },
  toLowerCase() {
    return this.check(/* @__PURE__ */ jp());
  },
  toUpperCase() {
    return this.check(/* @__PURE__ */ qp());
  },
  slugify() {
    return this.check(/* @__PURE__ */ Zp());
  }
})), $m = /* @__PURE__ */ y("ZodString", (e, t) => {
  jn.init(e, t), _a.init(e, t);
}, {
  email(e) {
    return this.check(/* @__PURE__ */ op(Fm, e));
  },
  url(e) {
    return this.check(/* @__PURE__ */ aa(Ia, e));
  },
  jwt(e) {
    return this.check(/* @__PURE__ */ Ip(og, e));
  },
  emoji(e) {
    return this.check(/* @__PURE__ */ up(Bm, e));
  },
  guid(e) {
    return this.check(/* @__PURE__ */ ip(jm, e));
  },
  uuid(e) {
    return this.check(/* @__PURE__ */ sa(yt, e));
  },
  uuidv4(e) {
    return this.check(/* @__PURE__ */ sp(yt, e));
  },
  uuidv6(e) {
    return this.check(/* @__PURE__ */ ap(yt, e));
  },
  uuidv7(e) {
    return this.check(/* @__PURE__ */ cp(yt, e));
  },
  nanoid(e) {
    return this.check(/* @__PURE__ */ lp(Gm, e));
  },
  cuid(e) {
    return this.check(/* @__PURE__ */ dp(Km, e));
  },
  cuid2(e) {
    return this.check(/* @__PURE__ */ fp(Wm, e));
  },
  ulid(e) {
    return this.check(/* @__PURE__ */ hp(Vm, e));
  },
  base64(e) {
    return this.check(/* @__PURE__ */ bp(tg, e));
  },
  base64url(e) {
    return this.check(/* @__PURE__ */ Sp(rg, e));
  },
  xid(e) {
    return this.check(/* @__PURE__ */ pp(Hm, e));
  },
  ksuid(e) {
    return this.check(/* @__PURE__ */ mp(Jm, e));
  },
  ipv4(e) {
    return this.check(/* @__PURE__ */ gp(Qm, e));
  },
  ipv6(e) {
    return this.check(/* @__PURE__ */ vp(Ym, e));
  },
  cidrv4(e) {
    return this.check(/* @__PURE__ */ yp(Xm, e));
  },
  cidrv6(e) {
    return this.check(/* @__PURE__ */ wp(eg, e));
  },
  e164(e) {
    return this.check(/* @__PURE__ */ _p(ng, e));
  },
  datetime(e) {
    return this.check(/* @__PURE__ */ Ep(Lm, e));
  },
  date(e) {
    return this.check(/* @__PURE__ */ Ap(Um, e));
  },
  time(e) {
    return this.check(/* @__PURE__ */ Pp(xm, e));
  },
  duration(e) {
    return this.check(/* @__PURE__ */ Tp(zm, e));
  }
});
function p(e) {
  return /* @__PURE__ */ np($m, e);
}
var F = /* @__PURE__ */ y("ZodStringFormat", (e, t) => {
  L.init(e, t), _a.init(e, t);
}), Lm = /* @__PURE__ */ y("ZodISODateTime", (e, t) => {
  ah.init(e, t), F.init(e, t);
}), Um = /* @__PURE__ */ y("ZodISODate", (e, t) => {
  ch.init(e, t), F.init(e, t);
}), xm = /* @__PURE__ */ y("ZodISOTime", (e, t) => {
  uh.init(e, t), F.init(e, t);
}), zm = /* @__PURE__ */ y("ZodISODuration", (e, t) => {
  lh.init(e, t), F.init(e, t);
}), Fm = /* @__PURE__ */ y("ZodEmail", (e, t) => {
  Wf.init(e, t), F.init(e, t);
}), jm = /* @__PURE__ */ y("ZodGUID", (e, t) => {
  Gf.init(e, t), F.init(e, t);
}), yt = /* @__PURE__ */ y("ZodUUID", (e, t) => {
  Kf.init(e, t), F.init(e, t);
});
function qm(e) {
  return /* @__PURE__ */ sa(yt, e);
}
var Ia = /* @__PURE__ */ y("ZodURL", (e, t) => {
  Xf.init(e, t), F.init(e, t);
});
function Zm(e) {
  return /* @__PURE__ */ aa(Ia, e);
}
var Bm = /* @__PURE__ */ y("ZodEmoji", (e, t) => {
  eh.init(e, t), F.init(e, t);
}), Gm = /* @__PURE__ */ y("ZodNanoID", (e, t) => {
  th.init(e, t), F.init(e, t);
}), Km = /* @__PURE__ */ y("ZodCUID", (e, t) => {
  rh.init(e, t), F.init(e, t);
}), Wm = /* @__PURE__ */ y("ZodCUID2", (e, t) => {
  nh.init(e, t), F.init(e, t);
}), Vm = /* @__PURE__ */ y("ZodULID", (e, t) => {
  oh.init(e, t), F.init(e, t);
}), Hm = /* @__PURE__ */ y("ZodXID", (e, t) => {
  ih.init(e, t), F.init(e, t);
}), Jm = /* @__PURE__ */ y("ZodKSUID", (e, t) => {
  sh.init(e, t), F.init(e, t);
}), Qm = /* @__PURE__ */ y("ZodIPv4", (e, t) => {
  dh.init(e, t), F.init(e, t);
}), Ym = /* @__PURE__ */ y("ZodIPv6", (e, t) => {
  hh.init(e, t), F.init(e, t);
}), Xm = /* @__PURE__ */ y("ZodCIDRv4", (e, t) => {
  ph.init(e, t), F.init(e, t);
}), eg = /* @__PURE__ */ y("ZodCIDRv6", (e, t) => {
  gh.init(e, t), F.init(e, t);
}), tg = /* @__PURE__ */ y("ZodBase64", (e, t) => {
  vh.init(e, t), F.init(e, t);
}), rg = /* @__PURE__ */ y("ZodBase64URL", (e, t) => {
  wh.init(e, t), F.init(e, t);
}), ng = /* @__PURE__ */ y("ZodE164", (e, t) => {
  bh.init(e, t), F.init(e, t);
}), og = /* @__PURE__ */ y("ZodJWT", (e, t) => {
  _h.init(e, t), F.init(e, t);
}), Ea = /* @__PURE__ */ y("ZodNumber", (e, t) => {
  Ys.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => em(e, r, n, o), e.isFinite = !0;
}, /* @__PURE__ */ zs({
  minValue: (e) => {
    const { minimum: t, exclusiveMinimum: r } = oe(e);
    return Math.max(t ?? Number.NEGATIVE_INFINITY, r ?? Number.NEGATIVE_INFINITY);
  },
  maxValue: (e) => {
    const { maximum: t, exclusiveMaximum: r } = oe(e);
    return Math.min(t ?? Number.POSITIVE_INFINITY, r ?? Number.POSITIVE_INFINITY);
  },
  isInt: (e) => {
    const { isInt: t, multipleOf: r } = oe(e);
    return !!t || !!r?.some(Number.isSafeInteger);
  },
  format: (e) => oe(e).format ?? null
}, {
  gt(e, t) {
    return this.check(/* @__PURE__ */ Go(e, t));
  },
  gte(e, t) {
    return this.check(/* @__PURE__ */ qr(e, t));
  },
  min(e, t) {
    return this.check(/* @__PURE__ */ qr(e, t));
  },
  lt(e, t) {
    return this.check(/* @__PURE__ */ Bo(e, t));
  },
  lte(e, t) {
    return this.check(/* @__PURE__ */ jr(e, t));
  },
  max(e, t) {
    return this.check(/* @__PURE__ */ jr(e, t));
  },
  int(e) {
    return this.check(ti(e));
  },
  safe(e) {
    return this.check(ti(e));
  },
  positive(e) {
    return this.check(/* @__PURE__ */ Go(0, e));
  },
  nonnegative(e) {
    return this.check(/* @__PURE__ */ qr(0, e));
  },
  negative(e) {
    return this.check(/* @__PURE__ */ Bo(0, e));
  },
  nonpositive(e) {
    return this.check(/* @__PURE__ */ jr(0, e));
  },
  multipleOf(e, t) {
    return this.check(/* @__PURE__ */ Ko(e, t));
  },
  step(e, t) {
    return this.check(/* @__PURE__ */ Ko(e, t));
  },
  finite() {
    return this;
  }
}));
function T(e) {
  return /* @__PURE__ */ Op(Ea, e);
}
var ig = /* @__PURE__ */ y("ZodNumberFormat", (e, t) => {
  Ih.init(e, t), Ea.init(e, t);
});
function ti(e) {
  return /* @__PURE__ */ Rp(ig, e);
}
var sg = /* @__PURE__ */ y("ZodBoolean", (e, t) => {
  Eh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => tm(e, r, n, o);
});
function $(e) {
  return /* @__PURE__ */ Cp(sg, e);
}
var ag = /* @__PURE__ */ y("ZodUnknown", (e, t) => {
  Ah.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => nm(e, r, n, o);
});
function Qe() {
  return /* @__PURE__ */ kp(ag);
}
var cg = /* @__PURE__ */ y("ZodNever", (e, t) => {
  Ph.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => rm(e, r, n, o);
});
function Aa(e) {
  return /* @__PURE__ */ Np(cg, e);
}
var ug = /* @__PURE__ */ y("ZodArray", (e, t) => {
  kr(), Th.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => cm(e, r, n, o), e.element = t.element;
}, {
  min(e, t) {
    return this.check(/* @__PURE__ */ mr(e, t));
  },
  nonempty(e) {
    return this.check(/* @__PURE__ */ mr(1, e));
  },
  max(e, t) {
    return this.check(/* @__PURE__ */ ca(e, t));
  },
  length(e, t) {
    return this.check(/* @__PURE__ */ ua(e, t));
  },
  unwrap() {
    return this.element;
  }
});
function N(e, t) {
  return /* @__PURE__ */ Bp(ug, e, t);
}
var Pa = /* @__PURE__ */ y("ZodObject", (e, t) => {
  kr(), Ch.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => um(e, r, n, o), Cd(e, "shape", (r) => r._zod.def.shape, !1);
}, {
  keyof() {
    return Z(Object.keys(this._zod.def.shape));
  },
  catchall(e) {
    return this.clone(Q(this._zod.def, { catchall: e }));
  },
  passthrough() {
    return this.clone(Q(this._zod.def, { catchall: Qe() }));
  },
  loose() {
    return this.clone(Q(this._zod.def, { catchall: Qe() }));
  },
  strict() {
    return this.clone(Q(this._zod.def, { catchall: Aa() }));
  },
  strip() {
    return this.clone(Q(this._zod.def, { catchall: void 0 }));
  },
  extend(e) {
    return wd(this, e);
  },
  safeExtend(e) {
    return bd(this, e);
  },
  merge(e) {
    return Sd(this, e);
  },
  pick(e) {
    return vd(this, e);
  },
  omit(e) {
    return yd(this, e);
  },
  partial(...e) {
    return Po(Ra, this, e[0]);
  },
  exactPartial(...e) {
    return Po(Ca, this, e[0], "exactPartial");
  },
  required(...e) {
    return _d(ka, this, e[0]);
  }
});
function m(e, t) {
  const r = {
    type: "object",
    shape: e ?? {},
    ...I(t)
  };
  return new Pa(r);
}
function lg(e, t) {
  return new Pa({
    type: "object",
    shape: e,
    catchall: Aa(),
    ...I(t)
  });
}
var Ta = /* @__PURE__ */ y("ZodUnion", (e, t) => {
  ta.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => lm(e, r, n, o), e.options = t.options;
});
function Oa(e, t) {
  return new Ta({
    type: "union",
    options: e,
    ...I(t)
  });
}
var dg = /* @__PURE__ */ y("ZodDiscriminatedUnion", (e, t) => {
  Ta.init(e, t), Nh.init(e, t);
});
function Me(e, t, r) {
  return new dg({
    type: "union",
    options: t,
    discriminator: e,
    ...I(r)
  });
}
var fg = /* @__PURE__ */ y("ZodIntersection", (e, t) => {
  Mh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => dm(e, r, n, o);
});
function hg(e, t) {
  return new fg({
    type: "intersection",
    left: e,
    right: t
  });
}
var ri = /* @__PURE__ */ y("ZodRecord", (e, t) => {
  kr(), Dh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => hm(e, r, n, o), e.keyType = t.keyType, e.valueType = t.valueType;
});
function ni(e, t, r) {
  return !t || !t._zod ? new ri({
    type: "record",
    keyType: p(),
    valueType: e,
    ...I(t)
  }) : new ri({
    type: "record",
    keyType: e,
    valueType: t,
    ...I(r)
  });
}
var wn = /* @__PURE__ */ y("ZodEnum", (e, t) => {
  $h.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, o, i) => om(e, n, o, i), e.enum = t.entries, e.options = [...e._zod.values];
  const r = new Set(Object.keys(t.entries));
  e.extract = (n, o) => {
    const i = {};
    for (const s of n) if (r.has(s)) i[s] = t.entries[s];
    else throw new Error(`Key ${s} not found in enum`);
    return new wn({
      ...t,
      checks: [],
      ...I(o),
      entries: i
    });
  }, e.exclude = (n, o) => {
    const i = { ...t.entries };
    for (const s of n) if (r.has(s)) delete i[s];
    else throw new Error(`Key ${s} not found in enum`);
    return new wn({
      ...t,
      checks: [],
      ...I(o),
      entries: i
    });
  };
});
function Z(e, t) {
  const r = Array.isArray(e) ? Object.fromEntries(e.map((n) => [n, n])) : e;
  return new wn({
    type: "enum",
    entries: r,
    ...I(t)
  });
}
var pg = /* @__PURE__ */ y("ZodLiteral", (e, t) => {
  Lh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => im(e, r, n, o), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
    if (t.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
    return t.values[0];
  } });
});
function E(e, t) {
  return new pg({
    type: "literal",
    values: Array.isArray(e) ? e : [e],
    ...I(t)
  });
}
var mg = /* @__PURE__ */ y("ZodTransform", (e, t) => {
  kr(), Uh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => am(e, r, n, o), e._zod.parse = (r, n) => {
    if (n.direction === "backward") throw new Fs(e.constructor.name);
    r.addIssue = (i) => {
      if (typeof i == "string") r.issues.push(Ct(i, r.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), "input" in s || (s.input = r.value), s.inst ?? (s.inst = e), r.issues.push(Ct(s));
      }
    };
    const o = t.transform(r.value, r);
    return o instanceof Promise ? o.then((i) => (r.value = i, r)) : (r.value = o, r);
  };
});
function gg(e) {
  return new mg({
    type: "transform",
    transform: e
  });
}
var Ra = /* @__PURE__ */ y("ZodOptional", (e, t) => {
  ra.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => Sa(e, r, n, o), e.unwrap = () => e._zod.def.innerType;
});
function oi(e) {
  return new Ra({
    type: "optional",
    innerType: e
  });
}
var Ca = /* @__PURE__ */ y("ZodExactOptional", (e, t) => {
  xh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => Sa(e, r, n, o), e.unwrap = () => e._zod.def.innerType;
});
function vg(e) {
  return new Ca({
    type: "optional",
    innerType: e
  });
}
var yg = /* @__PURE__ */ y("ZodNullable", (e, t) => {
  zh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => pm(e, r, n, o), e.unwrap = () => e._zod.def.innerType;
});
function ii(e) {
  return new yg({
    type: "nullable",
    innerType: e
  });
}
var wg = /* @__PURE__ */ y("ZodDefault", (e, t) => {
  Fh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => gm(e, r, n, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function bg(e, t) {
  return new wg({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Ds(t);
    }
  });
}
var Sg = /* @__PURE__ */ y("ZodPrefault", (e, t) => {
  jh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => vm(e, r, n, o), e.unwrap = () => e._zod.def.innerType;
});
function _g(e, t) {
  return new Sg({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Ds(t);
    }
  });
}
var ka = /* @__PURE__ */ y("ZodNonOptional", (e, t) => {
  qh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => mm(e, r, n, o), e.unwrap = () => e._zod.def.innerType;
});
function Ig(e, t) {
  return new ka({
    type: "nonoptional",
    innerType: e,
    ...I(t)
  });
}
var Eg = /* @__PURE__ */ y("ZodCatch", (e, t) => {
  Zh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => ym(e, r, n, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Ag(e, t) {
  return new Eg({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : Nd(t)
  });
}
var Pg = /* @__PURE__ */ y("ZodPipe", (e, t) => {
  Bh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => wm(e, r, n, o), e.in = t.in, e.out = t.out;
});
function si(e, t) {
  return new Pg({
    type: "pipe",
    in: e,
    out: t
  });
}
var Tg = /* @__PURE__ */ y("ZodReadonly", (e, t) => {
  Gh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => bm(e, r, n, o), e.unwrap = () => e._zod.def.innerType;
});
function Og(e) {
  return new Tg({
    type: "readonly",
    innerType: e
  });
}
var Rg = /* @__PURE__ */ y("ZodCustom", (e, t) => {
  Kh.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, n, o) => sm(e, r, n, o);
});
function Cg(e, t = {}) {
  return /* @__PURE__ */ Gp(Rg, e, t);
}
function kg(e, t) {
  return /* @__PURE__ */ Kp(e, t);
}
var Ng = "aside-capture", Mg = Z([
  "viewport",
  "full",
  "area"
]), Dg = m({
  x: T(),
  y: T(),
  width: T().positive(),
  height: T().positive()
}), xb = Me("ok", [m({
  ok: E(!0),
  dataUrl: p().startsWith("data:image/png")
}), m({
  ok: E(!1),
  error: p()
})]), $g = Me("type", [m({ type: E("capture:open") }), m({
  type: E("capture:capture"),
  mode: Mg,
  rect: Dg.optional(),
  viewportWidth: T()
})]);
function Lg(e) {
  return $g.safeParse(e).success;
}
var Ug = 300, ai = !1;
function xg() {
  ai || (ai = !0, chrome.contextMenus.onClicked.addListener((e, t) => {
    if (e.menuItemId !== "aside-capture" || typeof t?.id != "number") return;
    const r = t.id;
    Cs().then((n) => {
      n && chrome.tabs.sendMessage(r, { type: "capture:open" }).catch(() => {
      });
    });
  }), chrome.runtime.onMessage.addListener((e, t, r) => {
    if (Lg(e))
      switch (e.type) {
        case "capture:open":
          return;
        case "capture:capture":
          return zg(e, t).then(r).catch((n) => r({
            ok: !1,
            error: n instanceof Error ? n.message : String(n)
          })), !0;
        default:
          return e;
      }
  }));
}
function capturePngBounds(dataUrl) {
 if(typeof dataUrl!=='string'||!dataUrl.startsWith('data:image/png;base64,'))throw Error('Page capture did not return a PNG.');
 const bytes=atob(dataUrl.slice(22,66));
 const byte=index=>bytes.charCodeAt(index);
 const integer=index=>byte(index)*16777216+byte(index+1)*65536+byte(index+2)*256+byte(index+3);
 if(bytes.length<24||[137,80,78,71,13,10,26,10].some((value,index)=>byte(index)!==value)||
    integer(8)!==13||bytes.slice(12,16)!=='IHDR')throw Error('Page capture returned an invalid PNG.');
 const width=integer(16),height=integer(20);
 if(!width||!height||width*height>32*1024*1024)throw Error('The page image exceeds the capture limit.');
 return {width,height};
}
async function captureBoundPage(request,sender,api,fullPage,crop,enabled) {
 let capability;
 try {
  if(!await enabled())throw Error('Screenshot is disabled in Settings.');
  if(!Number.isInteger(sender?.tab?.id)||sender.frameId!==0||!sender.documentId)
   throw Error('Capture must start from the current page.');
  const begin=await api.beginPageSurfaceCapture({tabId:sender.tab.id,documentId:sender.documentId});
  if(!begin?.success||!begin.capability||!begin.targetId)throw Error(begin?.error??'The page changed before capture.');
  capability=begin.capability;
  let dataUrl;
  if(request.mode==='full'){
   const result=await fullPage({targetId:begin.targetId,documentCapability:capability});dataUrl=result.dataUrl;
  }else if(request.mode==='viewport'||request.mode==='area'){
   const result=await api.capturePageSurface({capability});
   if(!result?.success)throw Error(result?.error??'Page capture failed.');
   dataUrl=result.dataUrl;
   if(request.mode==='area'){
    const rect=request.rect;
    if(!rect||![rect.x,rect.y,rect.width,rect.height,request.viewportWidth].every(Number.isFinite)||
       rect.x<0||rect.y<0||rect.width<=0||rect.height<=0||request.viewportWidth<=0||
       rect.x+rect.width>request.viewportWidth||rect.width*rect.height>32*1024*1024)
     throw Error('Select a valid area inside the page.');
    const image=capturePngBounds(dataUrl),scale=image.width/request.viewportWidth;
    // The native surface uses integer pixels; tolerate only its final edge's
    // one-pixel rounding, not an off-page selection or stale larger viewport.
    if(!Number.isFinite(scale)||scale<=0||(rect.y+rect.height)*scale>image.height+1)
     throw Error('The selected area is outside the captured page. Select it again.');
    dataUrl=await crop(dataUrl,rect,request.viewportWidth);
   }
  }else throw Error('Unsupported capture mode.');
  if(typeof dataUrl!=='string'||!dataUrl.startsWith('data:image/png;base64,')||dataUrl.length>Math.ceil(16*1024*1024*4/3)+64)
   throw Error('The image exceeds the capture limit; select a smaller area.');
  const current=await api.validatePageSurfaceCapture({capability});
  if(!current?.success)throw Error(current?.error??'The page changed during capture.');
  return {ok:true,dataUrl};
 }catch(error){return {ok:false,error:error instanceof Error?error.message:String(error)}}
 finally {if(capability)await api.cancelPageSurfaceCapture({capability}).catch(()=>{});}
}
function installNativeCaptureListener(api,tabs,enabled,onError){
 if(!api?.onPageCaptureRequested)return;
 api.onPageCaptureRequested.addListener(async target=>{
  try{
   if(!Number.isInteger(target?.tabId)||typeof target.documentId!=="string")throw Error("The screenshot page changed.");
   if(!await enabled())throw Error("Enable Screenshot in Settings to capture this page.");
   await tabs.sendMessage(target.tabId,{type:"capture:open"},{documentId:target.documentId});
  }catch(error){
   const message=(error instanceof Error?error.message:String(error)).replace(/[\x00-\x1f\x7f]/g," ").slice(0,160);
   try{
    const reported=await api.reportPageCaptureError({tabId:target?.tabId,documentId:target?.documentId,error:message});
    if(!reported?.success)onError(reported?.error??message);
   }catch(reportError){onError(reportError instanceof Error?reportError.message:String(reportError));}
  }
 });
}
installNativeCaptureListener(chrome.auxBrowserPreferences,chrome.tabs,Cs,message=>console.warn("Aux screenshot:",message));
async function zg(e,t){return captureBoundPage(e,t,chrome.auxBrowserPreferences,input=>D.capture.fullPage.mutate(input),od,Cs)}
async function Fg(e) {
  const t = () => typeof e == "number" ? chrome.tabs.captureVisibleTab(e, { format: "png" }) : chrome.tabs.captureVisibleTab({ format: "png" });
  try {
    return await t();
  } catch (r) {
    if (!(r instanceof Error ? r.message : String(r)).includes("MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND")) throw r;
    return await new Promise((n) => setTimeout(n, Ug)), t();
  }
}
async function ci(e, t) {
  const r = (await chrome.debugger.getTargets()).find((n) => n.type === "page" && n.tabId === e && n.id);
  if (!r?.id) return {
    ok: !1,
    error: "No debugger target for this tab."
  };
  try {
    const { dataUrl: n } = await D.capture[t].mutate({ targetId: r.id });
    return {
      ok: !0,
      dataUrl: n
    };
  } catch (n) {
    return {
      ok: !1,
      error: n instanceof Error ? n.message : String(n)
    };
  }
}
var Na = [
  {
    code: "ar",
    displayName: "العربية"
  },
  {
    code: "bg",
    displayName: "Български"
  },
  {
    code: "bn",
    displayName: "বাংলা"
  },
  {
    code: "cs",
    displayName: "Čeština"
  },
  {
    code: "da",
    displayName: "Dansk"
  },
  {
    code: "de",
    displayName: "Deutsch"
  },
  {
    code: "el",
    displayName: "Ελληνικά"
  },
  {
    code: "en",
    displayName: "English"
  },
  {
    code: "es",
    displayName: "Español"
  },
  {
    code: "fi",
    displayName: "Suomi"
  },
  {
    code: "fr",
    displayName: "Français"
  },
  {
    code: "he",
    displayName: "עברית"
  },
  {
    code: "hi",
    displayName: "हिन्दी"
  },
  {
    code: "hr",
    displayName: "Hrvatski"
  },
  {
    code: "hu",
    displayName: "Magyar"
  },
  {
    code: "id",
    displayName: "Bahasa Indonesia"
  },
  {
    code: "it",
    displayName: "Italiano"
  },
  {
    code: "ja",
    displayName: "日本語"
  },
  {
    code: "kn",
    displayName: "ಕನ್ನಡ"
  },
  {
    code: "ko",
    displayName: "한국어"
  },
  {
    code: "lt",
    displayName: "Lietuvių"
  },
  {
    code: "mr",
    displayName: "मराठी"
  },
  {
    code: "nl",
    displayName: "Nederlands"
  },
  {
    code: "no",
    displayName: "Norsk"
  },
  {
    code: "pl",
    displayName: "Polski"
  },
  {
    code: "pt",
    displayName: "Português"
  },
  {
    code: "ro",
    displayName: "Română"
  },
  {
    code: "ru",
    displayName: "Русский"
  },
  {
    code: "sk",
    displayName: "Slovenčina"
  },
  {
    code: "sl",
    displayName: "Slovenščina"
  },
  {
    code: "sv",
    displayName: "Svenska"
  },
  {
    code: "ta",
    displayName: "தமிழ்"
  },
  {
    code: "te",
    displayName: "తెలుగు"
  },
  {
    code: "th",
    displayName: "ไทย"
  },
  {
    code: "tr",
    displayName: "Türkçe"
  },
  {
    code: "uk",
    displayName: "Українська"
  },
  {
    code: "vi",
    displayName: "Tiếng Việt"
  },
  {
    code: "zh",
    displayName: "中文"
  },
  {
    code: "zh-Hant",
    displayName: "繁體中文"
  }
], jg = {
  he: "he",
  id: "id",
  in: "id",
  iw: "he",
  nb: "no",
  nn: "no"
};
function Bn() {
  return Zg(chrome.i18n.getUILanguage());
}
function qg(e) {
  const t = Bg(e);
  return Na.find((r) => r.code.toLowerCase() === t.toLowerCase());
}
function Zg(e) {
  return qg(e) ?? Na.find((t) => t.code === "en");
}
function Bg(e) {
  const t = e.trim().toLowerCase().replaceAll("_", "-"), r = [
    "zh-hant",
    "zh-tw",
    "zh-hk",
    "zh-mo"
  ].some((n) => t === n || t.startsWith(`${n}-`)) ? "zh-Hant" : t.split("-")[0] || "en";
  return jg[r] ?? r;
}
var Gg = "aux-translate-selection", Kg = "aux-translate-page", ui = !1, li = Promise.resolve();
function Wg() {
  ui || (ui = !0, chrome.runtime.onInstalled.addListener(() => Vt(!0)), chrome.runtime.onStartup.addListener(() => Vt()), rd(() => Vt()), Vt());
}
function Vt(e = !1) {
  return auxWorkerProduce("context-menu-rebuild",()=>{
  li = li.catch(() => {
  }).then(() => Vg(e)).catch((t) => {
    auxWorkerNoteUnknown("context-menu-rebuild");
    console.error("[ContextMenus] Failed to register context menus.", t);
  });return li;
  });
}
async function Vg(e) {
  const { displayName: t } = Bn(), r = [
    {
      id: Ng,
      contexts: [
        "page",
        "selection",
        "image",
        "link"
      ],
      title: "Capture",
      visible: await Cs()
    },
    {
      id: Gg,
      contexts: ["selection"],
      title: `Translate this in ${t}`
    },
    {
      id: Kg,
      contexts: ["all"],
      title: "Translate this page"
    }
  ];
  e && await auxWorkerPhysical("chrome-context-menu-remove",()=>chrome.contextMenus.removeAll());
  for (const n of r) await Hg(n).catch((o) => {
    console.error(`[ContextMenus] Failed to register context menu ${n.id}.`, o);
  });
}
function Hg(...args){return auxWorkerPhysical("chrome-context-menu",()=>auxWorkerOriginalContextMenu(...args))}
function auxWorkerOriginalContextMenu({ id: e, ...t }) {
  return new Promise((r, n) => {
    chrome.contextMenus.update(e, t, () => {
      if (!chrome.runtime.lastError) {
        r();
        return;
      }
      chrome.contextMenus.create({
        id: e,
        ...t
      }, () => {
        const o = chrome.runtime.lastError;
        if (o) {
          n(new Error(o.message));
          return;
        }
        r();
      });
    });
  });
}
var di = Z(["default", "incognito"]);
function Ma(e) {
  const t = e.windows.filter((n) => n.type === "normal");
  if (e.lastFocusedWindowId !== null && t.some((n) => n.id === e.lastFocusedWindowId)) return {
    status: "ok",
    windowId: e.lastFocusedWindowId,
    via: "last-focused"
  };
  if (t.length === 0) return { status: e.tabCount > 0 ? "tabs-without-normal-window" : "no-normal-window" };
  if (t.length === 1) return {
    status: "ok",
    windowId: t[0].id,
    via: "single-window"
  };
  const r = t.filter((n) => n.focused);
  return r.length === 1 ? {
    status: "ok",
    windowId: r[0].id,
    via: "focused-flag"
  } : {
    status: "ambiguous-windows",
    candidateWindowIds: t.map((n) => n.id)
  };
}
var Jg = [
  "chrome.tabGroups.move",
  "chrome.tabGroups.update",
  "chrome.tabs.captureVisibleTab",
  "chrome.tabs.connect",
  "chrome.tabs.create",
  "chrome.tabs.discard",
  "chrome.tabs.duplicate",
  "chrome.tabs.goBack",
  "chrome.tabs.goForward",
  "chrome.tabs.group",
  "chrome.tabs.highlight",
  "chrome.tabs.insertCSS",
  "chrome.tabs.move",
  "chrome.tabs.reload",
  "chrome.tabs.remove",
  "chrome.tabs.removeCSS",
  "chrome.tabs.sendMessage",
  "chrome.tabs.sendRequest",
  "chrome.tabs.setZoom",
  "chrome.tabs.setZoomSettings",
  "chrome.tabs.ungroup",
  "chrome.tabs.update",
  "chrome.sessions.restore",
  "chrome.windows.create",
  "chrome.windows.remove",
  "chrome.windows.update"
], zb = new Set(Jg), Qg = [
  "chrome.bookmarks.create",
  "chrome.bookmarks.get",
  "chrome.bookmarks.getChildren",
  "chrome.bookmarks.getRecent",
  "chrome.bookmarks.getSubTree",
  "chrome.bookmarks.getTree",
  "chrome.bookmarks.move",
  "chrome.bookmarks.remove",
  "chrome.bookmarks.removeTree",
  "chrome.bookmarks.search",
  "chrome.bookmarks.update",
  "chrome.downloads.cancel",
  "chrome.downloads.download",
  "chrome.downloads.erase",
  "chrome.downloads.pause",
  "chrome.downloads.resume",
  "chrome.downloads.search",
  "chrome.history.addUrl",
  "chrome.history.deleteRange",
  "chrome.history.deleteUrl",
  "chrome.history.getVisits",
  "chrome.history.search",
  "chrome.runtime.getManifest",
  "chrome.tabGroups.get",
  "chrome.tabGroups.query",
  "chrome.tabs.get",
  "chrome.tabs.query",
  "chrome.topSites.get",
  "chrome.windows.get",
  "chrome.windows.getAll",
  "chrome.windows.getCurrent",
  "chrome.windows.getLastFocused"
], Yg = new Set(Qg);
function Da(e) {
  return Yg.has(e);
}
var U = {
  LOGIN: "001",
  CREDIT_CARD: "002",
  SECURE_NOTE: "003",
  IDENTITY: "004",
  PASSWORD: "005",
  DOCUMENT: "006",
  SOFTWARE_LICENSE: "100",
  BANK_ACCOUNT: "101",
  DATABASE: "102",
  DRIVER_LICENSE: "103",
  OUTDOOR_LICENSE: "104",
  MEMBERSHIP: "105",
  PASSPORT: "106",
  REWARDS_PROGRAM: "107",
  SOCIAL_SECURITY: "108",
  WIRELESS_ROUTER: "109",
  SERVER: "110",
  EMAIL_ACCOUNT: "111",
  API_CREDENTIAL: "112",
  MEDICAL_RECORD: "113",
  SSH_KEY: "114"
}, Xg = [
  "login",
  "credit-card",
  "secure-note",
  "identity",
  "password",
  "document",
  "software-license",
  "bank-account",
  "database",
  "driver-license",
  "outdoor-license",
  "membership",
  "passport",
  "rewards-program",
  "social-security",
  "wireless-router",
  "server",
  "email-account",
  "api-credential",
  "medical-record",
  "ssh-key"
], ev = {
  login: U.LOGIN,
  "credit-card": U.CREDIT_CARD,
  "secure-note": U.SECURE_NOTE,
  identity: U.IDENTITY,
  password: U.PASSWORD,
  document: U.DOCUMENT,
  "software-license": U.SOFTWARE_LICENSE,
  "bank-account": U.BANK_ACCOUNT,
  database: U.DATABASE,
  "driver-license": U.DRIVER_LICENSE,
  "outdoor-license": U.OUTDOOR_LICENSE,
  membership: U.MEMBERSHIP,
  passport: U.PASSPORT,
  "rewards-program": U.REWARDS_PROGRAM,
  "social-security": U.SOCIAL_SECURITY,
  "wireless-router": U.WIRELESS_ROUTER,
  server: U.SERVER,
  "email-account": U.EMAIL_ACCOUNT,
  "api-credential": U.API_CREDENTIAL,
  "medical-record": U.MEDICAL_RECORD,
  "ssh-key": U.SSH_KEY
}, Fb = Object.fromEntries(Object.entries(ev).map(([e, t]) => [t, e])), tv = [
  "first-name",
  "last-name",
  "email",
  "phone",
  "birthdate",
  "cardholder-name",
  "card-number",
  "card-expiry",
  "card-cvv"
], jb = {
  [U.IDENTITY]: [
    "first-name",
    "last-name",
    "email",
    "phone",
    "birthdate"
  ],
  [U.CREDIT_CARD]: [
    "cardholder-name",
    "card-number",
    "card-expiry",
    "card-cvv"
  ]
}, Gn = Z([
  "password",
  "oauth",
  "passkey"
]), Kn = Z(Xg), rv = m({
  type: E("generated-password-ref"),
  refId: p().trim().min(1)
}), qb = m({
  vaultId: p().trim().min(1),
  itemId: p().trim().min(1),
  title: p(),
  urls: N(p()),
  category: Kn,
  username: p().optional(),
  loginType: Gn.optional(),
  oauth: m({
    provider: p(),
    account: p().optional()
  }).optional(),
  primaryHost: p().optional()
}), Zb = m({
  text: p().optional(),
  category: Kn.optional(),
  url: p().optional(),
  vaultId: p().trim().min(1).optional()
}), nv = m({
  vaultId: p().trim().min(1),
  category: Kn,
  title: p().trim().min(1),
  urls: N(p()).optional(),
  loginType: Gn.optional(),
  oauth: m({
    provider: p().trim().min(1),
    account: p().optional()
  }).optional(),
  fields: N(m({
    label: p().trim().min(1),
    value: Oa([p(), rv]),
    designation: Z([
      "username",
      "password",
      ...tv
    ]).optional(),
    isSecret: $().optional()
  })),
  notes: p().optional()
}), Bb = m({
  itemId: p().trim().min(1),
  updates: m({
    title: p().trim().min(1).optional(),
    urls: N(p()).optional(),
    fields: nv.shape.fields.optional(),
    notes: p().optional()
  })
}), ov = m({
  length: T().int().positive().optional(),
  include: N(Z([
    "lowercase",
    "uppercase",
    "digit",
    "symbol"
  ])).optional(),
  symbols: p().optional()
}), Gb = m({
  command: E("fillCredentials").optional(),
  itemId: p().trim().min(1).optional(),
  type: Z([
    "login",
    "card",
    "identity"
  ]).optional(),
  username: p().optional(),
  password: p().optional(),
  loginType: Gn.optional(),
  oauthProvider: p().optional(),
  oauthAccountHint: p().optional(),
  urls: N(p()).optional(),
  passkeyUserName: p().optional(),
  cardType: p().optional(),
  cardholderName: p().optional(),
  number: p().optional(),
  expMonth: p().optional(),
  expYear: p().optional(),
  cvv: p().optional(),
  firstName: p().optional(),
  lastName: p().optional(),
  fullName: p().optional(),
  birthDate: p().optional(),
  email: p().optional(),
  phone: p().optional(),
  address1: p().optional(),
  address2: p().optional(),
  city: p().optional(),
  state: p().optional(),
  postalCode: p().optional(),
  country: p().optional()
}), yr;
(function(e) {
  const t = e.openBrowserTabSchema = m({
    id: p(),
    targetId: p(),
    url: p(),
    title: p().default(""),
    faviconUrl: p().default(""),
    active: $().default(!1),
    windowId: T().int(),
    focusedWindow: $().optional(),
    group: m({
      id: T().int(),
      title: p()
    }).optional()
  }), r = e.listTabsRequestSchema = m({
    method: E("Aux.listTabs"),
    params: m({
      accountId: T().int().nonnegative().optional(),
      groupWindowId: T().int().nonnegative().optional(),
      extensionId: p().regex(/^[a-p]{32}$/).optional()
    })
  });
  e.listTabsResponseSchema = m({ items: N(t) });
  const n = e.ownsTargetRequestSchema = m({
    method: E("Aux.ownsTarget"),
    params: m({ targetId: p().trim().min(1) })
  });
  e.ownsTargetResponseSchema = m({ owned: $() });
  const o = e.createAgentTabRequestSchema = m({
    method: E("Aux.createAgentTab"),
    params: m({
      url: p().trim().min(1),
      anchorTargetId: p().trim().min(1).optional()
    })
  });
  e.createAgentTabResponseSchema = m({
    targetId: p().trim().min(1),
    tabId: T().int().nonnegative(),
    windowId: T().int()
  });
  const i = e.resolveBindingWindowRequestSchema = m({
    method: E("Aux.resolveBindingWindow"),
    params: m({})
  }), s = m({
    windowCount: T().int().nonnegative(),
    windowCountByType: ni(p(), T().int().nonnegative()),
    tabCount: T().int().nonnegative(),
    lastFocusedError: p().optional()
  });
  e.resolveBindingWindowResponseSchema = Me("status", [
    m({
      status: E("ok"),
      windowId: T().int(),
      via: Z([
        "last-focused",
        "single-window",
        "focused-flag"
      ]),
      anchorTargetId: p().trim().min(1).optional(),
      diagnostics: s
    }),
    m({
      status: E("no-normal-window"),
      diagnostics: s
    }),
    m({
      status: E("tabs-without-normal-window"),
      diagnostics: s
    }),
    m({
      status: E("ambiguous-windows"),
      candidateWindowIds: N(T().int()).min(2),
      diagnostics: s
    })
  ]);
  const a = e.searchHistoryRequestSchema = m({
    method: E("Aux.searchHistory"),
    params: m({
      query: p().trim().default(""),
      startTime: T().positive().optional(),
      endTime: T().positive().optional(),
      maxResults: T().int().positive().optional()
    })
  });
  e.searchHistoryResponseSchema = m({ items: N(m({
    id: p(),
    url: p(),
    title: p().default(""),
    faviconUrl: p().default(""),
    visitCount: T().nonnegative().default(0),
    typedCount: T().nonnegative().default(0),
    lastVisitTime: T().default(0)
  })) });
  const c = e.getThirdPartyCookiesRequestSchema = m({
    method: E("Aux.getThirdPartyCookies"),
    params: m({})
  });
  e.thirdPartyCookiesSettingResponseSchema = m({
    value: Z(["allow", "block"]).nullable(),
    levelOfControl: Z([
      "not_controllable",
      "controlled_by_other_extensions",
      "controllable_by_this_extension",
      "controlled_by_this_extension"
    ]).nullable(),
    isAvailable: $()
  });
  const u = e.setThirdPartyCookiesRequestSchema = m({
    method: E("Aux.setThirdPartyCookies"),
    params: m({ value: Z(["allow", "block"]) })
  });
  e.setThirdPartyCookiesResponseSchema = m({ success: $().default(!0) });
  const l = e.ensureTabInAiTabsGroupRequestSchema = m({
    method: E("Aux.ensureTabInAiTabsGroup"),
    params: m({ targetId: p().trim().min(1) })
  });
  e.ensureTabInAiTabsGroupResponseSchema = m({
    success: $().default(!0),
    groupId: T().int().nonnegative(),
    tabId: T().int().nonnegative()
  });
  const f = e.controlTabRequestSchema = m({
    method: E("Aux.controlTab"),
    params: Me("action", [m({
      action: E("open"),
      url: p().trim().min(1),
      targetId: p().trim().min(1).optional()
    }), m({
      action: E("close"),
      targetId: p().trim().min(1).optional(),
      url: p().trim().min(1).optional(),
      skipIfActive: $().optional()
    })])
  });
  e.controlTabResponseSchema = m({
    success: $().default(!0),
    action: Z(["open", "close"]),
    created: $().optional(),
    closed: $().optional(),
    tabId: T().int().nonnegative().optional(),
    targetId: p().trim().min(1).optional()
  });
  const d = e.waitForDownloadRequestSchema = m({
    method: E("Aux.waitForDownload"),
    params: m({
      startedAfterMs: T().int().nonnegative(),
      timeoutMs: T().int().positive().optional(),
      expectedFilename: p().trim().min(1).optional(),
      referrerUrl: p().trim().min(1).optional()
    })
  });
  e.waitForDownloadResponseSchema = m({
    downloadId: T().int().nonnegative(),
    absolutePath: p().trim().min(1)
  });
  const h = Z(["notification", "success"]), g = m({
    mimeType: p().min(1),
    data: p().min(1)
  }), v = e.showNotificationRequestSchema = m({
    method: E("Aux.showNotification"),
    params: m({
      title: p().min(1),
      message: p().min(1),
      contextMessage: p().optional(),
      clickPath: p().trim().startsWith("/").optional(),
      type: Z([
        "basic",
        "image",
        "list",
        "progress"
      ]).default("basic"),
      requireInteraction: $().optional(),
      silent: $().optional(),
      sound: h.optional(),
      customSound: g.optional(),
      buttons: N(m({ title: p().min(1) })).max(2).optional(),
      imageUrl: p().optional(),
      progress: T().int().min(0).max(100).optional(),
      items: N(m({
        title: p(),
        message: p()
      })).optional()
    })
  });
  e.showNotificationResponseSchema = m({ notificationId: p() });
  const w = e.playNotificationSoundRequestSchema = m({
    method: E("Aux.playNotificationSound"),
    params: m({
      sound: h,
      customSound: g.optional()
    })
  });
  e.playNotificationSoundResponseSchema = m({ ok: E(!0) });
  const b = e.grantNotificationPermissionRequestSchema = m({
    method: E("Aux.grantNotificationPermission"),
    params: m({ targetId: p().trim().min(1) })
  });
  e.grantNotificationPermissionResponseSchema = m({ success: $().default(!0) });
  const S = e.revokeNotificationPermissionRequestSchema = m({
    method: E("Aux.revokeNotificationPermission"),
    params: m({ origin: p().trim().url() })
  });
  e.revokeNotificationPermissionResponseSchema = m({ revoked: $() });
  const A = e.clearAiTabsGroupRequestSchema = m({
    method: E("Aux.clearAiTabsGroup"),
    params: m({ keepTargetIds: N(p().trim().min(1)).optional() })
  });
  e.clearAiTabsGroupResponseSchema = m({
    success: $().default(!0),
    closedCount: T().int().nonnegative()
  });
  const R = p().trim().refine(Da, { message: "Chrome MV3 API method is not whitelisted" }).transform(($r) => $r), _ = e.callExtensionMv3ApiRequestSchema = m({
    method: E("Aux.callExtensionMV3Api"),
    params: m({
      method: R,
      args: N(Qe()).default([])
    })
  });
  e.callExtensionMv3ApiResponseSchema = Qe();
  const P = e.openProfileUrlRequestSchema = m({
    method: E("Aux.openProfileUrl"),
    params: m({ url: Zm() })
  });
  e.openProfileUrlResponseSchema = m({ success: $().default(!0) });
  const k = e.pickDirectoryRequestSchema = m({
    method: E("Aux.pickDirectory"),
    params: m({ prompt: p().trim().min(1).optional() })
  });
  e.pickDirectoryResponseSchema = m({
    status: Z([
      "selected",
      "cancelled",
      "unavailable"
    ]),
    path: p().trim().min(1).optional()
  });
  const q = e.createPasswordManagerGeneratedPasswordRefRequestSchema = m({
    method: E("Aux.createPasswordManagerGeneratedPasswordRef"),
    params: m({ options: ov.optional() })
  });
  e.createPasswordManagerGeneratedPasswordRefResponseSchema = m({ refId: p().trim().min(1) });
  const ze = e.fillPasswordManagerGeneratedPasswordRefRequestSchema = m({
    method: E("Aux.fillPasswordManagerGeneratedPasswordRef"),
    params: m({
      targetId: p().trim().min(1),
      refId: p().trim().min(1)
    })
  });
  e.fillPasswordManagerGeneratedPasswordRefResponseSchema = m({
    success: $().default(!0),
    error: p().optional()
  });
  const te = e.resolvePasswordManagerGeneratedPasswordRefsRequestSchema = m({
    method: E("Aux.resolvePasswordManagerGeneratedPasswordRefs"),
    params: m({ refIds: N(p().trim().min(1)).min(1) })
  });
  e.resolvePasswordManagerGeneratedPasswordRefsResponseSchema = m({ refs: N(m({
    refId: p().trim().min(1),
    password: p()
  })) });
  const Pe = e.clearPasswordManagerGeneratedPasswordRefsRequestSchema = m({
    method: E("Aux.clearPasswordManagerGeneratedPasswordRefs"),
    params: m({ refIds: N(p().trim().min(1)).min(1) })
  });
  e.clearPasswordManagerGeneratedPasswordRefsResponseSchema = m({ success: $().default(!0) });
  const st = e.performPasswordManagerAutofillRequestSchema = m({
    method: E("Aux.performPasswordManagerAutofill"),
    params: m({
      pwmAccountId: qm(),
      targetId: p().trim().min(1),
      itemId: p().trim().min(1),
      agentSessionId: p().trim().min(1).optional()
    })
  });
  e.performPasswordManagerAutofillResponseSchema = m({
    success: $().default(!0),
    error: p().optional()
  });
  const at = m({
    username: p(),
    domains: N(p())
  }), re = m({
    username: p(),
    domain: p(),
    password: p()
  }), Rc = m({
    username: p(),
    domain: p(),
    code: p(),
    source: p().optional()
  }), Cc = e.applePasswordsCapabilitiesRequestSchema = m({
    method: E("Aux.applePasswords.capabilities"),
    params: m({})
  });
  e.applePasswordsCapabilitiesResponseSchema = m({ capabilities: ni(p(), Qe()).default({}) });
  const kc = e.applePasswordsRequestAuthRequestSchema = m({
    method: E("Aux.applePasswords.requestAuth"),
    params: m({})
  });
  e.applePasswordsRequestAuthResponseSchema = m({
    status: E("auth-requested"),
    instruction: p()
  });
  const Nc = e.applePasswordsVerifyAuthRequestSchema = m({
    method: E("Aux.applePasswords.verifyAuth"),
    params: m({ pin: p().trim().min(1) })
  });
  e.applePasswordsVerifyAuthResponseSchema = m({ status: E("authenticated") });
  const Mc = e.applePasswordsListLoginsRequestSchema = m({
    method: E("Aux.applePasswords.listLogins"),
    params: m({ url: p().trim().min(1) })
  });
  e.applePasswordsListLoginsResponseSchema = m({ items: N(at) });
  const Dc = e.applePasswordsGetPasswordsRequestSchema = m({
    method: E("Aux.applePasswords.getPasswords"),
    params: m({
      url: p().trim().min(1),
      username: p().optional()
    })
  });
  e.applePasswordsGetPasswordsResponseSchema = m({ items: N(re) });
  const $c = e.applePasswordsSaveLoginRequestSchema = m({
    method: E("Aux.applePasswords.saveLogin"),
    params: m({
      url: p().trim().min(1),
      username: p().min(1).refine(($r) => $r.trim().length > 0),
      password: p().min(1)
    })
  });
  e.applePasswordsSaveLoginResponseSchema = m({
    status: E("saved"),
    username: p(),
    domain: p(),
    passwordSaved: E(!0)
  });
  const Lc = e.applePasswordsGetOtpsRequestSchema = m({
    method: E("Aux.applePasswords.getOtps"),
    params: m({ url: p().trim().min(1) })
  });
  e.applePasswordsGetOtpsResponseSchema = m({ items: N(Rc) });
  const auxCookieSyncContext = e.cookieSyncContextRequestSchema = m({method:E("Aux.getCookieSyncContext"),params:m({accountId:T().int().nonnegative(),profileId:p().min(1),userId:p().min(1)})}); const auxCookieRestore = e.cookieRestoreRequestSchema = m({method:E("Aux.restoreCookieSnapshot"),params:m({accountId:T().int().nonnegative(),profileId:p().min(1).max(256),userId:p().min(1).max(256),generation:T().int().nonnegative().max(2147483647),browserContextId:p().min(1).max(256),cookieBindingEpoch:p().min(1).max(256),revision:T().int().positive().max(Number.MAX_SAFE_INTEGER),objectSha256:p().regex(/^[a-f0-9]{64}$/)}).passthrough().refine(params=>Array.isArray(params.cookies)&&params.cookies.length<=20000)});
  const oo = [
    auxCookieSyncContext,
    auxCookieRestore,
    r,
    n,
    o,
    P,
    i,
    a,
    c,
    u,
    l,
    f,
    d,
    v,
    w,
    b,
    S,
    A,
    _,
    q,
    ze,
    te,
    Pe,
    st,
    Cc,
    kc,
    Nc,
    Mc,
    Dc,
    $c,
    Lc
  ];
  oo.push(m({method:E("Aux.validateTabReferences"),params:m({references:N(m({targetId:p().min(1),url:p().min(1),documentCapability:p().uuid()})).min(1).max(64)})})); oo.push(m({method:E("Aux.routeBrowserLink"),params:m({operation:p().refine(v=>["open","resolve","list"].includes(v)),url:p().max(16384).optional(),profile:p().max(256).optional(),space:p().max(256).optional()}).strict()}));e.extensionRequestSchema = Me("method", oo), e.requestSchema = Me("method", [...oo, k]);
})(yr || (yr = {}));
var Ne;
(function(e) {
  const t = e.routeSchema = m({
    accountId: T().int().nonnegative(),
    profileId: p().min(1),
    browserMode: di.default("default"),
    windowId: T().int().optional()
  });
  e.registerMessageSchema = m({
    method: E("register"),
    connectionId: p().min(1),
    route: t.omit({ windowId: !0 })
  }), e.registeredMessageSchema = m({
    method: E("registered"),
    connectionId: p().min(1)
  });
  const r = e.commandRouteSchema = t.extend({
    accountId: T().int().nonnegative().optional(),
    profileId: p().min(1).optional(),
    browserMode: di.default("default")
  });
  e.commandRequestSchema = m({
    command: yr.requestSchema,
    route: r
  }), e.runCommandMessageSchema = m({
    id: T(),
    method: E("runCommand"),
    command: yr.extensionRequestSchema,
    route: t
  }), e.runCommandMessageEnvelopeSchema = m({
    id: T(),
    method: E("runCommand"),
    command: m({ method: p() })
  }), e.cancelCommandMessageSchema = m({
    id: T(),
    method: E("cancelCommand")
  }), e.runCommandMessageResponseSchema = m({
    id: T(),
    result: Qe(),
    error: p().optional()
  }), e.pingMessageSchema = m({ method: E("ping") }), e.pingMessageResponseSchema = m({ method: E("pong") });
})(Ne || (Ne = {}));
var $a = "gokkffaiccpmoeodpmeamcjajcagjmkm", La = "nbpghnminpifekjbgjefioajhiilbfla", Kb = `chrome-extension://${$a}`, Wb = `chrome-extension://${La}`, iv = "com.apple.passwordmanager", fi = "Aux", hi = "1.0", sv = 6e4, av = class {
  #e = new cv();
  #t = pi.new();
  async capabilities() {
    return (await this.#e.send({ cmd: 14 })).capabilities ?? {};
  }
  async requestAuth() {
    this.#t = pi.new();
    const { payload: e } = await this.#e.send({
      cmd: 2,
      msg: {
        QID: "m0",
        HSTBRSR: fi,
        PAKE: vi({
          TID: this.#t.username,
          MSG: 0,
          A: this.#t.serialize(this.#t.clientPublicKey),
          VER: hi,
          PROTO: [1]
        })
      }
    }), t = mi(e);
    if (t.TID !== this.#t.username) throw new Error("Invalid Apple Passwords hello: wrong session");
    if (String(t.MSG) !== String(1)) throw new Error("Invalid Apple Passwords hello: unexpected message");
    if (t.PROTO !== 1) throw new Error("Invalid Apple Passwords hello: unsupported protocol");
    if (t.VER && t.VER !== hi) throw new Error("Invalid Apple Passwords hello: unsupported version");
    if (!t.B || !t.s) throw new Error("Invalid Apple Passwords hello: missing challenge");
    return this.#t.setServerPublicKey(fe(wt(t.B)), fe(wt(t.s))), {
      status: "auth-requested",
      instruction: "Ask the user to approve Apple Passwords / Touch ID and provide the 6-digit code if macOS shows one, then call applePasswords.verifyAuth(pin)."
    };
  }
  async verifyAuth(e) {
    const t = await this.#t.computeM(e), { payload: r } = await this.#e.send({
      cmd: 2,
      msg: {
        HSTBRSR: fi,
        QID: "m2",
        PAKE: vi({
          TID: this.#t.username,
          MSG: 2,
          M: we(t)
        })
      }
    }), n = mi(r);
    if (n.TID !== this.#t.username) throw new Error("Invalid Apple Passwords verification: wrong session");
    if (String(n.MSG) !== String(3)) throw new Error("Invalid Apple Passwords verification: unexpected message");
    if (n.ErrCode === 1) throw new Error("Incorrect Apple Passwords challenge PIN");
    if (n.ErrCode && n.ErrCode !== 0) throw new Error(`Apple Passwords verification failed: error code ${n.ErrCode}`);
    if (!n.HAMK) throw new Error("Invalid Apple Passwords verification: missing HAMK");
    const o = await this.#t.computeHMAC(t);
    if (fe(wt(n.HAMK)) !== fe(o)) throw new Error("Invalid Apple Passwords verification: HAMK mismatch");
    return { status: "authenticated" };
  }
  async listLogins(e) {
    const t = Qt(e);
    return gi(await this.#r(t)).map((r) => ({
      username: r.USR,
      domains: r.sites
    }));
  }
  async getPasswords(e, t) {
    const r = Qt(e);
    return gi(await this.#n(r, t)).map((n) => ({
      username: n.USR,
      domain: n.sites[0] ?? r,
      password: n.PWD ?? ""
    }));
  }
  async saveLogin(e, t, r) {
    const n = Qt(e), o = await this.#t.encrypt({
      ACT: 4,
      URL: "",
      USR: "",
      PWD: "",
      NURL: n,
      NUSR: t,
      NPWD: r
    }), i = await this.#e.send({
      cmd: 6,
      tabId: 0,
      frameId: 0,
      payload: JSON.stringify({
        QID: "CmdSetPassword4LoginName_URL",
        SMSG: {
          TID: this.#t.username,
          SDATA: we(o)
        }
      })
    }, [6, 4]);
    if (i.payload !== void 0) {
      const s = await this.#s(i.payload);
      if (s.STATUS !== 0) throw Zr(s.STATUS);
    } else if (i.STATUS !== void 0 && i.STATUS !== 0) throw Zr(i.STATUS);
    return {
      status: "saved",
      username: t,
      domain: n,
      passwordSaved: !0
    };
  }
  async getOtps(e) {
    return dv(await this.#i(Fa(e)), Qt(e));
  }
  async #r(e) {
    const t = await this.#t.encrypt({
      ACT: 5,
      URL: e
    });
    return await this.#o({
      cmd: 4,
      tabId: 1,
      frameId: 1,
      url: e,
      payload: JSON.stringify({
        QID: "CmdGetLoginNames4URL",
        SMSG: {
          TID: this.#t.username,
          SDATA: we(t)
        }
      })
    });
  }
  async #n(e, t = "") {
    const r = await this.#t.encrypt({
      ACT: 2,
      URL: e,
      USR: t
    });
    return await this.#o({
      cmd: 5,
      tabId: 0,
      frameId: 0,
      url: e,
      payload: JSON.stringify({
        QID: "CmdGetPassword4LoginName",
        SMSG: {
          TID: this.#t.username,
          SDATA: we(r)
        }
      })
    });
  }
  async #i(e) {
    const t = await this.#t.encrypt({
      ACT: 5,
      TYPE: "oneTimeCodes",
      frameURLs: [e]
    });
    return await this.#o({
      cmd: 16,
      tabId: 0,
      frameId: 0,
      payload: JSON.stringify({
        QID: "CmdGetOneTimeCodes",
        SMSG: {
          TID: this.#t.username,
          SDATA: we(t)
        }
      })
    });
  }
  async #o(e) {
    const t = await this.#e.send(e);
    return await this.#s(t.payload);
  }
  async #s(e) {
    const t = lv(e), r = typeof t.SMSG == "string" ? kt(t.SMSG) : t.SMSG;
    if (typeof r == "string") throw new Error("Invalid Apple Passwords response: malformed SMSG");
    if (r.TID !== this.#t.username) throw new Error("Invalid Apple Passwords response: wrong session");
    const n = kt(ja(await this.#t.decrypt(wt(r.SDATA))));
    if (n.STATUS !== 0 && n.STATUS !== 3) throw Zr(n.STATUS);
    return n;
  }
}, cv = class {
  #e = null;
  #t = Promise.resolve();
  async send(e, t = [e.cmd]) {
    const r = this.#t.then(async () => await this.#r(e, t));
    return this.#t = r.then(() => {
    }, () => {
    }), await r;
  }
  async #r(e, t) {
    const r = this.#n();
    return await new Promise((n, o) => {
      const i = setTimeout(() => {
        s(), o(/* @__PURE__ */ new Error("Apple Passwords native helper timed out"));
      }, sv), s = () => {
        clearTimeout(i), r.onMessage.removeListener(a), r.onDisconnect.removeListener(c);
      }, a = (u) => {
        const l = uv(u);
        if (!(l.cmd !== void 0 && !t.includes(l.cmd))) {
          if (s(), l.error) {
            o(new Error(l.error));
            return;
          }
          n(l);
        }
      }, c = () => {
        s(), this.#e = null, o(new Error(chrome.runtime.lastError?.message ?? "Apple Passwords native helper disconnected"));
      };
      r.onMessage.addListener(a), r.onDisconnect.addListener(c);
      try {
        r.postMessage(e);
      } catch (u) {
        s(), o(u instanceof Error ? u : new Error(String(u)));
      }
    });
  }
  #n() {
    if (this.#e) return this.#e;
    if (!chrome.runtime.connectNative) throw new Error("Native messaging is unavailable in this extension context.");
    const e = chrome.runtime.connectNative(iv);
    return e.onDisconnect.addListener(() => {
      this.#e === e && (this.#e = null);
    }), this.#e = e, e;
  }
}, je = BigInt(`0x${`
    FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08
    8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B
    302B0A6D F25F1437 4FE1356D 6D51C245 E485B576 625E7EC6 F44C42E9
    A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5 AE9F2411 7C4B1FE6
    49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8
    FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D
    670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C
    180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9 DE2BCBF6 95581718
    3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D AD33170D
    04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D
    B3970F85 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226
    1AD2EE6B F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C
    BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31 43DB5BFC
    E0FD108E 4B82D120 A93AD2CA FFFFFFFF FFFFFFFF
  `.replaceAll(/[^0-9A-F]/g, "")}`), Ht = 384, Jt = 5n, pi = class Ua {
  #e;
  #t;
  #r;
  #n;
  username;
  constructor(t, r) {
    this.#e = r, this.username = we(t);
  }
  static new() {
    return new Ua(Br(16), fe(Br(32)));
  }
  get clientPublicKey() {
    return Gr(Jt, this.#e, je);
  }
  serialize(t) {
    return we(W(t));
  }
  setServerPublicKey(t, r) {
    if (ir(t, je) === 0n) throw new Error("Invalid Apple Passwords hello: invalid public key");
    this.#t = t, this.#r = r;
  }
  async computeM(t) {
    if (await this.#i(t), this.#t === void 0 || this.#r === void 0 || this.#n === void 0) throw new Error("Invalid Apple Passwords session: missing verified challenge");
    const [r, n, o] = await Promise.all([
      se(je),
      se(Yt(W(Jt), Ht)),
      se(this.username)
    ]);
    return await se(qe(fv(r, n), o, W(this.#r), W(this.clientPublicKey), W(this.#t), W(this.#n)));
  }
  async computeHMAC(t) {
    if (this.#n === void 0) throw new Error("Invalid Apple Passwords session: missing shared key");
    return await se(qe(W(this.clientPublicKey), t, W(this.#n)));
  }
  async encrypt(t) {
    const r = await this.#o(), n = Br(16);
    return qe(new Uint8Array(await crypto.subtle.encrypt({
      name: "AES-GCM",
      iv: Ze(n)
    }, r, Ze(Wn(JSON.stringify(t))))), n);
  }
  async decrypt(t) {
    const r = await this.#o(), n = t.slice(0, 16);
    return new Uint8Array(await crypto.subtle.decrypt({
      name: "AES-GCM",
      iv: Ze(n)
    }, r, Ze(t.slice(16))));
  }
  async #i(t) {
    if (this.#t === void 0 || this.#r === void 0) throw new Error("Apple Passwords is not authenticated. Call applePasswords.requestAuth(), then applePasswords.verifyAuth(pin).");
    const [r, n, o] = await Promise.all([
      se(qe(Yt(W(this.clientPublicKey), Ht), Yt(W(this.#t), Ht))),
      se(qe(W(je), Yt(W(Jt), Ht))),
      se(`${this.username}:${t}`).then((u) => se(qe(W(this.#r), u)))
    ]), i = fe(r), s = fe(n), a = fe(o), c = Gr(this.#t - s * Gr(Jt, a, je), this.#e + i * a, je);
    this.#n = fe(await se(c));
  }
  async #o() {
    if (this.#n === void 0) throw new Error("Missing Apple Passwords encryption key. Call applePasswords.requestAuth(), then applePasswords.verifyAuth(pin).");
    return await crypto.subtle.importKey("raw", Ze(W(this.#n).slice(0, 16)), "AES-GCM", !1, ["encrypt", "decrypt"]);
  }
}, Re = new av();
function Zr(e) {
  const t = {
    1: "operation failed",
    2: "received an invalid parameter",
    3: "could not find a matching item",
    4: "could not delete the item",
    5: "could not save the item",
    6: "received an invalid message",
    7: "found a duplicate item",
    8: "does not support this action",
    9: "is not authenticated"
  }[e];
  return /* @__PURE__ */ new Error(`Apple Passwords ${t ?? "failed"} (status ${e})`);
}
function uv(e) {
  if (!$t(e)) throw new Error("Invalid Apple Passwords native helper response");
  return e;
}
function mi(e) {
  const t = typeof e == "string" ? kt(e) : e;
  if (!$t(t) || typeof t.PAKE != "string") throw new Error("Invalid Apple Passwords handshake response");
  return kt(ja(wt(t.PAKE)));
}
function lv(e) {
  const t = typeof e == "string" ? kt(e) : e;
  if (!$t(t) || !("SMSG" in t)) throw new Error("Invalid Apple Passwords response: missing SMSG");
  return t;
}
function gi(e) {
  const t = [];
  for (const r of xa(e)) {
    if (!$t(r) || typeof r.USR != "string") continue;
    const n = {
      USR: r.USR,
      sites: za(r.sites)
    };
    typeof r.PWD == "string" && (n.PWD = r.PWD), t.push(n);
  }
  return t;
}
function dv(e, t) {
  const r = [];
  for (const n of xa(e)) {
    if (!$t(n)) continue;
    const o = Ce(n, "code") ?? Ce(n, "oneTimeCode") ?? Ce(n, "OTP");
    if (!o) continue;
    const i = za(n.sites), s = {
      username: Ce(n, "username") ?? Ce(n, "USR") ?? "",
      domain: Ce(n, "domain") ?? i[0] ?? t,
      code: o
    }, a = Ce(n, "source");
    a && (s.source = a), r.push(s);
  }
  return r;
}
function xa(e) {
  return Array.isArray(e.Entries) ? e.Entries : Object.entries(e).filter(([t]) => /^Entry_\d+$/.test(t)).sort(([t], [r]) => Number(t.slice(6)) - Number(r.slice(6))).map(([, t]) => t);
}
function Ce(e, t) {
  const r = e[t];
  return typeof r == "string" ? r : void 0;
}
function za(e) {
  return Array.isArray(e) ? e.filter((t) => typeof t == "string") : typeof e == "string" ? [e] : [];
}
function Fa(e) {
  try {
    return new URL(e).toString();
  } catch {
    return `https://${e}`;
  }
}
function Qt(e) {
  try {
    const t = new URL(Fa(e));
    return t.port ? `${t.hostname}:${t.port}` : t.hostname;
  } catch {
    return e;
  }
}
function kt(e) {
  return JSON.parse(e);
}
function vi(e) {
  return we(Wn(JSON.stringify(e)));
}
function Wn(e) {
  return new TextEncoder().encode(e);
}
function ja(e) {
  return new TextDecoder().decode(e);
}
function we(e) {
  let t = "";
  for (const r of e) t += String.fromCharCode(r);
  return btoa(t);
}
function wt(e) {
  const t = atob(e), r = new Uint8Array(t.length);
  for (let n = 0; n < t.length; n += 1) r[n] = t.charCodeAt(n);
  return r;
}
function Br(e) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), t;
}
function W(e) {
  if (e instanceof Uint8Array) return e;
  if (typeof e == "string") return Wn(e);
  if (e === 0n) return new Uint8Array([0]);
  const t = [];
  let r = e;
  for (; r > 0n; )
    t.unshift(Number(r & 255n)), r >>= 8n;
  return new Uint8Array(t);
}
function Ze(e) {
  return e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength);
}
function fe(e) {
  return e.reduce((t, r) => t << 8n | BigInt(r), 0n);
}
async function se(e) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", Ze(W(e))));
}
function Yt(e, t) {
  const r = new Uint8Array(t);
  return r.set(e.slice(0, t), Math.max(t - e.length, 0)), r;
}
function qe(...e) {
  const t = e.reduce((o, i) => o + i.length, 0), r = new Uint8Array(t);
  let n = 0;
  for (const o of e)
    r.set(o, n), n += o.length;
  return r;
}
function fv(e, t) {
  return e.map((r, n) => r ^ (t[n] ?? 0));
}
function ir(e, t) {
  const r = e % t;
  return r < 0n ? r + t : r;
}
function Gr(e, t, r) {
  if (t < 0n) throw new Error("Unsupported negative exponent");
  let n = 1n, o = ir(e, r), i = t;
  for (; i > 0n; )
    (i & 1n) === 1n && (n = ir(n * o, r)), o = ir(o * o, r), i >>= 1n;
  return n;
}
function $t(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
var sr = "Agent Tabs";
async function qa(e, t = {}) {
  t.signal?.throwIfAborted();
  const r = await chrome.tabs.get(e).catch(() => {
  });
  if (!r || r.groupId < 0) return !1;
  const n = await chrome.tabGroups.get(r.groupId).catch(() => {
  });
  if (n?.title !== "Agent Tabs") return !1;
  const o = await chrome.tabs.get(e).catch(() => {
  });
  return t.signal?.throwIfAborted(), o?.groupId !== n.id || t.skipIfActive && o.active ? !1 : (await chrome.tabs.remove(e), !0);
}
function J(e) {
  if (!e?.aborted) return;
  const t = /* @__PURE__ */ new Error("Chrome tab command aborted");
  throw t.name = "AbortError", t;
}
var yi = (e) => {
  try {
    const t = new URL(e);
    return t.hash = "", t.toString();
  } catch {
    return e;
  }
}, wi = (e) => {
  try {
    const t = new URL(e);
    return `${t.origin}${t.pathname}${t.search}`;
  } catch {
    return e;
  }
};
async function bi(e, t) {
  J(t);
  const r = await chrome.tabs.update(e, { active: !0 });
  J(t), chrome.windows?.update && typeof r?.windowId == "number" && await chrome.windows.update(r.windowId, { focused: !0 });
}
async function Za(e, t) {
  if (J(t), !e || !chrome.debugger?.getTargets) return;
  const r = await chrome.debugger.getTargets().catch(() => []);
  return J(t), r.find((n) => n.id === e && typeof n.tabId == "number")?.tabId;
}
async function Kr(e, t) {
  if (J(t), !chrome.debugger?.getTargets) return;
  const r = await chrome.debugger.getTargets().catch(() => []);
  return J(t), r.find((n) => n.tabId === e && typeof n.id == "string")?.id;
}
async function hv(e, t, r) {
  if (J(t), !chrome.tabs?.create || !chrome.tabs.update || !chrome.tabs.query) throw new Error("Chrome tabs API is unavailable");
  const n = await Za(e.targetId, t);
  if (typeof n == "number") try {
    return await bi(n, t), {
      action: "open",
      created: !1,
      tabId: n,
      targetId: await Kr(n, t) ?? e.targetId
    };
  } catch {
    J(t);
  }
  const o = yi(e.url), i = wi(e.url), s = await chrome.tabs.query(r === void 0 ? {} : { windowId: r });
  J(t);
  const a = s.find((u) => {
    if (typeof u.id != "number") return !1;
    const l = u.url ?? u.pendingUrl;
    return l ? yi(l) === o || wi(l) === i : !1;
  });
  if (typeof a?.id == "number") try {
    return await bi(a.id, t), {
      action: "open",
      created: !1,
      tabId: a.id,
      targetId: await Kr(a.id, t) ?? e.targetId
    };
  } catch {
    J(t);
  }
  J(t);
  const c = await chrome.tabs.create({
    url: e.url,
    active: !0,
    ...r !== void 0 ? { windowId: r } : {}
  });
  if (J(t), chrome.windows?.update && typeof c.windowId == "number" && await chrome.windows.update(c.windowId, { focused: !0 }), typeof c.id != "number") throw new Error(`Failed to create Chrome tab for ${e.url}`);
  return {
    action: "open",
    created: !0,
    tabId: c.id,
    targetId: await Kr(c.id, t) ?? e.targetId
  };
}
async function pv(e, t) {
  if (J(t), !chrome.tabs?.remove || !chrome.tabs.get || !chrome.tabGroups?.get) throw new Error("Chrome tabs API is unavailable");
  const r = await Za(e.targetId, t);
  return typeof r != "number" ? {
    action: "close",
    closed: !1,
    targetId: e.targetId
  } : {
    action: "close",
    closed: await qa(r, {
      signal: t,
      skipIfActive: e.skipIfActive
    }),
    tabId: r,
    targetId: e.targetId
  };
}
async function mv(e, t, r) {
  return e.action === "open" ? await hv(e, t, r) : await pv(e, t);
}
var gv = 32;
function vv(e, t = gv) {
  if (!(!e || typeof chrome > "u" || !chrome.runtime?.getURL))
    try {
      new URL(e);
      const r = new URL(chrome.runtime.getURL("/_favicon/"));
      return r.searchParams.set("pageUrl", e), r.searchParams.set("size", String(t)), r.toString();
    } catch {
      return;
    }
}
function Si(e) {
  try {
    return window.localStorage.getItem(e) ?? void 0;
  } catch {
    return;
  }
}
async function bn(e) {
  try {
    if (typeof chrome < "u" && chrome.storage?.local) return (await chrome.storage.local.get(e))[e];
  } catch {
    return Si(e);
  }
  return Si(e);
}
async function Vn(e, t) {
  try {
    if (typeof chrome < "u" && chrome.storage?.local) {
      await auxWorkerStorageLocalSet({ [e]: t });
      return;
    }
  } catch {
  }
  try {
    window.localStorage.setItem(e, t);
  } catch {
  }
}
async function yv(e) {
  try {
    if (typeof chrome < "u" && chrome.storage?.local) {
      await auxWorkerStorageLocalRemove(e);
      return;
    }
  } catch {
  }
  try {
    window.localStorage.removeItem(e);
  } catch {
  }
}
function wv(e, t) {
  if (!Number.isInteger(t) || t <= 0) throw new Error("Size must be an integer greater than zero.");
  const r = Math.ceil(e.length / t), n = Array(r);
  for (let o = 0; o < r; o++) {
    const i = o * t, s = i + t;
    n[o] = e.slice(i, s);
  }
  return n;
}
function bv(e, t) {
  const r = {};
  for (let n = 0; n < e.length; n++) {
    const o = e[n], i = t(o, n, e);
    Object.hasOwn(r, i) || (r[i] = []), r[i].push(o);
  }
  return r;
}
function Sv(e, t) {
  const r = [], n = [];
  for (let o = 0; o < e.length; o++) {
    const i = e[o];
    t(i, o, e) ? r.push(i) : n.push(i);
  }
  return [r, n];
}
var _i = typeof globalThis == "object" && globalThis || typeof window == "object" && window || typeof self == "object" && self || typeof globalThis == "object" && globalThis || /* @__PURE__ */ (function() {
  return this;
})(), _v = typeof _i.DOMException < "u" ? _i.DOMException : Error, Iv = class extends _v {
  constructor(e = "The operation was aborted") {
    super(e);
  }
};
function Ev(e, { signal: t } = {}) {
  return new Promise((r, n) => {
    const o = () => {
      n(new Iv());
    }, i = () => {
      clearTimeout(s), o();
    };
    if (t?.aborted) return o();
    const s = setTimeout(() => {
      t?.removeEventListener("abort", i), r();
    }, e);
    t?.addEventListener("abort", i, { once: !0 });
  });
}
var Ii = 0, Av = Number.POSITIVE_INFINITY, Ei = () => !0;
async function Pv(e, t) {
  let r, n, o, i;
  typeof t == "number" ? (r = Ii, n = t, o = void 0, i = Ei) : (r = t?.delay ?? Ii, n = t?.retries ?? Av, o = t?.signal, i = t?.shouldRetry ?? Ei);
  let s;
  for (let a = 0; a <= n; a++) {
    if (o?.aborted) throw s ?? /* @__PURE__ */ new Error("The retry operation was aborted due to an abort signal.");
    try {
      return await e();
    } catch (c) {
      if (s = c, !i(c, a)) throw c;
      a < n && await Ev(typeof r == "function" ? r(a, s) : r);
    }
  }
  throw s;
}
var Ai = class extends Error {
  constructor(e = "Sign in to Aux to use this feature in this profile.") {
    super(e), this.name = "ProfileAccountRequiredError";
  }
};
function Tv(e) {
  return (e?.bindingVersion ?? 0) >= 1;
}
function Pi(e) {
  return e.chromiumProfileId || e.profileId;
}
async function Ov(e, t) {
  if (!Tv(e)) return;
  const r = e.auxUserId || e.boundUserId;
  if (e.localOnly || !r) return -1;
  const n = e.boundAccountId;
  if (n === void 0 || !Number.isInteger(n) || n < 0) throw new Ai("The account connected to this profile is unavailable. Sign in again.");
  const o = await t(n);
  if (!o || o.id !== n || o.userId !== r) throw new Ai("The account connected to this profile changed. Sign in again.");
  return n;
}
var Rv = "Aux can't connect to its local service. Restart Aux and try again.", Cv = "If this keeps happening, check whether another app is using port 21520.", kv = /failed to request daemon auth challenge|failed to exchange daemon auth challenge|failed to fetch with daemon Authorization|failed to fetch|fetch failed|NetworkError when attempting to fetch resource|Load failed|ECONNREFUSED|ERR_CONNECTION_REFUSED|AbortError|TimeoutError/i;
function Sn(e, t = 0) {
  if (t > 4 || e == null) return [];
  if (typeof e == "string") return [e];
  if (e instanceof Error) return [
    e.name,
    e.message,
    ...Sn(e.cause, t + 1)
  ];
  if (typeof e != "object") return [];
  const r = e;
  return [
    "name",
    "message",
    "code",
    "error",
    "cause",
    "data"
  ].flatMap((n) => Sn(r[n], t + 1));
}
function Ba(e) {
  return Sn(e).some((t) => kv.test(t));
}
var Nr = 6e4, Hn = 3, Jn = "lastResolvedProfileAccount", Nv = 864e5, Mv = 3e5, Dv = 5e3, $v = "Unable to resolve Chromium profile account.", Ga = "Your disk is full", Lv = "Free up space, then reopen Aux and try again.", Ka = "Aux is already starting", Uv = "Close any duplicate Aux windows, then reopen Aux and try again.";
function Qn(e) {
  let t = "", r, n = 0, o = null, i = 0;
  return {
    clear() {
      i += 1, t = "", r = void 0, n = 0, o = null;
    },
    get(s, a = "") {
      if (t === a && r !== void 0 && n > Date.now()) return Promise.resolve(r);
      t !== a && (i += 1, t = a, r = void 0, n = 0, o = null);
      const c = i;
      return o ??= s().then((u) => {
        if (c !== i) throw new Error("Profile account changed during lookup.");
        return u !== void 0 && (r = u, n = Date.now() + e), u;
      }).finally(() => {
        c === i && (o = null);
      }), o;
    }
  };
}
var Wa = Qn(Nr), Va = Qn(Nr), Ha = Qn(Nr), Nt = 0, Mt = Promise.resolve(), Lt = 0, xv = /* @__PURE__ */ new Set();
function $e(e) {
  if (Lt !== e) throw new Error("Profile account changed during lookup.");
}
function zv(e) {
  return JSON.stringify({
    bindingVersion: e.bindingVersion,
    chromiumProfileId: e.chromiumProfileId,
    auxUserId: e.auxUserId,
    localOnly: e.localOnly,
    boundAccountId: e.boundAccountId,
    boundUserId: e.boundUserId,
    profileId: e.profileId,
    profileIndex: e.profileIndex,
    profilePath: e.profilePath
  });
}
function Ja(e) {
  return e instanceof Error ? e.name : "Error";
}
function nt(e) {
  return e instanceof Error ? e.message : String(e);
}
function Fv(e) {
  const t = nt(e);
  return t.includes("No procedure found") && t.includes("accounts.ensureProfileAccount");
}
function jv(e) {
  const t = nt(e);
  return Ba(e) ? Rv : t.includes("ENOSPC") || t.includes("no space left on device") ? Ga : t.includes("ELOCKED") || t.includes("Lock file is already being held") ? Ka : $v;
}
function qv(e) {
  const t = new Error(jv(e), { cause: e });
  return t.message === "Aux can't connect to its local service. Restart Aux and try again." ? t.toastDescription = Cv : t.message === Ga ? t.toastDescription = Lv : t.message === Ka && (t.toastDescription = Uv), t;
}
function Zv(e, t, r) {
  chrome?.extension?.inIncognitoContext !== !0 && D.analytics.captureException.mutate({
    accountId: 0,
    name: t.name,
    message: t.message,
    stack: t.stack,
    properties: {
      app: "agent-manager",
      source: "profile_account_resolve",
      causeName: Ja(r),
      causeMessage: nt(r),
      profileId: e.profileId,
      profileIndex: e.profileIndex ?? null,
      boundAccountId: e.boundAccountId ?? null,
      hasBoundUserId: e.boundUserId !== void 0,
      hasProfilePath: e.profilePath !== void 0
    }
  }).catch((n) => {
    console.warn("[Analytics] Failed to capture profile account resolve failure.", { error: nt(n) });
  });
}
function Bv(e) {
  chrome?.extension?.inIncognitoContext !== !0 && D.analytics.captureException.mutate({
    accountId: 0,
    name: Ja(e),
    message: nt(e),
    stack: e instanceof Error ? e.stack : void 0,
    properties: {
      app: "agent-manager",
      source: "profile_context_read"
    }
  }).catch((t) => {
    console.warn("[Analytics] Failed to capture profile context read failure.", { error: nt(t) });
  });
}
function Gv() {
  Nt += 1, Mt = Mt.then(() => yv(Jn)), Wa.clear(), Va.clear(), Ha.clear(), Cn.resetQueries({ queryKey: Le.queryKey }).catch(() => {
  });
}
async function Kv() {
  const e = typeof chrome?.auxAccount?.setProfileAccount == "function";
  try {
    const t = await Ps(async () => chrome?.auxAccount?.getProfileContext?.(), {
      signal: AbortSignal.timeout(Dv),
      createAbortError: () => /* @__PURE__ */ new Error("chrome.auxAccount.getProfileContext timed out")
    });
    if (e && (!t || !Pi(t))) throw new Error("Unable to identify the current browser profile. Reopen Aux and try again.");
    return t && Pi(t) ? t : void 0;
  } catch (t) {
    if (Bv(t), t instanceof Error && t.message.includes("timed out")) throw new Error("Unable to identify the current browser profile. Reopen Aux and try again.", { cause: t });
    if (e) throw t;
    return;
  }
}
async function Qa() {
  return Wa.get(Kv);
}
async function Wv(e, t = Hn) {
  try {
    return await Pv(() => D.accounts.ensureProfileAccount.mutate(e), {
      retries: t,
      delay: (r) => 250 * 2 ** r
    });
  } catch (r) {
    let n = r;
    if (Fv(r)) try {
      return await D.accounts.resolveProfileAccountByProfile.query(e);
    } catch (i) {
      n = i;
    }
    const o = qv(n);
    throw Zv(e, o, n), o;
  }
}
async function Ya(e = Hn) {
  const t = Lt, r = await Qa();
  if ($e(t), !r) return null;
  const n = await Ov(r, (i) => D.accounts.get.query({ accountId: i }));
  if ($e(t), n !== void 0 && n !== -1) return {
    accountId: n,
    browserProfile: r
  };
  const o = await Va.get(async () => {
    const i = await Wv(r, e);
    if (n === -1 && (i.mode !== "local" || i.userId)) throw new Error("Unable to resolve this profile's local account.");
    return {
      accountId: i.id,
      browserProfile: r
    };
  }, zv(r));
  return $e(t), o ?? null;
}
async function Xa() {
  const e = await Ya();
  if (!e) throw new Error("Unable to identify the current browser profile. Reopen Aux and try again.");
  return e;
}
async function G() {
  return (await Xa()).accountId;
}
async function Vv() {
  const e = await Ha.get(async () => (await D.accounts.current.query()).accountId ?? void 0);
  if (e === void 0) throw new Error("Unable to resolve daemon current account.");
  return e;
}
async function ec(e) {
  await Cn.fetchQuery(ed.accounts.auth.me.queryOptions({ accountId: e }, { staleTime: Mv })).catch(() => null);
}
async function Hv(e) {
  try {
    const t = Nt;
    await Mt;
    const r = await bn(Jn);
    if (t !== Nt || !r) return null;
    const n = JSON.parse(r);
    return n.profileId !== e.profileId || n.boundAccountId !== e.boundAccountId || n.boundUserId !== e.boundUserId || typeof n.accountId != "number" || !Number.isInteger(n.accountId) || n.accountId < 0 || typeof n.validatedAt != "number" || Date.now() - n.validatedAt > Nv ? null : {
      accountId: n.accountId,
      browserProfile: e,
      reconnecting: !0
    };
  } catch {
    return null;
  }
}
function tc(e) {
  if (!e.browserProfile) return;
  const t = Nt, r = JSON.stringify({
    accountId: e.accountId,
    boundAccountId: e.browserProfile.boundAccountId,
    boundUserId: e.browserProfile.boundUserId,
    profileId: e.browserProfile.profileId,
    validatedAt: Date.now()
  });
  Mt = Mt.then(() => t === Nt ? Vn(Jn, r) : void 0);
}
async function rc(e = Hn) {
  const t = await Ya(e);
  return t || {
    accountId: await Vv(),
    browserProfile: null
  };
}
var Le = async () => {
  const e = Lt, t = await rc();
  return $e(e), tc(t), ec(t.accountId), t;
};
async function Ti() {
  const e = Lt;
  try {
    const t = await rc();
    return $e(e), tc(t), ec(t.accountId), t;
  } catch (t) {
    if ($e(e), !Ba(t)) throw t;
    const r = await Qa(), n = r ? await Hv(r) : null;
    if ($e(e), !n) throw t;
    return n;
  }
}
Le.queryKey = [{
  scope: "global",
  entity: "profile"
}];
Le.queryOptions = {
  queryKey: Le.queryKey,
  queryFn: Le,
  revalidateIfStale: !0,
  staleTime: Nr
};
Ti.queryOptions = {
  ...Le.queryOptions,
  queryFn: Ti
};
globalThis.chrome?.auxAccount?.onProfileContextChanged?.addListener(() => {
  Lt += 1, Gv();
  for (const e of xv) e();
});
var Wr = "extensionBridgeProfileId", ar = null, _n = 0, Dt = () => chrome.extension.inIncognitoContext === !0 ? "incognito" : "default";
async function nc() {
  const e = _n, t = ar ??= (async () => {
    const r = Dt(), { accountId: n, browserProfile: o } = await Le(), i = o?.chromiumProfileId;
    if (i) return {
      accountId: n,
      profileId: i,
      browserMode: r
    };
    const s = await bn(Wr);
    if (s) return {
      accountId: n,
      profileId: s,
      browserMode: r
    };
    const a = o?.profileId ?? `extension-${crypto.randomUUID()}`;
    return await Vn(Wr, a), {
      accountId: n,
      browserMode: r,
      profileId: await bn(Wr) ?? a
    };
  })();
  try {
    const r = await t;
    if (e !== _n) throw new Error("Browser profile context changed");
    return r;
  } catch (r) {
    throw ar === t && (ar = null), r;
  }
}
function Jv() {
  auxWorkerContextChanged();
  _n += 1, ar = null;
}
globalThis.chrome?.auxAccount?.onProfileContextChanged?.addListener(Jv);
function Qv(e) {
  switch (e.status) {
    case "no-normal-window":
      return "No normal browser window is open for this profile. Open a window and retry.";
    case "tabs-without-normal-window":
      return "This browser profile has open tabs but no normal browser window. Open a new window and retry.";
    case "ambiguous-windows":
      return `Multiple browser windows are open and none is uniquely focused (windows: ${e.candidateWindowIds.join(", ")}). Focus the window you want the agent to use, then retry.`;
  }
}
async function oc() {
  const [e, t, r] = await Promise.all([
    chrome.windows.getAll({}),
    chrome.windows.getLastFocused({ windowTypes: ["normal"] }).then((s) => ({ window: s })).catch((s) => ({ error: s instanceof Error ? s.message : String(s) })),
    chrome.tabs.query({})
  ]), n = "window" in t && typeof t.window.id == "number" ? t.window.id : null, o = Dt() === "incognito", i = r.filter((s) => !!s.incognito === o);
  return {
    snapshot: {
      windows: e.filter((s) => !!s.incognito === o).flatMap((s) => typeof s.id == "number" ? [{
        id: s.id,
        type: s.type ?? "unknown",
        focused: s.focused
      }] : []),
      lastFocusedWindowId: n,
      ..."error" in t ? { lastFocusedError: t.error } : {},
      tabCount: i.length
    },
    tabs: i
  };
}
async function Yv() {
  return (await oc()).snapshot;
}
async function Xv(e) {
  const { snapshot: t, tabs: r } = await oc(), n = Ma(t), o = /* @__PURE__ */ Object.create(null);
  for (const l of t.windows) o[l.type] = (o[l.type] ?? 0) + 1;
  const i = {
    windowCount: t.windows.filter((l) => l.type === "normal").length,
    windowCountByType: o,
    tabCount: t.tabCount,
    ...t.lastFocusedError ? { lastFocusedError: t.lastFocusedError } : {}
  };
  if (n.status !== "ok") return {
    ...n,
    diagnostics: i
  };
  const s = [], a = [];
  for (const l of r) l.windowId === n.windowId && typeof l.id == "number" && (l.active ? s : a).push(l.id);
  const c = [...s, ...a], u = c.length ? await e(c).catch(() => {
  }) : void 0;
  return {
    ...n,
    ...u ? { anchorTargetId: u } : {},
    diagnostics: i
  };
}
var ey = "extension-notification:show", ty = "extension-notification:play-sound";
var Vr, In = !1, En;
chrome.runtime.onMessage.addListener((e) => {
  e?.type === "extension-notification:offscreen-ready" && (In = !0, En?.());
});
function ry(e) {
  const t = new URL(chrome.runtime.getURL("main.html"));
  return t.hash = e, t.toString();
}
function ic(...args){return auxWorkerPhysical("notification-open",()=>auxWorkerOriginalOpenNotification(...args))}
async function auxWorkerOriginalOpenNotification(e, t) {
  if (!chrome.tabs?.create || !chrome.tabs.update || !chrome.tabs.query) throw new Error("Chrome tabs API is unavailable");
  // A concrete target may have closed or changed native profile. Do not
  // select a substitute hidden workspace; create in this caller's profile.
  if (Number.isInteger(t) && t >= 0 &&
      !(await chrome.windows.getAll()).some((window) => window.id === t)) {
    await chrome.windows.create({ url: ry(e), type: "normal", focused: !0, incognito: !1 });
    return;
  }
  let sourceWindowId = t;
  try {
  const r = ry(e), n = chrome.runtime.getURL("main.html"), o = (await chrome.tabs.query(t === void 0 ? {} : { windowId: t })).find((s) => {
    const a = s.url ?? s.pendingUrl;
    return typeof s.id == "number" && a?.startsWith(n);
  });
  if (typeof o?.id == "number") {
    sourceWindowId = o.windowId ?? sourceWindowId;
    const s = await chrome.tabs.update(o.id, {
      active: !0,
      url: r
    });
    chrome.windows?.update && typeof s?.windowId == "number" && await chrome.windows.update(s.windowId, { focused: !0 });
    return;
  }
  const i = await chrome.tabs.create({
    active: !0,
    url: r,
    ...t !== void 0 ? { windowId: t } : {}
  });
  sourceWindowId = i.windowId ?? sourceWindowId;
  chrome.windows?.update && typeof i.windowId == "number" && await chrome.windows.update(i.windowId, { focused: !0 });
  } catch (error) {
    // Retry only after proving the exact original-profile window vanished.
    // Permission, policy and other errors on a surviving target stay errors.
    if (!Number.isInteger(sourceWindowId) || sourceWindowId < 0 ||
        (await chrome.windows.getAll()).some((window) => window.id === sourceWindowId)) {
      throw error;
    }
    await chrome.windows.create({ url: ry(e), type: "normal", focused: !0, incognito: !1 });
  }
}
async function ny() {
  const e = [chrome.offscreen.Reason.WORKERS, chrome.offscreen.Reason.AUDIO_PLAYBACK];
  if (await chrome.offscreen.hasDocument()) {
    if (In) return;
    await chrome.offscreen.closeDocument();
  }
  Vr ??= (async () => {
    In = !1;
    let t;
    const r = new Promise((n, o) => {
      En = n, t = setTimeout(() => o(/* @__PURE__ */ new Error("Notification offscreen document did not become ready.")), 1e4);
    });
    try {
      await chrome.offscreen.createDocument({
        url: "notification.html",
        reasons: e,
        justification: "Show icon-free notifications and play custom notification sounds."
      }), await r;
    } finally {
      t && clearTimeout(t), En = void 0;
    }
  })().finally(() => {
    Vr = void 0;
  }), await Vr;
}
async function sc(e) {
  await ny();
  let t, r;
  for (const o of [
    0,
    50,
    100
  ]) {
    o > 0 && await new Promise((i) => setTimeout(i, o));
    try {
      t = await chrome.runtime.sendMessage(e);
    } catch (i) {
      r = i;
      continue;
    }
    if (t) break;
  }
  if (!t || typeof t != "object") {
    const o = r instanceof Error ? ` Last error: ${r.message}` : r ? ` Last error: ${String(r)}` : "";
    throw new Error(`Notification offscreen document did not respond.${o}`);
  }
  const n = t;
  if (typeof n.error == "string") throw new Error(n.error);
  return n;
}
async function oy(e) {
  const t = await sc({
    type: ey,
    ...e
  });
  if (typeof t.notificationId != "string") throw new Error("Notification offscreen document returned an invalid response.");
  return t.notificationId;
}
async function iy(e, t) {
  await sc({
    type: ty,
    requestId: crypto.randomUUID(),
    sound: e,
    customSound: t
  });
}
var sy = 3e4, ay = 200, wr = [
  50,
  100,
  200,
  400
], Xt = /* @__PURE__ */ new Map(), Oi = !1, cy = (e) => ({
  id: e.id,
  url: e.url ?? "",
  title: e.title ?? "",
  faviconUrl: vv(e.url) ?? "",
  visitCount: e.visitCount ?? 0,
  typedCount: e.typedCount ?? 0,
  lastVisitTime: e.lastVisitTime ?? 0
}), Ri = Promise.resolve();
function ac(e) {
  if (!e?.aborted) return;
  const t = /* @__PURE__ */ new Error("Extension command aborted");
  throw t.name = "AbortError", t;
}
async function uy(e, t) {
  return await new Promise((r, n) => {
    if (t?.aborted) {
      n(t.reason instanceof Error ? t.reason : /* @__PURE__ */ new Error("Extension command aborted"));
      return;
    }
    const o = setTimeout(r, e);
    t?.addEventListener("abort", () => {
      clearTimeout(o), n(t.reason instanceof Error ? t.reason : /* @__PURE__ */ new Error("Extension command aborted"));
    }, { once: !0 });
  });
}
function Ci(e) {
  const t = Ri.then(e, e);
  return Ri = t.then(() => {
  }, () => {
  }), t;
}
function cc(e) {
  const t = e.trim();
  return t.split(/[/\\]+/).at(-1) ?? t;
}
function ki(e) {
  return cc(e).toLowerCase().replace(/ \(\d+\)(?=\.[^./\\]+$|$)/, "");
}
function ly(e, t, r) {
  t && (Xt.set(e, {
    clickPath: t,
    windowId: r
  }), !Oi && (Oi = !0, chrome.notifications.onClicked.addListener((n) => {
    const o = Xt.get(n);
    o && (Xt.delete(n), chrome.notifications.clear(n).catch(() => {
    }), ic(o.clickPath, o.windowId).catch((i) => {
      console.warn("[ExtensionBridge] Failed to open notification target", {
        notificationId: n,
        error: i instanceof Error ? i.message : String(i)
      });
    }));
  }), chrome.notifications.onClosed.addListener((n) => {
    Xt.delete(n);
  })));
}
async function dy(e, t) {
  if (!Da(e)) throw new Error(`Chrome MV3 API method is not whitelisted: ${e}`);
  const r = e.split(".");
  if (r[0] !== "chrome") throw new Error(`Invalid Chrome MV3 API method: ${e}`);
  let n = globalThis.chrome;
  for (const s of r.slice(1, -1)) n = typeof n == "object" && n !== null && Object.hasOwn(n, s) ? n[s] : void 0;
  const o = r.at(-1), i = o && typeof n == "object" && n !== null && Object.hasOwn(n, o) ? n[o] : void 0;
  if (typeof i != "function") throw new Error(`Chrome MV3 API method is not available: ${e}`);
  return await i.apply(n, t);
}
function Ni(e, t, r) {
  return !(t && ki(e.filename) !== ki(t) || r && e.referrer && e.referrer !== r);
}
async function fy(e, t) {
  const r = Date.now() + (e.timeoutMs ?? sy), n = new Date(Math.max(0, e.startedAfterMs - 1e3)).toISOString();
  for (; Date.now() < r; ) {
    ac(t);
    const o = await chrome.downloads.search({
      startedAfter: n,
      orderBy: ["-startTime"],
      limit: 20
    }), i = o.filter((a) => Ni(a, e.expectedFilename, e.referrerUrl)), s = (i.length > 0 ? i : o.filter((a) => Ni(a, e.expectedFilename)))[0];
    if (s?.state === "complete" && s.filename) return {
      downloadId: s.id,
      absolutePath: s.filename
    };
    if (s?.state === "interrupted") throw new Error(`Download interrupted${s.error ? `: ${s.error}` : ""}`);
    await uy(ay, t);
  }
  throw new Error(`Timed out waiting for download${e.expectedFilename ? `: ${cc(e.expectedFilename)}` : ""}`);
}
async function hy(e) {
  return new Promise((t, r) => {
    e.get({}, (n) => {
      const o = chrome.runtime.lastError;
      if (o) {
        r(new Error(o.message));
        return;
      }
      t(n);
    });
  });
}
async function py(e, t) {
  return auxWorkerPhysical("chrome-privacy-setting",()=>new Promise((r, n) => {
    e.set({ value: t }, () => {
      const o = chrome.runtime.lastError;
      if (o) {
        n(new Error(o.message));
        return;
      }
      r();
    });
  }));
}
async function my() {
  const e = chrome.privacy?.websites?.thirdPartyCookiesAllowed;
  if (!e) return {
    value: null,
    levelOfControl: null,
    isAvailable: !1
  };
  const t = await hy(e);
  return {
    value: t.value ? "allow" : "block",
    levelOfControl: t.levelOfControl,
    isAvailable: !0
  };
}
async function Be(e, t = !1) {
  let r = 0;
  for (const n of [0, ...wr]) {
    n > 0 && await new Promise((s) => setTimeout(s, n));
    const o = await chrome.debugger.getTargets();
    r = o.length;
    const i = o.find((s) => s.id === e && typeof s.tabId == "number" && (!t || s.type === "page"));
    if (typeof i?.tabId == "number") {
      if (!!(await chrome.tabs.get(i.tabId)).incognito != (Dt() === "incognito")) throw new Error("The target tab belongs to a different browser mode.");
      return i.tabId;
    }
  }
  throw new Error(`No Chrome tab found for target ${e} after ${wr.length + 1} attempts (${r} debugger targets)`);
}
async function Mi(e) {
  let t = 0;
  for (const r of [0, ...wr]) {
    r > 0 && await new Promise((i) => setTimeout(i, r));
    const n = await chrome.debugger.getTargets();
    t = n.length;
    const o = /* @__PURE__ */ new Map();
    for (const i of n) i.type === "page" && typeof i.tabId == "number" && i.id && !o.has(i.tabId) && o.set(i.tabId, i.id);
    for (const i of e) {
      const s = o.get(i);
      if (s) return s;
    }
  }
  throw new Error(`No debugger target found for ${e.length} Chrome tab(s) after ${wr.length + 1} attempts (${t} debugger targets)`);
}
async function Di(e, t) {
  const r = t ? await Be(t).catch(() => {
  }) : void 0, n = r !== void 0 ? await chrome.tabs.get(r).catch(() => {
  }) : void 0;
  if (n?.windowId !== void 0) return n.windowId;
  if (e.windowId !== void 0) {
    const i = await chrome.windows.get(e.windowId).catch(() => {
    });
    if (i && !!i.incognito == (e.browserMode === "incognito")) return e.windowId;
    throw new Error("The task browser window is no longer available in its original browser mode. Reopen the task in the intended window.");
  }
  const o = Ma(await Yv());
  if (o.status !== "ok") throw new Error(Qv(o));
  return o.windowId;
}
async function ft(e, t = {}, r = {}) {
  const n = auxWorkerPhysical("password-extension-message",()=>chrome.runtime.sendMessage(La, {
    ...t,
    command: e
  })), o = r.timeoutMs == null ? void 0 : new Promise((s, a) => {
    setTimeout(() => a(/* @__PURE__ */ new Error(`Password manager extension command timeout: ${e}`)), r.timeoutMs);
  }), i = await (o ? Promise.race([n, o]) : n);
  if (i?.success === !1 || r.requireSuccess && !i?.success) throw new Error(i?.error ?? "Password manager extension command failed");
  return i;
}
async function $i(e) {
  const t = await chrome.tabs.get(e);
  if (typeof t.windowId != "number") throw new Error(`No window found for tab ${e}`);
  const [r] = await chrome.tabGroups.query({
    title: sr,
    windowId: t.windowId
  });
  if (typeof r?.id == "number")
    return await chrome.tabs.group({
      groupId: r.id,
      tabIds: e
    }), await chrome.tabGroups.update(r.id, { title: sr }), r.id;
  const n = await chrome.tabs.group({
    tabIds: e,
    createProperties: { windowId: t.windowId }
  });
  return await chrome.tabGroups.update(n, { title: sr }), n;
}
var gy = (e, t, r) => ({
  active: !!e.active,
  faviconUrl: e.favIconUrl || "",
  id: `tab:${t}`,
  targetId: t,
  title: e.title?.trim() || e.url || e.pendingUrl || "about:blank",
  url: e.url ?? e.pendingUrl ?? "",
  windowId: e.windowId,
  focusedWindow: r !== void 0 && e.windowId === r
});

async function auxCloudGetCookieSyncContext(params) {
  if(chrome.extension?.inIncognitoContext||!chrome.auxAccount?.getProfileContext)throw Error('Regular native cookie profile context is unavailable.');
  const context=await chrome.auxAccount.getProfileContext();
  if(!context||context.profileId!==params.profileId||context.boundAccountId!==params.accountId||context.boundUserId!==params.userId||context.isRegularProfile!==true||context.isOffTheRecord!==false||context.hasAccountSession!==true||context.accountAuthPaused!==false||typeof context.cookieRestoreEpoch!=='string'||!context.cookieRestoreEpoch||context.cookieRestorePending!==false||typeof context.cookieBindingEpoch!=='string'||!context.cookieBindingEpoch||typeof context.browserContextId!=='string'||!context.browserContextId)throw Error('Native cookie profile identity does not match.');
  return {profileId:context.profileId,boundAccountId:context.boundAccountId,boundUserId:context.boundUserId,isRegularProfile:true,isOffTheRecord:false,hasAccountSession:true,accountAuthPaused:false,cookieRestoreEpoch:context.cookieRestoreEpoch,cookieRestorePending:false,cookieBindingEpoch:context.cookieBindingEpoch,browserContextId:context.browserContextId};
}
async function auxCloudRestoreCookieSnapshot(params) {
  const before=await auxCloudGetCookieSyncContext(params);
  if(before.cookieBindingEpoch!==params.cookieBindingEpoch||before.browserContextId!==params.browserContextId||!chrome.auxBrowserImport?.startImport)throw Error('Native cookie restore context is unavailable.');
  const result=await chrome.auxBrowserImport.startImport({...params,source:'aux-cloud-cookies'});
  const after=await auxCloudGetCookieSyncContext(params);
  if(before.cookieBindingEpoch!==after.cookieBindingEpoch||before.browserContextId!==after.browserContextId)throw Error('Native cookie profile changed during recovery.');
  if(result?.complete!==true)throw Error('Native cookie restoration did not complete.');
  return result;
}

async function vy(e, t, r) {
  if (ac(t), r && r.browserMode !== Dt()) throw new Error("Extension bridge command was routed to the wrong browser mode.");
  switch (e.method) {
    case "Aux.getCookieSyncContext": return await auxCloudGetCookieSyncContext(e.params);
    case "Aux.restoreCookieSnapshot": return await auxCloudRestoreCookieSnapshot(e.params);
    case "Aux.listTabs": {
      if (e.params.accountId !== void 0 && await G().catch(() => null) !== e.params.accountId)
        return { items: [] };
      const [n, o, i, s] = await Promise.all([
        chrome.tabs.query({}),
        chrome.debugger.getTargets().catch(() => []),
        chrome.windows.getLastFocused().catch(() => null),
        e.params.groupWindowId !== void 0 ? chrome.tabGroups.query({ windowId: e.params.groupWindowId }).catch(() => []) : []
      ]), a = new Map(s.map((l) => [l.id, l])), c = /* @__PURE__ */ new Map();
      for (const l of o) l.type === "page" && typeof l.tabId == "number" && typeof l.id == "string" && c.set(l.tabId, l.id);
      const u = [];
      for (const l of n) {
        if (typeof l.id != "number" || !!l.incognito != (Dt() === "incognito")) continue;
        const f = c.get(l.id), d = l.url ?? l.pendingUrl ?? "";
        if (!f || !d || d.startsWith("chrome://") || d.startsWith("chrome-extension://") && (!e.params.extensionId || !d.startsWith(`chrome-extension://${e.params.extensionId}/`))) continue;
        const h = l.windowId === e.params.groupWindowId ? a.get(l.groupId) : void 0;
        u.push({
          ...gy(l, f, i?.focused ? i.id : void 0),
          ...h ? { group: {
            id: h.id,
            title: h.title?.trim() || "Untitled group"
          } } : {}
        });
      }
      return u.sort((l, f) => Number(f.active) - Number(l.active)), { items: u };
    }
    case "Aux.validateTabReferences": { const binding=await Xa(); if(!r||binding.accountId!==r.accountId||binding.browserProfile?.profileId!==r.profileId)throw Error("Tab references belong to another browser profile."); const result=await chrome.auxBrowserPreferences.validateTabReferences(e.params); const current=await Xa(); if(current.accountId!==binding.accountId||current.browserProfile?.profileId!==binding.browserProfile?.profileId)throw Error("The browser profile changed."); return result; }
    case "Aux.ownsTarget":
      return { owned: await Be(e.params.targetId, !0).then(() => !0).catch(() => !1) };
    case "Aux.openProfileUrl": {
      if (!r) throw new Error("Browser route is required to open a profile URL");
      const n = await Di(r);
      return await chrome.tabs.create({
        active: !0,
        url: e.params.url,
        windowId: n
      }), { success: !0 };
    }
    case "Aux.createAgentTab": {
      if (!r) throw new Error("Browser route is required to create an agent tab");
      const n = await Di(r, e.params.anchorTargetId), o = await chrome.tabs.create({
        active: !1,
        url: e.params.url,
        windowId: n
      });
      if (o.id === void 0) throw new Error(`Failed to create Chrome tab for ${e.params.url}`);
      const i = o.id;
      return await Ci(() => $i(i)).catch((s) => {
        console.warn("[extension-bridge] createAgentTab: failed to group new agent tab", s);
      }), {
        tabId: i,
        targetId: await Mi([i]),
        windowId: n
      };
    }
    case "Aux.routeBrowserLink": {
      if (t.aborted) throw new Error("Browser routing cancelled");
      if (!r?.profileId || r.browserMode !== "default") throw new Error("Regular profile binding required");
      if (!chrome.auxBrowserPreferences?.routeBrowserLink) throw new Error("Browser routing unavailable in this build");
      return await chrome.auxBrowserPreferences.routeBrowserLink({...e.params, boundProfileId:r.profileId});
    }
    case "Aux.resolveBindingWindow":
      return await Xv(Mi);
    case "Aux.searchHistory": {
      const { query: n, ...o } = e.params;
      return { items: (await chrome.history.search({
        text: n,
        ...o
      })).map(cy) };
    }
    case "Aux.getThirdPartyCookies":
      return await my();
    case "Aux.setThirdPartyCookies": {
      const n = chrome.privacy?.websites?.thirdPartyCookiesAllowed;
      if (!n) throw new Error("Third-party cookie setting is not available.");
      return await py(n, e.params.value === "allow"), { success: !0 };
    }
    case "Aux.ensureTabInAiTabsGroup":
      return await Ci(async () => {
        const n = await Be(e.params.targetId);
        return {
          success: !0,
          groupId: await $i(n),
          tabId: n
        };
      });
    case "Aux.controlTab":
      return {
        success: !0,
        ...await mv(e.params, t, r?.windowId)
      };
    case "Aux.waitForDownload":
      return await fy(e.params, t);
    case "Aux.showNotification": {
      const { title: n, message: o, type: i, clickPath: s, contextMessage: a, sound: c, customSound: u, ...l } = e.params;
      if (!(i !== "basic" || l.buttons?.length || l.imageUrl || l.items?.length || l.progress !== void 0)) {
        const d = crypto.randomUUID();
        try {
          await oy({
            notificationId: d,
            title: n,
            body: a ? `${o}
${a}` : o,
            clickPath: s,
            windowId: r?.windowId,
            requireInteraction: l.requireInteraction,
            silent: l.silent,
            sound: c,
            customSound: u
          });
        } catch (h) {
          console.warn("[ExtensionBridge] Failed to show basic notification", {
            notificationId: d,
            error: h instanceof Error ? h.message : String(h)
          });
        }
        return { notificationId: d };
      }
      const f = await chrome.notifications.create({
        type: i,
        iconUrl: chrome.runtime.getURL("icons/icon-128.png"),
        title: n,
        message: o,
        contextMessage: a,
        ...l
      });
      return ly(f, s, r?.windowId), { notificationId: f };
    }
    case "Aux.playNotificationSound":
      try {
        await iy(e.params.sound, e.params.customSound);
      } catch (n) {
        console.warn("[ExtensionBridge] Failed to play notification sound", {
          sound: e.params.sound,
          error: n instanceof Error ? n.message : String(n)
        });
      }
      return { ok: !0 };
    case "Aux.grantNotificationPermission": {
      const n = await Be(e.params.targetId);
      if (!chrome.auxNotification) throw new Error("chrome.auxNotification API not available (requires Aux browser)");
      return await chrome.auxNotification.requestPermission(n), { success: !0 };
    }
    case "Aux.revokeNotificationPermission":
      if (!chrome.auxNotification) throw new Error("chrome.auxNotification API not available (requires Aux browser)");
      return { revoked: await chrome.auxNotification.revokePermission(e.params.origin) };
    case "Aux.clearAiTabsGroup": {
      const n = await chrome.tabGroups.query({
        title: sr,
        ...r?.windowId !== void 0 ? { windowId: r.windowId } : {}
      });
      if (n.length === 0) return {
        success: !0,
        closedCount: 0
      };
      const o = e.params.keepTargetIds?.length ? new Set(e.params.keepTargetIds) : void 0, i = /* @__PURE__ */ new Map();
      if (o) try {
        for (const a of await chrome.debugger.getTargets()) a.type === "page" && typeof a.tabId == "number" && typeof a.id == "string" && i.set(a.tabId, a.id);
      } catch {
        return {
          success: !0,
          closedCount: 0
        };
      }
      let s = 0;
      for (const a of n) {
        const c = (await chrome.tabs.query({ groupId: a.id })).map((u) => u.id).filter((u) => u != null).filter((u) => !o || !o.has(i.get(u) ?? ""));
        for (const u of c) await qa(u, { signal: t }) && s++;
      }
      return {
        success: !0,
        closedCount: s
      };
    }
    case "Aux.callExtensionMV3Api":
      return await dy(e.params.method, e.params.args);
    case "Aux.createPasswordManagerGeneratedPasswordRef": {
      const n = await ft("createGeneratedPasswordRef", e.params);
      if (!n?.refId) throw new Error(n?.error ?? "Password manager extension command failed");
      return { refId: n.refId };
    }
    case "Aux.fillPasswordManagerGeneratedPasswordRef":
      return await ft("fillGeneratedPasswordRef", {
        tabId: await Be(e.params.targetId),
        refId: e.params.refId
      }, { requireSuccess: !0 }), { success: !0 };
    case "Aux.resolvePasswordManagerGeneratedPasswordRefs":
      return { refs: (await ft("resolveGeneratedPasswordRefs", e.params, { requireSuccess: !0 }))?.refs ?? [] };
    case "Aux.clearPasswordManagerGeneratedPasswordRefs":
      return await ft("clearGeneratedPasswordRefs", e.params, { requireSuccess: !0 }), { success: !0 };
    case "Aux.performPasswordManagerAutofill":
      return await ft("performAutofill", {
        tabId: await Be(e.params.targetId),
        itemId: e.params.itemId,
        pwmAccountId: e.params.pwmAccountId,
        agentSessionId: e.params.agentSessionId
      }, { requireSuccess: !0 }), { success: !0 };
    case "Aux.applePasswords.capabilities":
      return { capabilities: await Re.capabilities() };
    case "Aux.applePasswords.requestAuth":
      return await Re.requestAuth();
    case "Aux.applePasswords.verifyAuth":
      return await Re.verifyAuth(e.params.pin);
    case "Aux.applePasswords.listLogins":
      return { items: await Re.listLogins(e.params.url) };
    case "Aux.applePasswords.getPasswords":
      return { items: await Re.getPasswords(e.params.url, e.params.username) };
    case "Aux.applePasswords.saveLogin":
      return await Re.saveLogin(e.params.url, e.params.username, e.params.password);
    case "Aux.applePasswords.getOtps":
      return { items: await Re.getOtps(e.params.url) };
  }
}
var yy = As(new URL("/extension-bridge/extension", Je).toString()), wy = [
  0,
  250,
  750,
  1500,
  3e3
], by = 2e3, Sy = class {
  bridgeUrl;
  socket = null;
  connectPromise = null;
  runningCommands = /* @__PURE__ */ new Map();
  initialized = !1;
  reconnectBlockedByNewerContext = !1;
  loggedConnectionState = null;
  contextGeneration = 0;
  constructor(e = yy) {
    this.bridgeUrl = e;
  }
  get isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
  start() {
    this.initialized || (this.initialized = !0, this.ensureConnected().catch(() => {
    }));
  }
  reconnectForProfileChange() {
    this.contextGeneration += 1, this.connectPromise = null, this.#e("profile_context_changed"), this.reconnectBlockedByNewerContext = !1, this.ensureConnected().catch(() => {
    });
  }
  ensureConnected(e={}) {return auxWorkerPhysical("bridge-connect",()=>this.auxWorkerEnsureConnected(e),false)}
  async auxWorkerEnsureConnected(e = {}) {
    const t = this.contextGeneration, r = () => {
      if (t !== this.contextGeneration) throw new Error("Browser profile context changed");
    }, n = await this.#i();
    if (r(), this.isConnected && !e.reconcileOpenSocket && !this.reconnectBlockedByNewerContext) return;
    const o = await this.checkDaemonExtensionStatus(n);
    if (r(), this.reconnectBlockedByNewerContext) {
      if (o === !0) throw new Error("Bridge connection was replaced by a newer extension context");
      this.reconnectBlockedByNewerContext = !1;
    }
    if (this.isConnected && e.reconcileOpenSocket && o === !1 && this.#e("bridge_status_mismatch"), this.isConnected) return;
    if (o === null)
      throw this.loggedConnectionState !== "disconnected" && (console.log("[ExtensionBridge] 🔴 Daemon extension bridge disconnected."), this.loggedConnectionState = "disconnected"), new Error("Daemon unreachable");
    let i = null;
    for (const s of wy) {
      s > 0 && (await new Promise((a) => setTimeout(a, s)), r());
      try {
        await this.#t(t, n);
        return;
      } catch (a) {
        i = a;
      } finally {
        r();
      }
    }
    throw this.loggedConnectionState === "connected" && (console.log("[ExtensionBridge] 🔴 Daemon extension bridge disconnected."), this.loggedConnectionState = "disconnected"), i ?? /* @__PURE__ */ new Error("Failed to connect daemon extension bridge after retries");
  }
  get statusUrl() {
    const e = new URL(this.bridgeUrl);
    return e.protocol = e.protocol === "wss:" ? "https:" : "http:", e.pathname = e.pathname.replace(/\/extension$/, "") || "/extension-bridge", e.toString();
  }
  send(e) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) throw new Error("Bridge socket is not connected");
    this.socket.send(JSON.stringify(e));
  }
  #e(e) {
    const t = this.socket;
    this.socket = null;
    try {
      t?.close(1e3, e);
    } catch {
    }
    this.#n(e);
  }
  async checkDaemonExtensionStatus(e) {
    try {
      const t = new URL(this.statusUrl);
      t.searchParams.set("accountId", String(e.accountId)), t.searchParams.set("profileId", e.profileId), t.searchParams.set("browserMode", e.browserMode);
      const r = await ve(t, {
        method: "GET",
        signal: AbortSignal.timeout(by)
      });
      if (!r.ok) return null;
      const n = await r.json().catch(() => null);
      return typeof n?.connected == "boolean" ? n.connected : null;
    } catch {
      return null;
    }
  }
  async #t(e, t) {
    if (this.isConnected) return;
    if (this.connectPromise) {
      await this.connectPromise;
      return;
    }
    const r = (async () => {
      const n = crypto.randomUUID(), o = await Wl(this.bridgeUrl);
      if (e !== this.contextGeneration)
        throw o.close(1e3, "profile_context_changed"), new Error("Browser profile context changed");
      this.socket = o, await new Promise((i, s) => {
        let a = !1;
        o.onopen = () => {
          if (this.socket !== o) {
            try {
              o.close();
            } catch {
            }
            s(/* @__PURE__ */ new Error("Browser profile context changed"));
            return;
          }
          this.send({
            method: "register",
            connectionId: n,
            route: t
          });
        }, o.onmessage = (c) => {
          if (this.socket !== o) return;
          const u = typeof c.data == "string" ? JSON.parse(c.data) : null, l = Ne.registeredMessageSchema.safeParse(u);
          if (l.success && l.data.connectionId === n) {
            a = !0, this.loggedConnectionState !== "connected" && (console.log("[ExtensionBridge] 🟢 Connected to daemon extension bridge."), this.loggedConnectionState = "connected"), i();
            return;
          }
          this.#r(c.data, o, e).catch(() => {
          });
        }, o.onclose = (c) => {
          if (a || (a = !0, s(/* @__PURE__ */ new Error(`Bridge closed during connect (${c.code} ${c.reason || "no reason"})`))), this.socket !== o) return;
          const u = c.code === 1012 && c.reason.includes("replaced by newer connection");
          u && (this.reconnectBlockedByNewerContext = !0), this.socket = null, this.connectPromise = null, this.#n(c.reason || "bridge closed"), this.initialized && !u && (this.loggedConnectionState !== "disconnected" && (console.log("[ExtensionBridge] 🔴 Daemon extension bridge disconnected."), this.loggedConnectionState = "disconnected"), this.ensureConnected().catch(() => {
          }));
        }, o.onerror = () => {
          a || (a = !0, s(/* @__PURE__ */ new Error("Failed to connect daemon extension bridge")));
        };
      });
    })();
    this.connectPromise = r;
    try {
      await r;
    } finally {
      this.connectPromise === r && (this.connectPromise = null);
    }
  }
  async #r(e, t, r) {
    const n = () => this.socket === t && this.contextGeneration === r, o = (d) => {
      n() && this.send(d);
    }, i = typeof e == "string" ? e : e instanceof Blob ? await e.text() : new TextDecoder().decode(e);
    if (!n()) return;
    const s = JSON.parse(i);
    if (!s || typeof s != "object") return;
    if (Ne.pingMessageSchema.safeParse(s).success) {
      o({ method: "pong" });
      return;
    }
    const a = Ne.cancelCommandMessageSchema.safeParse(s);
    if (a.success) {
      const auxCancelError=new Error(`Extension command cancelled: ${a.data.id}`);
      if(!auxWorkerCancelDeferred("bridge-command",a.data.id,t,auxCancelError))this.runningCommands.get(a.data.id)?.abort(auxCancelError);
      return;
    }
    const c = Ne.runCommandMessageEnvelopeSchema.safeParse(s);
    if (!c.success) return;
    const u = Ne.runCommandMessageSchema.safeParse(s);
    if (!u.success) {
      const d = `Unsupported command: ${c.data.command.method}`;
      return o({
        id: c.data.id,
        result: null,
        error: d
      });
    }
    return auxWorkerProduce("bridge-command",async()=>{
    const l = await this.#i();
    if (!n()) return;
    if (u.data.route.accountId !== l.accountId || u.data.route.profileId !== l.profileId || u.data.route.browserMode !== l.browserMode) {
      o({
        id: u.data.id,
        result: null,
        error: "Extension bridge command was routed to the wrong browser profile or mode"
      });
      return;
    }
    const f = new AbortController();
    this.runningCommands.set(u.data.id, f);
    try {
      const d = await vy(u.data.command, f.signal, u.data.route);
      o({
        id: u.data.id,
        result: d
      });
    } catch (d) {
      auxWorkerNoteUnknown("bridge-command");
      o({
        id: u.data.id,
        result: null,
        error: d instanceof Error ? d.message : String(d)
      });
    } finally {
      this.runningCommands.get(u.data.id) === f && this.runningCommands.delete(u.data.id);
    }
    },{key:u.data.id,owner:t,onCancelled:error=>o({id:u.data.id,result:null,error:String(error?.message??error)})});
  }
  #n(e) {
    for (const t of this.runningCommands.values()) t.abort(/* @__PURE__ */ new Error(`Extension bridge disconnected: ${e}`));
    this.runningCommands.clear();
  }
  #i() {
    return nc();
  }
}, Ge = null, Li = !1, Ui = !1, _y = "extension-bridge:keepalive", Iy = 0.5;
function Ey(e) {
  Ge || (Ge = new Sy(e)), xi(), Ge.start(), Li || (chrome.auxAccount?.onProfileContextChanged?.addListener(() => Ge?.reconnectForProfileChange()), chrome.runtime.onMessage.addListener((t, r, n) => {
    if (t?.type === "extension-bridge:ensure")
      return Ay(r) ? (xi(), Ge.ensureConnected({ reconcileOpenSocket: !0 }).then(() => n({ ok: !0 })).catch((o) => n({
        ok: !1,
        error: o instanceof Error ? o.message : String(o)
      })), !0) : (n({
        ok: !1,
        skipped: !0
      }), !1);
  }), Li = !0);
}
function xi() {
  Ui || (chrome.alarms.onAlarm.addListener(async (e) => {
    e.name === "extension-bridge:keepalive" && await Ge.ensureConnected({ reconcileOpenSocket: !0 }).catch(() => {
    });
  }), auxWorkerAlarmCreate(_y, { periodInMinutes: Iy }), Ui = !0);
}
function Ay(e) {
  const t = `chrome-extension://${chrome.runtime.id}`;
  return e.id === chrome.runtime.id || e.url?.startsWith(`${t}/`) === !0 || e.origin === t;
}
var Hr = "extension-history-cleanup:daily", Py = 1e4, Ty = 500, Oy = 6e4, Ry = 30, Cy = 3e5, zi = !1, ht, Jr = /* @__PURE__ */ new Map(), Fi = /* @__PURE__ */ new Map(), ky = (e, t, r) => e === r || e.startsWith(chrome.runtime.getURL("newtab.html")) || t >= Ty;
function ji(...args){return auxWorkerProduce("history-cleanup",()=>auxWorkerOriginalHistoryCleanup(...args))}
function auxWorkerOriginalHistoryCleanup(e) {
  if (ht) return ht;
  const t = (async () => {
    try {
      const r = chrome.runtime.getURL(""), n = (await chrome.history.search({
        text: chrome.runtime.id,
        startTime: 0,
        maxResults: Py
      })).filter((i) => i.url?.startsWith(r) && ky(i.url, i.visitCount ?? 0, e)).sort((i, s) => (s.visitCount ?? 0) - (i.visitCount ?? 0));
      if (n.length === 0) return;
      await Promise.all(n.map((i) => auxWorkerPhysical("chrome-history-delete",()=>chrome.history.deleteUrl({url:i.url}))));
      const o = await G();
      await D.analytics.capture.mutate({
        accountId: o,
        event: "extension.history.cleanup",
        properties: {
          trigger: e ? "visit-rate" : "daily",
          urlCount: n.length,
          visitCount: n.reduce((i, s) => i + (s.visitCount ?? 0), 0),
          topRoute: n[0].url.slice(r.length).split("?")[0],
          topVisitCount: n[0].visitCount ?? 0
        }
      });
    } catch (r) {
      console.warn("[Background] Extension history cleanup failed.", { error: r instanceof Error ? r.message : String(r) });
    }
  })().finally(() => {
    ht === t && (ht = void 0);
  });
  return ht = t, t;
}
function Ny() {
  zi || (zi = !0, chrome.alarms.onAlarm.addListener((e) => {
    e.name === Hr && ji();
  }), chrome.history.onVisited.addListener(({ url: e }) => {
    if (!e?.startsWith(chrome.runtime.getURL(""))) return;
    const t = Date.now(), r = (Jr.get(e) ?? []).filter((n) => t - n < Oy);
    r.push(t), Jr.set(e, r), !(r.length < Ry || t - (Fi.get(e) ?? 0) < Cy) && (Fi.set(e, t), Jr.delete(e), ji(e));
  }), chrome.alarms.get(Hr).then((e) => {
    e || auxWorkerAlarmCreate(Hr, {
      delayInMinutes: 1,
      periodInMinutes: 1440
    });
  }).catch(() => {
  }));
}
var ye = {
  CODE: "{code}",
  IMAGE: "{image}",
  TEXT: "{text}"
}, Yn = /\{[^}]+\}/g, uc = Object.values(ye), My = Z(["text-selection", "lasso"]), Dy = p().trim().min(1).refine(Fy, `Only ${Object.values(ye).join(", ")} placeholders are supported.`), $y = Me("type", [
  m({
    type: E("prompt"),
    prompt: p().min(1, "Prompt is required.").refine((e) => e.trim().length > 0, "Prompt is required.")
  }),
  m({
    type: E("open-url"),
    href: Dy
  }),
  m({ type: E("copy") })
]), Ly = m({
  id: p().trim().min(1),
  icon: p().trim().min(1),
  color: p().optional(),
  type: My,
  name: p().trim().min(1),
  action: $y
}).superRefine((e, t) => {
  if (e.action.type === "prompt" && !qy(e.action.prompt, uc) && t.addIssue({
    code: "custom",
    message: "Prompt must include at least one token. e.g. {text}.",
    path: ["action", "prompt"]
  }), e.action.type === "open-url" && Qr(t, e.action.href, ye.IMAGE, {
    message: `${ye.IMAGE} is only available for prompt shortcuts.`,
    path: ["action", "href"]
  }), e.type === "text-selection") {
    if (e.action.type === "prompt") for (const r of [ye.CODE, ye.IMAGE]) Qr(t, e.action.prompt, r, {
      message: `${r} is only available for lasso shortcuts.`,
      path: ["action", "prompt"]
    });
    e.action.type === "open-url" && Qr(t, e.action.href, ye.CODE, {
      message: `${ye.CODE} is only available for lasso shortcuts.`,
      path: ["action", "href"]
    });
  }
}), Uy = [
  {
    id: "text-selection-summarize",
    icon: "summary",
    type: "text-selection",
    name: "Summarize",
    color: "mono",
    action: {
      type: "prompt",
      prompt: `Summarize this text:
{text}`
    }
  },
  {
    id: "text-selection-translate",
    icon: "translate",
    type: "text-selection",
    name: "Translate",
    color: "mono",
    action: {
      type: "prompt",
      prompt: `Translate this text to English:
{text}`
    }
  },
  {
    id: "lasso-copy-code",
    icon: "terminal",
    type: "lasso",
    name: "Copy code",
    color: "mono",
    action: { type: "copy" }
  },
  {
    id: "lasso-search-image",
    icon: "image",
    type: "lasso",
    name: "Search image",
    color: "mono",
    action: {
      type: "prompt",
      prompt: `What is this image about?
{image}`
    }
  }
], xy = Z([
  "Alt",
  "Shift",
  "Control",
  "Meta"
]), lc = m({
  enabled: $().optional(),
  textSelectionEnabled: $().default(!0),
  lassoSelectionEnabled: $().default(!0),
  hotkey: xy.default("Alt"),
  shortcuts: N(Ly).prefault(Uy)
}).prefault({}).transform(({ enabled: e, ...t }) => e === !1 ? {
  ...t,
  textSelectionEnabled: !1,
  lassoSelectionEnabled: !1
} : t), Vb = lc.parse({});
function zy(e) {
  return lc.parse(e ?? {});
}
function Fy(e) {
  return (e.match(Yn) ?? []).every((t) => uc.includes(t));
}
function jy(e, t) {
  return (e.match(Yn) ?? []).includes(t);
}
function qy(e, t) {
  return (e.match(Yn) ?? []).some((r) => t.includes(r));
}
function Qr(e, t, r, n) {
  jy(t, r) && e.addIssue({
    code: "custom",
    message: n.message,
    path: n.path
  });
}
var Zy = "aside.lasso-storage-bridge";
function By(e) {
  return typeof e == "object" && e !== null && "source" in e && e.source === "aside.lasso-storage-bridge" && "direction" in e && e.direction === "response" && "requestId" in e && typeof e.requestId == "string" && "ok" in e && typeof e.ok == "boolean" && "value" in e;
}
var Gy = "aside.lasso.v1", Ky = /* @__PURE__ */ new Map();
function Wy(e) {
  return `${Gy}:${e}`;
}
function Vy(e) {
  Ky.get(e)?.forEach((t) => t());
}
function Hy(e) {
  return typeof window > "u" ? Promise.resolve(null) : new Promise((t) => {
    const r = crypto.randomUUID(), n = window.setTimeout(() => {
      window.removeEventListener("message", o), t(null);
    }, 500), o = (s) => {
      s.source !== window || !By(s.data) || s.data.requestId === r && (window.clearTimeout(n), window.removeEventListener("message", o), t(s.data.ok ? s.data.value : null));
    };
    window.addEventListener("message", o);
    const i = {
      ...e,
      source: Zy,
      direction: "request",
      requestId: r
    };
    window.postMessage(i, window.location.origin);
  });
}
async function Jy(e, t) {
  const r = Wy(e), n = zy(t);
  try {
    typeof chrome < "u" && chrome.storage?.local ? await auxWorkerStorageLocalSet({ [r]: n }) : await Hy({
      action: "set-lasso-settings",
      accountId: e,
      value: n
    }) !== null || typeof window < "u" && window.localStorage.setItem(r, JSON.stringify(n));
  } finally {
    Vy(r);
  }
  return n;
}
var Qy = /^\/u\/(\d+)(?:\/|$)/;
function qi(e) {
  const t = Number(e?.match(Qy)?.[1]);
  return Number.isInteger(t) && t >= 0 ? t : null;
}
function Zi(e) {
  const t = new URLSearchParams(e ?? "").get("accountId");
  if (!t?.trim()) return null;
  const r = Number(t);
  return Number.isInteger(r) && r >= 0 ? r : null;
}
function Yy() {
  if (typeof window > "u") return null;
  const e = qi(window.location.pathname);
  if (e !== null) return e;
  const t = Zi(window.location.search);
  if (t !== null) return t;
  const [r = "", n = ""] = window.location.hash.replace(/^#/, "").split("?");
  return qi(r) ?? Zi(n);
}
function br(e, t = Yy()) {
  if (t === null || !Number.isInteger(t) || t < 0) throw new Error("No account context is available for this daemon URL.");
  const r = Je.endsWith("/") ? Je : `${Je}/`, n = new URL(e.replace(/^\/+/, ""), r);
  return n.searchParams.set("accountId", String(t)), n;
}
function Xy(e, t) {
  const r = (n) => br(`/${e}/${encodeURIComponent(n)}`).toString();
  for (const n of t) r[n] = (o) => br(`/${e}/${encodeURIComponent(o)}/${n}`).toString();
  return r;
}
var ew = {
  auth: { uploadAvatar: (e) => {
    const t = br("/auth/me/avatar");
    return t.searchParams.set("accountId", String(e)), t.toString();
  } },
  agents: { chat: Xy("agents/chat", [
    "stream",
    "steer",
    "continue",
    "abort"
  ]) },
  lasso: { transform: (e) => br("/lasso/transform", e).toString() }
}, tw = "lasso:transform", Bi = "__ASIDE_LASSO_ERROR__:";
async function rw(e) {
  if (e.name !== tw) return;
  let t = null;
  const r = () => {
    const active = t;
    t = null;
    active?.abort();
  };
  e.onDisconnect.addListener(r), e.onMessage.addListener((n) => {
    if (n.type === "lasso:transform:abort") {
      r();
      return;
    }
    if (n.type !== "lasso:transform:start") return;
    r();
    const owner = new AbortController();
    t = owner;
    nw(n.request, {
      signal: owner.signal,
      onChunk: (o) => {
        if (t === owner) e.postMessage({
          type: "lasso:transform:chunk",
          chunk: o
        });
      }
    }).then(() => {
      if (t !== owner) return;
      t = null;
      e.postMessage({ type: "lasso:transform:complete" });
    }).catch((o) => {
      if (t !== owner) return;
      t = null;
      o.name !== "AbortError" && e.postMessage({
        type: "lasso:transform:error",
        error: o instanceof Error ? o.message : "Failed to generate a response."
      });
    });
  });
}
async function nw(e, t) {
  const r = await G(), n = await ve(ew.lasso.transform(r), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(e),
    signal: t.signal
  });
  if (!n.ok || !n.body) {
    const c = await ow(n);
    throw new Error(c || "Failed to generate a response.");
  }
  const o = n.body.getReader(), i = new TextDecoder();
  let s = "unknown", a = "";
  for (; ; ) {
    const { done: c, value: u } = await o.read();
    if (c) break;
    if (a += i.decode(u, { stream: !0 }), s !== "error") {
      if (s === "unknown") {
        if (a.startsWith(Bi)) {
          s = "error";
          continue;
        }
        if (Bi.startsWith(a)) continue;
        s = "text";
      }
      t.onChunk(a), a = "";
    }
  }
  if (a += i.decode(), s === "error") throw new Error(a.slice(22) || "Failed to generate a response.");
  a && t.onChunk(a);
}
async function ow(e) {
  try {
    return await e.text();
  } catch {
    return "";
  }
}
var iw = (e) => e.replace(/\s+/g, " ").trim(), sw = (e) => {
  const t = e.selectionKind === "region" && e.elementSummary?.trim() || e.text, r = iw(t);
  return r ? r.length <= 72 ? r : `${r.slice(0, 69).trimEnd()}...` : e.selectionKind === "region" ? "Selected area" : "Selected text";
}, aw = (e, t) => ({
  id: `selection:${e}:${t.requestKey}`,
  type: "selection",
  text: t.text,
  name: sw(t),
  selectionKind: t.selectionKind,
  sourceKind: t.sourceKind,
  requestKey: t.requestKey,
  previewImage: t.previewImage,
  elementSummary: t.elementSummary,
  elements: t.elements
}), cw = () => {
  const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Set(), r = (n, o) => {
    const i = {
      type: "page-selection-context:event",
      tabId: n,
      selection: o
    };
    for (const s of t) s(i);
  };
  return {
    get: (n) => e.get(n) ?? null,
    subscribe: (n) => (t.add(n), () => {
      t.delete(n);
    }),
    set: (n, o) => {
      o ? e.set(n, o) : e.delete(n), r(n, o);
    },
    clear: (n) => {
      e.has(n) && (e.delete(n), r(n, null));
    }
  };
}, pt = cw(), Yr = /* @__PURE__ */ new Set(), Gi = !1;
function uw() {
  Gi || (pt.subscribe((e) => {
    for (const t of Yr) t.postMessage(e);
  }), chrome.runtime.onMessage.addListener((e, t, r) => {
    const n = e;
    if (n?.type?.startsWith("page-selection-context:"))
      switch (n.type) {
        case "page-selection-context:update": {
          const o = t.tab?.id;
          if (typeof o != "number") {
            r({ selection: null });
            return;
          }
          const i = n.selection ? aw(o, n.selection) : null;
          pt.set(o, i), r({ selection: i });
          return;
        }
        case "page-selection-context:get":
          r({ selection: pt.get(n.tabId) });
          return;
      }
  }), chrome.runtime.onConnect.addListener((e) => {
    e.name === "page-selection-context:subscribe" && (Yr.add(e), e.onDisconnect.addListener(() => {
      Yr.delete(e);
    }));
  }), chrome.tabs.onRemoved.addListener((e) => {
    pt.clear(e);
  }), chrome.tabs.onUpdated.addListener((e, t) => {
    (t.status === "loading" || typeof t.url == "string") && pt.clear(e);
  }), Gi = !0);
}
var Xr = "profile-metadata:daily", cr = "aside.profileMetadataSync.v1", lw = 6048e5, Ki = !1, mt;
async function Wi() {
  const { accountId: e, browserProfile: t } = await Xa(), r = await D.accounts.get.query({ accountId: e });
  if (!(!r || r.mode !== "cloud" || r.authStatus !== "active" || !r.userId))
    return `${t.profileId}:${e}:${r.userId}`;
}
async function er() {
  typeof chrome < "u" && chrome.storage?.local && await auxWorkerStorageLocalRemove(cr);
}
function dw(...args){return auxWorkerProduce("metadata-sync",()=>auxWorkerOriginalMetadataSync(...args))}
function auxWorkerOriginalMetadataSync() {
  if (mt) return mt;
  const e = (async () => {
    let t;
    try {
      t = await Wi();
    } catch {
      return;
    }
    const r = (await chrome.storage.local.get(cr))[cr], n = r && typeof r == "object" && typeof r.identity == "string" && typeof r.lastSucceededAt == "number" ? r : void 0;
    if (r !== void 0 && !n && await er(), !t) {
      n && await er();
      return;
    }
    if (n && n.identity !== t) await er();
    else if (n && Date.now() - n.lastSucceededAt < lw) return;
    try {
      const o = Number(t.split(":")[1]);
      if (await D.accounts.syncProfileMetadata.mutate({ accountId: o }), await Wi() !== t) {
        await er();
        return;
      }
      await auxWorkerStorageLocalSet({ [cr]: {
        identity: t,
        lastSucceededAt: Date.now()
      } });
    } catch {
    }
  })().finally(() => {
    mt === e && (mt = void 0);
  });
  return mt = e, e;
}
function fw() {
  Ki || (Ki = !0, chrome.alarms.onAlarm.addListener((e) => {
    e.name === Xr && dw();
  }), chrome.alarms.get(Xr).then((e) => {
    e || auxWorkerAlarmCreate(Xr, {
      delayInMinutes: 1,
      periodInMinutes: 1440
    });
  }).catch(() => {
  }));
}
var de = /* @__PURE__ */ new Map(), Vi = !1;
function hw() {
  Vi || (Vi = !0, chrome.runtime.onConnect.addListener((e) => {
    e.name === "translate-page-keep-alive" && e.onMessage.addListener(() => {
    });
  }), chrome.contextMenus.onClicked.addListener((e, t) => {
    if (typeof t?.id == "number") {
      if (e.menuItemId === "aux-translate-selection") {
        if (!e.selectionText?.trim()) return;
        chrome.tabs.sendMessage(t.id, {
          type: "translate:selection",
          targetLanguage: Bn(),
          selectionText: e.selectionText
        }).catch(() => {
        });
        return;
      }
      e.menuItemId === "aux-translate-page" && fc(t);
    }
  }), chrome.runtime.onMessage.addListener((e, t, r) => {
    const n = e;
    if (n?.type === "translate:toast-change-languages") {
      const { type: o, ...i } = n;
      gw(t.tab?.id, i);
      return;
    }
    if (n?.type === "translate:toast-close") {
      const o = t.tab?.id;
      if (typeof o == "number")
        return mw(o).finally(() => r()), !0;
    }
  }));
}
function dc(e) {
  Mr(e);
}
function pw(e, t) {
  const r = de.get(e);
  if (!r?.url) return;
  const n = new URL(r.url), o = new URL(t);
  n.searchParams.delete("_reload"), o.searchParams.delete("_reload"), n.href !== o.href && Mr(e);
}
function fc(...args){return auxWorkerPhysical("translate",()=>auxWorkerOriginalTranslate(...args))}
async function auxWorkerOriginalTranslate(e, t = Bn(), r) {
  const n = e.id;
  if (typeof n != "number" || de.has(n)) return;
  const o = {
    token: crypto.randomUUID(),
    url: e.url
  };
  de.set(n, o);
  try {
    await en(n, {
      status: "translating",
      targetLanguage: t,
      sourceLanguage: r
    });
    const i = await chrome.tabs.sendMessage(n, {
      type: "translate:page-start",
      token: o.token,
      targetLanguage: t,
      ...r ? { sourceLanguage: r } : {}
    });
    if (de.get(n) !== o) return;
    if (i.token !== o.token) throw new Error("The page returned a stale translation response.");
    if (i.errorMessage) throw new Error(i.errorMessage);
    de.delete(n), await en(n, {
      status: "translated",
      targetLanguage: t,
      sourceLanguage: r
    });
  } catch (i) {
    if (de.get(n) !== o) return;
    de.delete(n), console.error("[Translate] Failed to translate page.", {
      error: i,
      tabId: n
    }), await en(n, {
      status: "error",
      targetLanguage: t,
      sourceLanguage: r,
      errorMessage: i instanceof Error ? i.message : String(i)
    });
  }
}
async function mw(e) {
  await Mr(e), await Xn(e, { type: "translate:page-dismiss" });
}
async function Mr(e) {
  const t = de.get(e);
  t && (de.delete(e), await Xn(e, {
    type: "translate:page-cancel",
    token: t.token
  }));
}
async function gw(e, { targetLanguage: t, sourceLanguage: r }) {
  if (typeof e != "number" || r?.code === t.code) return;
  await Mr(e);
  const n = await chrome.tabs.get(e).catch(() => null);
  n && await fc(n, t, r);
}
async function en(e, t) {
  await Xn(e, {
    type: "translate:page-status",
    ...t
  });
}
async function Xn(e, t) {
  await chrome.tabs.sendMessage(e, t).catch(() => {
  });
}
var vw = /* @__PURE__ */ new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gclsrc",
  "fbclid",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "twclid",
  "li_fat_id",
  "_ga",
  "_gl",
  "_t",
  "_ts",
  "_nc"
]), yw = [
  "sun",
  "moon",
  "cloud",
  "zap",
  "heart",
  "flame",
  "star",
  "magic_wand",
  "thumbs_up",
  "diamond",
  "book",
  "magic_book",
  "hourglass",
  "clock",
  "smile",
  "slime",
  "lock",
  "map_pin",
  "pin",
  "tag",
  "flag",
  "shopping_bag",
  "suitcase",
  "banknote",
  "telescope",
  "trophy",
  "rocket",
  "ticket",
  "camera",
  "folder",
  "bookmark",
  "pencil",
  "write",
  "brush",
  "palette",
  "half_circle",
  "atom",
  "headphones",
  "bell",
  "email",
  "chart",
  "form_circle",
  "form_square",
  "form_diamond",
  "form_flower",
  "cursor",
  "console",
  "bubble"
], ww = Z(yw), bw = "https://dev-cloud.getaux.co";
function Sw(e, t) {
  const r = typeof e == "string" ? new URL(e, `${bw}/`) : e;
  return fetch(r, t);
}
var _w = p().max(300, "Use 300 characters or fewer.").trim(), Iw = "aux.tabsTidy.customPrompt.v2";
async function Ew() {
  const e = await chrome.storage.local.get(Iw);
  return _w.parse(e["aux.tabsTidy.customPrompt.v2"] ?? "");
}
var Aw = lg({
  groups: N(m({
    title: p(),
    icon: ww,
    tabIds: N(T().int().nonnegative())
  })),
  ungroupedTabIds: N(T().int().nonnegative())
}), Pw = m({ error: p() });
function Tw(e) {
  return {
    tabs: e.tabs.map((t) => ({
      tabId: t.tabId,
      windowId: t.windowId,
      title: t.title,
      url: t.url,
      hostname: t.hostname,
      pathname: t.pathname,
      description: t.tokens.join(", ")
    })),
    existingGroupTitles: e.existingGroupTitles?.length ? e.existingGroupTitles : void 0,
    customPrompt: e.customPrompt || void 0
  };
}
async function Ow(){throw Error("Use the reviewed profile-scoped Tidy Tabs action.")}
var He = 40, Rw = /* @__PURE__ */ new Set([
  "a",
  "an",
  "and",
  "app",
  "com",
  "docs",
  "for",
  "home",
  "html",
  "http",
  "https",
  "index",
  "net",
  "org",
  "page",
  "the",
  "www"
]), Cw = ["/", "!/"], kw = "Agent Tabs";
function Nw(e) {
  return e.url ?? e.pendingUrl ?? "";
}
function Mw(e) {
  try {
    const t = new URL(e);
    return t.protocol === "http:" || t.protocol === "https:";
  } catch {
    return !1;
  }
}
function hc(e) {
  return e.length <= 1 ? e || "/" : e.replace(/\/+$/, "") || "/";
}
function Dw(e) {
  const t = e.slice(1);
  return t ? Cw.some((r) => t.startsWith(r)) || t.includes("?") || t.includes("=") ? !0 : t.includes("/") : !1;
}
function $w(e) {
  try {
    const t = new URL(e);
    t.protocol = t.protocol.toLowerCase(), t.hostname = t.hostname.toLowerCase(), (t.protocol === "http:" && t.port === "80" || t.protocol === "https:" && t.port === "443") && (t.port = ""), t.pathname = hc(t.pathname);
    const r = [...t.searchParams.entries()].filter(([n]) => !vw.has(n.toLowerCase())).sort(([n, o], [i, s]) => n === i ? o.localeCompare(s) : n.localeCompare(i));
    t.search = "";
    for (const [n, o] of r) t.searchParams.append(n, o);
    return Dw(t.hash) || (t.hash = ""), `${t.protocol}//${t.host}${t.pathname}${t.search}${t.hash}`;
  } catch {
    return e.trim();
  }
}
function Sr(e, t) {
  return e.windowId !== t.windowId ? e.windowId - t.windowId : e.index !== t.index ? e.index - t.index : e.tabId - t.tabId;
}
function Lw(e, t, r) {
  if (e.active !== t.active) return Number(t.active) - Number(e.active);
  if (e.highlighted !== t.highlighted) return Number(t.highlighted) - Number(e.highlighted);
  if (e.audible !== t.audible) return Number(t.audible) - Number(e.audible);
  if (e.lastAccessed !== t.lastAccessed) return t.lastAccessed - e.lastAccessed;
  const n = e.windowId === r, o = t.windowId === r;
  return n !== o ? Number(o) - Number(n) : e.index !== t.index ? e.index - t.index : e.tabId - t.tabId;
}
function pc(e, t) {
  let r = e[0];
  for (const n of e.slice(1)) r && Lw(n, r, t) < 0 && (r = n);
  return r;
}
function Uw(e) {
  return e.toLowerCase().split(/[^a-z0-9]+/i).filter((t) => t.length >= 2 && !Rw.has(t));
}
function xw(e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of [
    e.title,
    ...e.hostname.split("."),
    ...e.pathname.split("/")
  ]) for (const n of Uw(r))
    if (t.add(n), t.size >= 24) return [...t];
  return [...t];
}
function It() {
  return globalThis.performance?.now?.() ?? Date.now();
}
async function ke(e, t, r) {
  const n = It(), o = await r();
  return e[t] = Math.round(It() - n), o;
}
function An(e) {
  const t = e.toLowerCase().split(".").filter(Boolean);
  return t.length <= 2 ? t.join(".") : t.slice(-2).join(".");
}
function ur(e) {
  return e.split("/").find(Boolean) ?? "";
}
function zw(e, t) {
  if (e.length === 0 || t.length === 0) return 0;
  const r = e.length <= t.length ? e : t, n = new Set(r === e ? t : e);
  let o = 0;
  for (const i of r)
    n.has(i) && (o += 1);
  return o;
}
function Fw(e, t) {
  return e.hostname === t.hostname || An(e.hostname) === An(t.hostname) && ur(e.pathname) !== "" && ur(e.pathname) === ur(t.pathname) ? !0 : zw(e.tokens, t.tokens) >= 2;
}
function jw(e) {
  if (e.length <= He) return [e];
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const o = `${An(n.hostname)}:${ur(n.pathname)}`, i = t.get(o);
    if (i) {
      i.push(n);
      continue;
    }
    t.set(o, [n]);
  }
  const r = [];
  for (const n of t.values()) {
    if (n.length <= He) {
      r.push(n);
      continue;
    }
    for (let o = 0; o < n.length; o += He) r.push(n.slice(o, o + He));
  }
  return r;
}
function qw(e) {
  if (e.length <= He) return e.length === 0 ? [] : [e];
  const t = /* @__PURE__ */ new Set(), r = [];
  for (let s = 0; s < e.length; s += 1) {
    if (t.has(s)) continue;
    const a = [s], c = [];
    for (t.add(s); a.length > 0; ) {
      const u = e[a.shift()];
      c.push(u);
      for (let l = 0; l < e.length; l += 1)
        t.has(l) || !Fw(u, e[l]) || (t.add(l), a.push(l));
    }
    r.push(c);
  }
  const n = r.flatMap((s) => jw(s.sort((a, c) => a.tabId - c.tabId))), [o, i] = Sv(n, (s) => s.length === 1);
  return [...i, ...wv(o.flat(), He)];
}
async function Zw(e = chrome) {
  const [t, r] = await Promise.all([e.tabs.query({ lastFocusedWindow: !0 }), e.windows.getAll({
    populate: !1,
    windowTypes: ["normal"]
  })]), n = r.flatMap((s) => s.type === "normal" && typeof s.id == "number" ? [s.id] : []), o = new Set(n), i = [];
  for (const s of t) {
    if (typeof s.id != "number" || typeof s.windowId != "number" || typeof s.index != "number" || !o.has(s.windowId) || s.pinned || (s.groupId ?? -1) !== -1) continue;
    const a = Nw(s);
    if (!Mw(a)) continue;
    const c = new URL(a);
    i.push({
      tabId: s.id,
      windowId: s.windowId,
      index: s.index,
      title: s.title?.trim() || c.hostname || a,
      url: a,
      hostname: c.hostname.toLowerCase(),
      pathname: hc(c.pathname),
      active: !!s.active,
      highlighted: !!s.highlighted,
      audible: !!s.audible,
      lastAccessed: typeof s.lastAccessed == "number" ? s.lastAccessed : 0
    });
  }
  return {
    tabs: i.sort(Sr),
    normalWindowIds: n
  };
}
function mc(e, t) {
  const r = e.map((i) => ({
    tab: i,
    fingerprint: $w(i.url)
  })), n = new Set(r.filter(({ tab: i, fingerprint: s }) => URL.parse(i.url)?.hash && !s.includes("#")).map(({ fingerprint: i }) => i)), o = Object.values(bv(r, ({ tab: i, fingerprint: s }) => n.has(s) ? `${s}
${i.title}` : s)).map((i) => {
    const s = i.map(({ tab: a }) => a);
    return {
      survivor: pc(s, t),
      copies: s
    };
  });
  return {
    survivors: o.map(({ survivor: i }) => i).sort(Sr),
    duplicateTabIds: o.flatMap(({ survivor: i, copies: s }) => s.filter((a) => a !== i).map((a) => a.tabId)),
    duplicateSets: o
  };
}
function Bw(e, t, r) {
  const n = new Set(t), o = [], i = [];
  for (const s of e)
    if (n.has(s.tabId)) {
      if (s.windowId === r) {
        i.push(s.tabId);
        continue;
      }
      o.push(s.tabId);
    }
  return {
    removeBeforeApplyTabIds: o,
    removeAfterApplyTabIds: i
  };
}
async function Gw(e, t = chrome) {
  const r = e.tabs[0]?.windowId;
  if (r !== void 0 && e.tabs.every((i) => i.windowId === r)) return r;
  try {
    const i = await t.windows.getLastFocused({ populate: !1 });
    if (i.type === "normal" && typeof i.id == "number") return i.id;
  } catch {
  }
  const { survivors: n } = mc(e.tabs), o = /* @__PURE__ */ new Map();
  for (const i of n) o.set(i.windowId, (o.get(i.windowId) ?? 0) + 1);
  return Array.from(o.entries()).toSorted((i, s) => i[1] !== s[1] ? s[1] - i[1] : i[0] - s[0]).at(0)?.[0] ?? e.normalWindowIds.toSorted((i, s) => i - s)[0];
}
function Kw(e) {
  return { tabs: e.map((t) => ({
    tabId: t.tabId,
    windowId: t.windowId,
    title: t.title,
    url: t.url,
    hostname: t.hostname,
    pathname: t.pathname,
    tokens: xw(t)
  })) };
}
async function Ww(e, t) {
  const r = Kw(e).tabs, n = qw(r), o = /* @__PURE__ */ new Map(), i = [];
  for (const s of n) {
    if (s.length < 2) {
      i.push(...s.map((c) => c.tabId));
      continue;
    }
    const a = await t({
      tabs: s,
      existingGroupTitles: [...o.values()].map((c) => c.title)
    }).catch(() => ({
      groups: [],
      ungroupedTabIds: s.map((c) => c.tabId)
    }));
    for (const c of a.groups) {
      const u = c.title.toLowerCase(), l = o.get(u);
      if (l) {
        l.tabIds.push(...c.tabIds);
        continue;
      }
      o.set(u, c);
    }
    i.push(...a.ungroupedTabIds);
  }
  return {
    plan: {
      groups: [...o.values()],
      ungroupedTabIds: i
    },
    batchCount: n.length
  };
}
function Vw(e, t) {
  const r = new Map(t.map((s) => [s.tabId, s])), n = /* @__PURE__ */ new Set(), o = [];
  for (const s of e.groups) {
    const a = [...new Set(s.tabIds)].filter((c) => r.has(c) && !n.has(c));
    if (a.length >= 2) {
      for (const c of a) n.add(c);
      o.push({
        title: s.title,
        icon: s.icon,
        tabIds: a
      });
    }
  }
  const i = e.ungroupedTabIds.filter((s) => !r.has(s) || n.has(s) ? !1 : (n.add(s), !0));
  for (const s of t) n.has(s.tabId) || i.push(s.tabId);
  return {
    groups: o,
    ungroupedTabIds: i
  };
}
async function Hw(e, t) {
  if (!e.tabGroups.query) return 0;
  const r = await e.tabGroups.query({
    title: kw,
    windowId: t
  });
  if (r.length === 0) return 0;
  const n = await Promise.all(r.map(async (c) => {
    const u = (await e.tabs.query({ groupId: c.id })).flatMap((d) => typeof d.id == "number" && typeof d.index == "number" && typeof d.windowId == "number" && d.windowId === t ? [{
      id: d.id,
      index: d.index,
      windowId: d.windowId
    }] : []).sort((d, h) => d.index - h.index), l = u[0]?.index ?? Number.POSITIVE_INFINITY, f = u.map((d) => d.id);
    return u.length === 0 ? null : {
      firstIndex: l,
      tabIds: f
    };
  })), o = n.filter((c) => c !== null).sort((c, u) => c.firstIndex - u.firstIndex).flatMap((c) => c.tabIds);
  if (o.length === 0) return 0;
  const i = [], s = /* @__PURE__ */ new Set();
  for (const c of o)
    s.has(c) || (s.add(c), i.push(c));
  let a = 0;
  for (const [c, u] of i.entries()) {
    const l = n.find((d) => new Set(d?.tabIds).has(u)), f = l?.firstIndex;
    f !== void 0 && f + l.tabIds.indexOf(u) !== c && (a += 1);
  }
  return a === 0 ? 0 : (await e.tabs.move(i, {
    windowId: t,
    index: 0
  }), a);
}
async function Jw(e, t, r, n = chrome) {
  const o = Vw(r, e), i = new Map(e.map((f) => [f.tabId, f])), s = o.groups.map((f) => ({
    title: f.title,
    icon: f.icon,
    tabIds: f.tabIds.toSorted((d, h) => Sr(i.get(d), i.get(h)))
  })), a = o.ungroupedTabIds.toSorted((f, d) => Sr(i.get(f), i.get(d))), c = [...s.flatMap((f) => f.tabIds), ...a];
  let u = 0;
  for (const [f, d] of c.entries()) {
    const h = i.get(d);
    (h.windowId !== t || h.index !== f) && (u += 1);
  }
  c.length > 0 && await n.tabs.move(c, {
    windowId: t,
    index: 0
  });
  const l = [];
  for (const f of s) {
    if (f.tabIds.length < 2) continue;
    const d = await n.tabs.group({
      tabIds: f.tabIds,
      createProperties: { windowId: t }
    });
    if (typeof d == "number") {
      await n.tabGroups.update(d, { title: f.title });
      try {
        await n.tabGroups.update(d, { icon: f.icon });
      } catch {
      }
    }
    l.push(f);
  }
  return u += await Hw(n, t), {
    movedTabCount: u,
    groups: l
  };
}
function Qw() {
  const e = globalThis.chrome;
  if (!e) throw new Error("Chrome API is unavailable.");
  return {
    chromeApi: e,
    planner: async (t) => await Ow(t)
  };
}
function eligibleTidyTabs(snapshot) {
  if (!snapshot?.success || !snapshot.ownerGeneration || typeof snapshot.revision !== 'string')
    throw Error(snapshot?.error ?? 'Organization is unavailable');
  const tabs=(snapshot.tabs??[]).filter(tab=>!tab.pinned&&!tab.protected&&
    tab.spaceId===snapshot.spaceId&&/^https?:\/\//.test(tab.url??''));
  if(tabs.length>128) throw Error('Choose a Space with 128 or fewer unpinned tabs to tidy.');
  if(new Set(tabs.map(tab=>tab.id)).size!==tabs.length) throw Error('Duplicate tab identities');
  return tabs;
}
function validateTidyPlan(plan,tabs) {
  if(!plan||!Array.isArray(plan.groups)||plan.groups.length>32) throw Error('Invalid tab organization proposal');
  const allowed=new Set(tabs.map(tab=>tab.id)),seen=new Set;
  return {groups:plan.groups.map(group=>{
    if(!group||typeof group.title!=='string'||!group.title.trim()||group.title.length>64||
       !Array.isArray(group.tabIds)||group.tabIds.length>128) throw Error('Invalid proposed folder');
    return {title:group.title.trim(),tabIds:group.tabIds.map(id=>{
      if(typeof id!=='string'||!allowed.has(id)||seen.has(id)) throw Error('Proposal contains unknown or duplicate tabs');
      seen.add(id);return id;
    })};
  }).filter(group=>group.tabIds.length)};
}
function createTidyProposal(snapshot,plan,uuid) {
  const tabs=eligibleTidyTabs(snapshot),checked=validateTidyPlan(plan,tabs),byId=new Map(tabs.map(tab=>[tab.id,tab]));
  const createFolders=[],moves=[],summaryRows=[];
  for(const group of checked.groups) {
    const folderId=uuid();createFolders.push({id:folderId,title:group.title,parentId:'',spaceId:snapshot.spaceId});
    for(const [index,tabId] of group.tabIds.entries()) {
      const tab=byId.get(tabId);moves.push({tabId,folderId,spaceId:snapshot.spaceId,index});
      summaryRows.push({id:tabId,title:tab.title||tab.url,folderTitle:group.title});
    }
  }
  return {proposalId:uuid(),operationId:uuid(),ownerGeneration:snapshot.ownerGeneration,
    scopeToken:snapshot.scopeToken,scope:snapshot.scope,expectedRevision:snapshot.revision,spaceId:snapshot.spaceId,windowId:snapshot.windowId,accountId:snapshot.accountId,
    createFolders,moves,summaryRows};
}
async function prepareTidyProposal(deps) {
  const snapshot=await deps.snapshot();assertNativeTidyScope(snapshot);const tabs=eligibleTidyTabs(snapshot);
  if(!Number.isSafeInteger(snapshot.windowId)) throw Error('The originating browser window is unavailable.');
  if(!Number.isSafeInteger(snapshot.accountId)||snapshot.accountId<0) throw Error('Connect this profile to an AI provider before using Tidy Tabs.');
  if(tabs.length<2) throw Error(snapshot.scope==='selected-tabs'?'Select at least two eligible unpinned tabs in this Space to tidy.':'Open at least two unpinned tabs in this Space to tidy.');
  const account=await deps.account();
  if(account.accountId!==snapshot.accountId||!account.browserProfile?.profileId) throw Error('Profile changed; try Tidy Tabs again.');
  const profileId=account.browserProfile.profileId;
  const requestId=deps.uuid();let expired=false,checking=false;
  const same=next=>next?.success&&next.ownerGeneration===snapshot.ownerGeneration&&next.revision===snapshot.revision&&next.spaceId===snapshot.spaceId&&next.windowId===snapshot.windowId&&next.accountId===snapshot.accountId&&next.scopeToken===snapshot.scopeToken&&next.scope===snapshot.scope;
  const timer=deps.interval(async()=>{
    if(checking)return;checking=true;
    try{if(!same(await deps.snapshot())){expired=true;await deps.cancel({accountId:snapshot.accountId,profileId,requestId})}}
    catch{expired=true;await deps.cancel({accountId:snapshot.accountId,profileId,requestId}).catch(()=>{})}
    finally{checking=false}
  },1000);
  try {
    const customPrompt=await deps.customPrompt();
    if(expired||!same(await deps.snapshot()))throw Error('Tabs changed; try Tidy Tabs again.');
    const plan=await deps.plan({accountId:snapshot.accountId,profileId,requestId,customPrompt,
      tabs:tabs.map(tab=>({id:tab.id,title:(tab.title??'').slice(0,512),origin:new URL(tab.url).origin}))});
    const currentAccount=await deps.account();
    if(expired||!same(await deps.snapshot())||currentAccount.accountId!==snapshot.accountId||currentAccount.browserProfile?.profileId!==profileId)
      throw Error('Tabs or profile changed; no organization was applied.');
    const proposal=createTidyProposal(snapshot,plan,deps.uuid);
    if(!proposal.moves.length)throw Error('No organization changes were suggested.');
    const shown=await deps.show({proposal});
    if(!shown?.success)throw Error(shown?.error??'Could not open the organization review.');
    return {success:true,phase:'review',proposalId:proposal.proposalId};
  } finally {deps.clearInterval(timer)}
}
let auxTidyInFlight=null;async function Yw(e={}){if(typeof e.scopeToken!=="string"||!e.scopeToken)throw Error("Choose a Tidy scope first.");if(auxTidyInFlight)throw Error("Another Tidy request is still finishing; try again shortly.");auxTidyInFlight=prepareTidyProposal({snapshot:()=>chrome.auxBrowserPreferences.getOrganizationSnapshot({scopeToken:e.scopeToken}),account:()=>Xa(),uuid:()=>crypto.randomUUID(),customPrompt:()=>Ew(),plan:input=>D.models.productivityPlan.mutate(input),cancel:input=>D.models.productivityCancel.mutate(input),show:input=>chrome.auxBrowserPreferences.showOrganizationProposal(input),interval:setInterval,clearInterval}).finally(()=>{auxTidyInFlight=null});return auxTidyInFlight}
var Xw = {
  extensionId: $a,
  playerDocumentPath: "tab-preview-player.html",
  readyMessageType: "aux.tab-preview.ready",
  renderStateMessageType: "aux.tab-preview.render-state",
  streamPort: "aux.tab-preview.stream",
  visibilityMessageType: "aux.tab-preview.visibility"
}, Hb = m({
  width: T().int().positive(),
  height: T().int().positive()
}), Jb = m({
  parentOrigin: p().min(1),
  targetId: p().min(1),
  title: p().default("Browser tab preview"),
  analyzeTopTone: $().default(!1)
}), _r = /* @__PURE__ */ new Set(), X = /* @__PURE__ */ new Map();
async function eb(e) {
  const t = (await chrome.debugger.getTargets()).find((o) => o.id === e && typeof o.tabId == "number");
  if (!t || typeof t.tabId != "number") throw new Error(`No Chrome tab found for target ${e}`);
  const r = await chrome.tabs.get(t.tabId), n = typeof r.width == "number" && typeof r.height == "number" && r.width > 0 && r.height > 0 ? {
    width: Math.round(r.width),
    height: Math.round(r.height)
  } : void 0;
  return {
    tabId: t.tabId,
    viewport: n
  };
}
function Ke(e, t) {
  e.targetId && X.get(e.targetId)?.subscriber === e && X.delete(e.targetId);
  try {
    e.port.postMessage({
      type: "fallback",
      reason: t
    });
  } catch {
  }
}
function We(...args){return auxWorkerPhysical("tab-capture",()=>auxWorkerOriginalTabCapture(...args))}
async function auxWorkerOriginalTabCapture(e, t) {
  const r = [..._r].filter((c) => c.targetId === e).filter((c) => c.visible), n = X.get(e), o = n?.subscriber;
  if (!r.length) {
    o && Ke(o, "not-visible");
    return;
  }
  const i = t && r.includes(t) ? t : o && r.includes(o) ? o : r[0];
  for (const c of r) c !== i && Ke(c, "owned");
  o && !r.includes(o) && Ke(o, "owned");
  const s = o === i ? n : { subscriber: i };
  X.set(e, s);
  let a;
  try {
    a = await eb(e);
  } catch {
    if (X.get(e) !== s) return;
    for (const c of r) Ke(c, "no-tab");
    return;
  }
  if (!(X.get(e) !== s || n === s))
    try {
      const c = await chrome.tabCapture.getMediaStreamId({ targetTabId: a.tabId });
      if (X.get(e) !== s) return;
      i.port.postMessage({
        type: "stream-id",
        streamId: c,
        tabViewport: a.viewport
      });
    } catch {
      if (X.get(e) !== s) return;
      for (const c of r) Ke(c, "capture-failed");
    }
}
function eo() {
  for (const e of new Set([..._r].flatMap((t) => t.targetId ?? []))) We(e);
}
chrome.runtime.onConnect.addListener((e) => {
  if (e.name !== Xw.streamPort) return;
  const t = {
    port: e,
    visible: !1
  };
  _r.add(t), e.onDisconnect.addListener(() => {
    _r.delete(t), t.targetId && X.get(t.targetId)?.subscriber === t && (X.delete(t.targetId), We(t.targetId));
  }), e.onMessage.addListener((r) => {
    if (r.type === "subscribe") {
      const n = t.targetId;
      n && n !== r.targetId && Ke(t, "not-visible"), t.targetId = r.targetId, n && n !== r.targetId && We(n), We(r.targetId, t);
      return;
    }
    if (t.targetId) {
      if (r.type === "visibility") {
        t.visible = r.visible, We(t.targetId, r.visible ? t : void 0);
        return;
      }
      if (r.type === "retry") {
        const n = X.get(t.targetId)?.subscriber;
        if (!t.visible || n && n !== t) return;
        X.delete(t.targetId), We(t.targetId, t);
      }
    }
  });
});
chrome.tabs.onActivated.addListener(() => eo());
chrome.tabs.onRemoved.addListener(() => eo());
chrome.tabs.onUpdated.addListener((e, t) => {
  t.status === "complete" && eo();
});
var gc = "remix.js", vc = "aside-remix-gmail", yc = "aside-remix-slack", Pn = [vc, yc], wc = ["https://mail.google.com/*"], bc = ["https://app.slack.com/*"], tb = [{
  id: vc,
  matches: wc,
  allFrames: !0
}, {
  id: yc,
  matches: bc,
  allFrames: !1
}];
function rb() {
  return tb.map((e) => ({
    id: e.id,
    js: [gc],
    matches: [...e.matches],
    allFrames: e.allFrames,
    runAt: "document_idle",
    persistAcrossSessions: !0,
    world: "ISOLATED"
  }));
}
var Hi = Promise.resolve();
function Sc(e) {
  return auxWorkerPhysical("content-script-queue",()=>auxWorkerOriginalContentScripts(e));
}
function auxWorkerOriginalContentScripts(e) {
  const t = Hi.then(e);
  return Hi = t.catch(() => {
  }), t;
}
function _c(e, t) {
  return e.allFrames === t.allFrames && e.persistAcrossSessions !== !1 && e.runAt === t.runAt && e.js?.includes("remix.js") === !0 && e.matches?.length === t.matches?.length && (t.matches?.every((r) => e.matches?.includes(r)) ?? !1);
}
function Ic() {
  return new Map(rb().map((e) => [e.id, e]));
}
function nb() {
  return Sc(async () => {
    const e = await chrome.scripting.getRegisteredContentScripts({ ids: [...Pn] });
    if (e.length === 0) return;
    const t = Ic();
    e.filter((r) => {
      const n = t.get(r.id);
      return r.matches?.includes("<all_urls>") || !n || !_c(r, n);
    }).length !== 0 && await chrome.scripting.updateContentScripts([...t.values()]);
  });
}
function Ec(e) {
  return Sc(async () => {
    const t = await chrome.scripting.getRegisteredContentScripts({ ids: [...Pn] }), r = new Map(t.map((s) => [s.id, s]));
    if (!e) {
      t.length > 0 && await chrome.scripting.unregisterContentScripts({ ids: [...Pn] });
      return;
    }
    const n = Ic(), o = [], i = [];
    for (const s of n.values()) {
      const a = r.get(s.id);
      if (!a) {
        o.push(s);
        continue;
      }
      _c(a, s) || i.push(s);
    }
    o.length > 0 && await chrome.scripting.registerContentScripts(o), i.length > 0 && await chrome.scripting.updateContentScripts(i);
  });
}
async function Ji(e, t) {
  await chrome.scripting.executeScript({
    files: [gc],
    target: {
      tabId: e,
      allFrames: t
    },
    world: "ISOLATED"
  }).catch(() => {
  });
}
async function ob() {
  const [e, t] = await Promise.all([chrome.tabs.query({ url: [...wc] }), chrome.tabs.query({ url: [...bc] })]);
  await Promise.all([...e.flatMap((r) => typeof r.id == "number" ? [Ji(r.id, !0)] : []), ...t.flatMap((r) => typeof r.id == "number" ? [Ji(r.id, !1)] : [])]);
}
var ib = "aside.remix.v1", sb = /* @__PURE__ */ new Map(), ab = (e) => `${ib}:${e}`;
async function to(e, t) {
  const r = ab(e);
  try {
    typeof chrome < "u" && chrome.storage?.local && await auxWorkerStorageLocalSet({ [r]: { enabled: t } });
  } finally {
    sb.get(r)?.forEach((n) => n(t));
  }
}
var cb = "aside.remix.pending.v1", ub = (e, t) => `${cb}:${e}:${t}`;
function lb(e) {
  const t = e.trim().toLowerCase();
  if (!t || t === "<all_urls>" || t.includes("*")) return null;
  try {
    const r = t.includes("://") ? new URL(t) : new URL(`https://${t}`);
    return r.protocol !== "https:" || !r.hostname || r.hostname.includes("*") ? null : [`https://${r.hostname}/*`];
  } catch {
    return null;
  }
}
function db() {
  return { prompt: (e) => chrome.runtime.sendMessage({
    type: "remix:prompt",
    args: e
  }) };
}
var Ac = "aside-remix-user-", Qi = Promise.resolve(), Yi = !1;
function fb(e) {
  return auxWorkerPhysical("user-script-queue",()=>auxWorkerOriginalUserScripts(e));
}
function auxWorkerOriginalUserScripts(e) {
  const t = Qi.then(e);
  return Qi = t.catch(() => {
  }), t;
}
function hb() {
  return chrome.userScripts;
}
function pb(e) {
  return `${Ac}${e}`;
}
function mb(e) {
  return `const aside = (${db.toString()})();
${e}`;
}
function Pc(e, t) {
  return fb(async () => {
    const r = hb();
    if (r)
      try {
        const n = (await r.getScripts()).filter((s) => s.id.startsWith(Ac));
        if (n.length > 0 && await r.unregister({ ids: n.map((s) => s.id) }), !e) return;
        const o = [], i = /* @__PURE__ */ new Set();
        for (const s of t) {
          const a = lb(s.host);
          if (!a) continue;
          const c = pb(a[0].slice(8, -2));
          i.has(c) || (i.add(c), o.push({
            id: c,
            matches: a,
            js: [{ code: mb(s.source) }],
            allFrames: s.allFrames === !0,
            runAt: "document_idle",
            world: "USER_SCRIPT"
          }));
        }
        if (o.length === 0) return;
        !Yi && r.configureWorld && (await r.configureWorld({ messaging: !0 }), Yi = !0), await r.register(o);
      } catch (n) {
        console.error("[Remix] userScripts unavailable.", n);
      }
  });
}
async function gb() {
  const e = await G(), { remix: t } = await D.settings.getAll.query({ accountId: e });
  return await to(e, t.enabled), {
    ok: !0,
    enabled: t.enabled,
    accountId: e
  };
}
function vb(...args){return auxWorkerProduce("remix-prompt",()=>auxWorkerOriginalRemixPrompt(...args))}
async function auxWorkerOriginalRemixPrompt(e,t,r){
 const context=await prepareRemixContext(e,t,{extensionId:chrome.runtime.id,api:chrome.auxBrowserPreferences,
   generation:()=>JSON.stringify([Lt,_n]),account:()=>Xa(),route:()=>nc()});
 const {origin,accountId:s,route,targetId:l,attachments:d}=context,o=origin.tabId,i=origin.windowId,a=route.profileId,c=route.browserMode;
 const h=Date.now(),g=[...d.length>0?[{role:"user-message-metadata",attachments:d,timestamp:h-1}]:[],{role:"user",content:e.prompt,timestamp:h}];
 await context.assertCurrent();
 const v=await D.sessions.createAndPrompt.mutate({accountId:s,title:e.title,trigger:e.trigger??{type:"user",source:"remix"},activeTabTargetId:l,
   browserBinding:{profileId:a,browserMode:c,windowId:i,anchorTargetId:l},message:g});
 await context.assertCurrent();
 if(e.openSidepanel!==false){await r;await context.assertCurrent();await Vn(ub(s,l),v.id);await context.assertCurrent();await chrome.sidePanel.setOptions({tabId:o,path:`sidepanel.html#/u/${s}/sidepanel?sessionId=${v.id}`})}
 return{ok:true,sessionId:v.id};
}
function yb(e) {
  return e?.type === "remix:get-enabled" || e?.type === "remix:prompt" || e?.type === "remix:sync";
}
function wb(e) {
  const t = e.newValue;
  return !t || typeof t != "object" || typeof t.enabled != "boolean" ? null : t.enabled;
}
async function Tc(e, t) {
  await Ec(e), await Pc(e, t);
}
function bb(...args){return auxWorkerProduce("remix-init",()=>auxWorkerOriginalRemixInit(...args))}
async function auxWorkerOriginalRemixInit() {
  const e = await G(), { remix: t } = await D.settings.getAll.query({ accountId: e });
  await to(e, t.enabled), await Tc(t.enabled, t.scripts);
}
function Sb(...args){return auxWorkerProduce("remix-sync",()=>auxWorkerOriginalRemixSync(...args))}
async function auxWorkerOriginalRemixSync(e) {
  const t = await G(), { remix: r } = await D.settings.getAll.query({ accountId: t });
  return await to(t, e), await Tc(e, r.scripts), e && await ob(), { ok: !0 };
}
function _b() {
  const e = (t, r, n) => {
    if (!yb(t)) return;
    const o = (i) => ({
      ok: !1,
      error: i instanceof Error ? i.message : String(i)
    });
    switch (t.type) {
      case "remix:get-enabled":
        return gb().catch(o).then(n), !0;
      case "remix:prompt": {
        const i = r.tab, s = t.args.openSidepanel !== !1 && i?.id != null ? auxWorkerPhysical("remix-sidepanel-open",()=>chrome.sidePanel.open({tabId:i.id})) : Promise.resolve();
        s.catch(()=>{});return vb(t.args, r, s).catch(o).then(n), !0;
      }
      case "remix:sync":
        return Sb(t.enabled).catch(o).then(n), !0;
      default:
        return t;
    }
  };
  chrome.runtime.onMessage.addListener(e), chrome.runtime.onUserScriptMessage?.addListener(e), chrome.storage.onChanged.addListener((t, r) => {
    if (r === "local")
      for (const [n, o] of Object.entries(t)) {
        if (!n.startsWith("aside.remix.v1:")) continue;
        const i = wb(o);
        if (i !== null) {
          Ec(i), i || Pc(!1, []);
          return;
        }
      }
  }), nb().then(() => bb()).catch((t) => {
    console.error("[Remix] Failed to sync content script registration.", t);
  });
}
var Ib = "current-zoom-indicator:show", Eb = 0.01;
chrome.tabs.onZoomChange.addListener((e) => {
  (async () => {
    if (Math.abs(e.newZoomFactor - e.oldZoomFactor) < Eb) return;
    const t = await chrome.tabs.get(e.tabId).catch(() => null);
    t?.active && (t.url === "chrome://newtab/" || t.url?.startsWith(chrome.runtime.getURL("")) || await chrome.tabs.sendMessage(e.tabId, {
      type: Ib,
      zoomFactor: e.newZoomFactor
    }).catch(() => {
    }));
  })();
});
var Ab = /* @__PURE__ */ jc({}), Xi = 5e3, ae = /* @__PURE__ */ new Map(), ne = /* @__PURE__ */ new Map(), tn = !1, be, Ir;
Ey();
uw();
fw();
Ny();
Wg();
hw();
xg();
_b();
Dr();
chrome.windows?.getLastFocused?.().then((e) => {
  if (e.id != null && (Ir = e.id, !!e.focused))
    return chrome.tabs.query({
      active: !0,
      windowId: e.id
    }).then(([t]) => {
      t?.id != null && zt(t.id);
    });
}).catch(() => {
});
chrome.windows?.onFocusChanged?.addListener((e) => {
  e !== chrome.windows.WINDOW_ID_NONE && (Ir = e);
});
chrome.runtime.onConnect.addListener((e) => {
  Ut(), rw(e);
});
chrome.action.onClicked.addListener(async (e) => {
  e.windowId && await chrome.sidePanel.open({ windowId: e.windowId });
});
chrome.tabs.onCreated.addListener(() => {
  Ut();
});
chrome.tabs.onUpdated.addListener((e, t, r) => {
  (t.status === "complete" || t.url !== void 0) && Ut(), t.url !== void 0 && pw(e, t.url), r.active && xt(r.windowId) && (t.url !== void 0 || t.status === "complete") && ro(e);
});
chrome.tabs.onActivated.addListener((e) => {
  Ut(), xt(e.windowId) && (ro(e.tabId), zt(e.tabId));
});
chrome.tabs.onCreated.addListener((e) => {
  e.active && e.id != null && xt(e.windowId) && zt(e.id);
});
chrome.windows.onFocusChanged.addListener((e) => {
  if (e === chrome.windows.WINDOW_ID_NONE) {
    Oc();
    return;
  }
  chrome.tabs.query({
    active: !0,
    windowId: e
  }).then(([t]) => {
    t?.id != null && zt(t.id);
  }).catch(() => {
  });
});
chrome.tabs.onReplaced.addListener((e, t) => {
  dc(t), ae.delete(t), ne.delete(t), Ut();
});
chrome.tabs.onRemoved.addListener((e) => {
  dc(e), ne.delete(e), (async () => {
    const t = ae.get(e);
    if (ae.delete(e), !t) return;
    const r = await G(), n = await D.sessions.tabs.resolveByTarget.query({
      targetId: t,
      accountId: r
    });
    n && await D.sessions.tabs.remove.mutate({
      sessionId: n.sessionId,
      sessionTabId: n.sessionTabId,
      accountId: r
    });
  })().catch(() => {
    ae.delete(e);
  });
});
chrome.runtime.onMessageExternal.addListener((e, t, r) => {
  if (e?.type === "aux.notificationPermissionChanged") {
    const n = e;
    return (async () => {
      try {
        const o = await G();
        await D.inbox.syncNotificationPermission.mutate({
          accountId: o,
          origin: n.origin,
          permission: n.permission,
          source: n.source,
          timestamp: n.timestamp
        }), r({ success: !0 });
      } catch (o) {
        console.error("[Notifications] Failed to sync permission change:", o), r({
          success: !1,
          error: o instanceof Error ? o.message : String(o)
        });
      }
    })(), !0;
  }
  if (e?.type === "aux.inboxNotification") {
    const n = e;
    return (async () => {
      try {
        const o = await G(), i = n.site_url?.replace(/\/$/, ""), s = typeof n.notification_id == "string" && n.notification_id.trim() ? n.notification_id.trim() : void 0, a = typeof n.inbox_entry_id == "string" && n.inbox_entry_id.trim() ? n.inbox_entry_id.trim() : void 0, c = s, u = s && a ? `notification:${s}:entry:${a}` : void 0, l = {
          ...i && { origin: i },
          ...n.context_url && { contextUrl: n.context_url },
          ...s && { notificationId: s },
          ...a && { inboxEntryId: a }
        };
        await D.inbox.ingest.mutate({
          accountId: o,
          source: "web-push-notification",
          title: n.title ?? "",
          content: n.body ?? "",
          preview: n.body && n.body.length > 100 ? n.body.slice(0, 100) : void 0,
          externalEventId: u,
          threadKey: c,
          from: i ? {
            name: i,
            type: "service"
          } : void 0,
          metadata: l
        }), r({ success: !0 });
      } catch (o) {
        console.error("[Inbox] Failed to ingest web push notification:", o), r({
          success: !1,
          error: o instanceof Error ? o.message : String(o)
        });
      }
    })(), !0;
  }
  if (e?.type === "aux.verticalTabsTidy")
    return Yw({scopeToken:e.scopeToken}).then((n) => {
      r(n);
    }).catch((n) => {
      const o = {
        success: !1,
        error: n instanceof Error ? n.message : String(n)
      };
      r(o), ts(o);
    }), !0;
});
chrome.runtime.onMessage.addListener((e, t, r) => {
  if (e?.type === "extension-notification:clicked") {
    if (typeof e.clickPath != "string")
      return r({
        success: !1,
        error: "Notification click path is invalid."
      }), !1;
    const n = typeof e.windowId == "number" ? e.windowId : void 0;
    return ic(e.clickPath, n).then(() => r({ success: !0 })).catch((o) => r({
      success: !1,
      error: o instanceof Error ? o.message : String(o)
    })), !0;
  }
  if (e?.type === "daemon-auth:sign-challenge")
    return Ts(e.challenge).then((n) => r({
      ok: !0,
      signedChallenge: n
    })).catch((n) => r({
      ok: !1,
      error: n instanceof Error ? n.message : String(n)
    })), !0;
  if (e?.type === "lasso:get-account-id")
    return (async () => {
      try {
        r({
          ok: !0,
          accountId: await G()
        });
      } catch (n) {
        r({
          ok: !1,
          error: n instanceof Error ? n.message : String(n)
        });
      }
    })(), !0;
  if (e?.type === "lasso:get-settings")
    return (async () => {
      try {
        const n = await G(), { lasso: o } = await D.settings.getAll.query({ accountId: n });
        await Jy(n, o), r({
          ok: !0,
          accountId: n,
          settings: o
        });
      } catch (n) {
        r({
          ok: !1,
          error: n instanceof Error ? n.message : String(n)
        });
      }
    })(), !0;
});
var es;
function Ut() {
  clearTimeout(es), es = setTimeout(() => {
    Dr();
  }, 100);
}
function ro(e) {
  be = e, !tn && (tn = !0, Pb().catch((t) => {
    console.warn("[Background] Failed to sync active session tab.", { error: t instanceof Error ? t.message : String(t) });
  }).finally(() => {
    tn = !1, be !== void 0 && ro(be);
  }));
}
function Pb(...args){return auxWorkerPhysical("active-tab-sync",()=>auxWorkerOriginalActiveTabSync(...args))}
async function auxWorkerOriginalActiveTabSync() {
  for (; be !== void 0; ) {
    const e = be;
    be = void 0, await Ob(e);
  }
}
function xt(e) {
  return Ir == null || e === Ir;
}
async function Tb(e) {
  try {
    const t = await chrome.tabs.get(e);
    return be !== void 0 && be !== e ? !0 : !t.active || !xt(t.windowId);
  } catch {
    return !0;
  }
}
async function Dr() {
  const e = chrome.debugger?.getTargets;
  if (!e) return;
  const t = await e().catch(() => null);
  if (t) {
    ae.clear();
    for (const r of t)
      r.type !== "page" || !r.id || r.tabId == null || ae.set(r.tabId, r.id);
    for (const [r, n] of ne) {
      const o = ae.get(r);
      o !== void 0 && o !== n.targetId && ne.delete(r);
    }
  }
}
async function Ob(e) {
  await Dr();
  const t = ae.get(e);
  if (!t) return;
  const r = await G(), n = ne.get(e);
  if (!(n?.accountId === r && n.targetId === t && ("sessionId" in n || n.retryAfter > Date.now())))
    try {
      const o = await D.sessions.tabs.resolveByTarget.query({
        targetId: t,
        accountId: r
      });
      if (await Tb(e)) {
        ne.delete(e);
        return;
      }
      if (!o) {
        ne.set(e, {
          accountId: r,
          targetId: t,
          retryAfter: Date.now() + Xi
        });
        return;
      }
      await D.sessions.update.mutate({
        sessionId: o.sessionId,
        activeTabTargetId: t,
        accountId: r
      });
      for (const [i, s] of ne) "sessionId" in s && s.accountId === r && s.sessionId === o.sessionId && ne.delete(i);
      ne.set(e, {
        accountId: r,
        targetId: t,
        sessionId: o.sessionId
      });
    } catch (o) {
      throw ne.set(e, {
        accountId: r,
        targetId: t,
        retryAfter: Date.now() + Xi
      }), o;
    }
}
var Rb = 2e3, Et = null, no = 0;
function zt(e) {
  Oc();
  const t = {
    observedAt: Date.now(),
    sequence: no
  };
  Er(e, "activation", {
    ...t,
    dwelled: !1
  }), Et = setTimeout(() => {
    Et = null, Er(e, "activation", {
      ...t,
      dwelled: !0
    });
  }, Rb);
}
function Oc() {
  no += 1, Et && clearTimeout(Et), Et = null;
}
function Er(...args){return auxWorkerProduce("context-signal",()=>auxWorkerOriginalContextSignal(...args))}
async function auxWorkerOriginalContextSignal(e, t, r = {}) {
  try {
    const n = () => t === "activation" && r.sequence !== void 0 && r.sequence !== no;
    if (n()) return;
    const o = await chrome.tabs.get(e);
    if (n()) return;
    if (!(o.url && /^https?:\/\//.test(o.url) && !o.incognito)) {
      if (t === "activation" && r.dwelled !== !0) {
        const a = await G();
        if (n()) return;
        await D.contextAwareness.reportTabSignal.mutate({
          accountId: a,
          targetId: "unobservable",
          url: "",
          kind: "unobservable",
          observedAt: r.observedAt,
          sequence: r.sequence
        });
      }
      return;
    }
    let i = ae.get(e);
    if (!i) {
      if (await Dr(), n()) return;
      i = ae.get(e);
    }
    i ??= "unmapped";
    const s = await G();
    if (n()) return;
    await D.contextAwareness.reportTabSignal.mutate({
      accountId: s,
      targetId: i,
      url: o.url,
      kind: t,
      audible: r.audible,
      dwelled: r.dwelled,
      observedAt: r.observedAt,
      sequence: r.sequence
    });
  } catch {
  }
}
chrome.tabs.onUpdated.addListener((e, t, r) => {
  t.audible !== void 0 && Er(e, "media", { audible: t.audible }), t.url && r.active && xt(r.windowId) && zt(e);
});
auxWorkerAlarmCreate("report-audible-tabs", { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((e) => {
  e.name === "report-audible-tabs" && chrome.tabs.query({ audible: !0 }).then((t) => {
    for (const r of t) r.id != null && !r.incognito && Er(r.id, "media", { audible: !0 });
  }).catch(() => {
  });
});
async function ts(e) {
  try {
    const t = await G();
    await D.analytics.capture.mutate({
      accountId: t,
      event: "tabs.tidy",
      properties: {
        success: e.success,
        tabCount: e.candidateTabCount ?? null,
        plannedTabCount: e.plannedTabCount ?? null
      }
    });
  } catch (t) {
    console.warn("[Background] Failed to capture tabs tidy analytics.", { error: t instanceof Error ? t.message : String(t) });
  }
}
var Cb = Reflect.get(Ab, "default"), kb = globalThis.chrome, rn = [], Nb = {
  chrome: kb,
  onDispose(e) {
    return rn.push(e), () => {
      const t = rn.indexOf(e);
      t >= 0 && rn.splice(t, 1);
    };
  }
};
try {
  const e = Cb?.main?.(Nb);
  e && typeof e.then == "function" && (auxWorkerPhysical("background-main",()=>e),console.warn("[broquer] background main() should register listeners synchronously."));
} catch (e) {
  throw console.error("[broquer] background failed", e), e;
}

auxWorkerInstallInspector(()=>{
  if(typeof ServiceWorkerGlobalScope==="undefined"||typeof window!=="undefined")throw Error("Canonical MV3 worker context required");
  if([..._r].some(stream=>stream.targetId||stream.visible))throw Error("Tab capture subscribers are still active");
});
//# chunkId=ddda0258-b2d8-5731-95f2-6689ea8d2cfd
function assertNativeTidyScope(snapshot) {
  if(!snapshot?.success||typeof snapshot.scopeToken!=='string'||!snapshot.scopeToken||
     !['current-space','selected-tabs'].includes(snapshot.scope))
    throw Error(snapshot?.error??'Choose Current Space or Selected tabs from Tidy first.');
}

async function prepareRemixContext(args,sender,deps) {
  if(sender?.id!==deps.extensionId||sender.frameId!==0||
      typeof sender.documentId!=='string'||!sender.documentId||
      !Number.isInteger(sender.tab?.id)||!Number.isInteger(sender.tab?.windowId))
    throw Error('Remix must start from the current top-level page.');
  if(!args||typeof args!=='object'||!Array.isArray(args.attachments??[]))throw Error('Invalid Remix request.');
  const origin={tabId:sender.tab.id,windowId:sender.tab.windowId,documentId:sender.documentId};
  const attachments=[...args.attachments??[]],references=attachments.filter(item=>item?.type==='tab')
    .map(({targetId,url,documentCapability})=>({targetId,url,documentCapability}));
  if(references.length>63||references.some(item=>!item.targetId||!item.url||!item.documentCapability))
    throw Error('Select attached tabs again before using Remix.');
  const generation=deps.generation();
  // Invoke native capture synchronously, before awaited account/debugger work.
  // Native alone decides whether this worker has a real user gesture.
  const request=args.attachCurrentTab!==false
    ? deps.api.captureTabReferences({origin,references:[]})
    : deps.api.validateTabReferences({origin,references:[]});
  const initial=await request;
  if(!initial?.success||typeof initial.ownerGeneration!=='string'||
      typeof initial.targetId!=='string'||typeof initial.url!=='string')
    throw Error(initial?.error??'The originating Remix page is unavailable.');
  if(initial.url!==(sender.url||sender.tab.url)||generation!==deps.generation())
    throw Error('The originating Remix page or profile changed.');
  const account=await deps.account(),route=await deps.route();
  if(!Number.isSafeInteger(account.accountId)||!account.browserProfile?.profileId||
      route.accountId!==account.accountId||!route.profileId||generation!==deps.generation())
    throw Error('The originating Remix account changed.');
  const accountKey=value=>JSON.stringify([value.accountId,value.browserProfile?.profileId,
    value.browserProfile?.chromiumProfileId,value.browserProfile?.boundAccountId,
    value.browserProfile?.boundUserId,value.browserProfile?.profilePath]);
  const expectedAccount=accountKey(account),routeKey=value=>JSON.stringify([value.accountId,value.profileId,value.browserMode]);
  const expectedRoute=routeKey(route);
  if(args.attachCurrentTab!==false){
    const reference=initial.references?.[0];
    if(initial.references?.length!==1||reference.targetId!==initial.targetId||reference.url!==initial.url||!reference.documentCapability)
      throw Error('Could not capture the originating Remix page.');
    attachments.push({id:`tab:${initial.targetId}`,type:'tab',url:initial.url,
      name:sender.tab.title?.trim()||initial.url,targetId:initial.targetId,
      documentCapability:reference.documentCapability,faviconUrl:sender.tab.favIconUrl||undefined});
    references.push(reference);
  }
  const assertCurrent=async()=>{
    if(generation!==deps.generation()||accountKey(await deps.account())!==expectedAccount||
        routeKey(await deps.route())!==expectedRoute||generation!==deps.generation())
      throw Error('The originating Remix account changed.');
    const current=await deps.api.validateTabReferences({origin,ownerGeneration:initial.ownerGeneration,references});
    if(!current?.success||current.ownerGeneration!==initial.ownerGeneration||current.targetId!==initial.targetId||
        current.url!==initial.url||generation!==deps.generation())
      throw Error(current?.error??'The originating Remix page or attached context changed.');
  };
  await assertCurrent();
  return {origin,accountId:account.accountId,route,targetId:initial.targetId,attachments,assertCurrent};
}
