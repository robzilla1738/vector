//! Persistent service-worker isolate (one V8 isolate per registration).

use std::collections::HashMap;
use std::sync::mpsc::{self, Sender};
use std::time::Duration;

#[cfg_attr(not(feature = "v8"), allow(dead_code))]
enum SwCmd {
    Fetch {
        url: String,
        method: String,
        clients_json: String,
        reply: Sender<Option<(String, u16)>>,
    },
    Message {
        data: String,
        reply: Sender<bool>,
    },
    Activate {
        reply: Sender<bool>,
    },
}

/// A dedicated worker-thread isolate that keeps `onfetch` across requests.
pub(crate) struct SwRealm {
    tx: Sender<SwCmd>,
    /// `clients.claim()` ran during install/activate.
    pub claimed: bool,
    client_posts: std::sync::Arc<std::sync::Mutex<Vec<String>>>,
}

impl SwRealm {
    /// Starts the isolate and evaluates `script` once. `None` without `v8`.
    ///
    /// `activate` runs the `activate` listener at boot (first worker, or a
    /// worker that called `skipWaiting` during install). Waiting workers pass
    /// `false` and are promoted later via [`Self::activate`].
    pub(crate) fn spawn(
        script: String,
        imports: HashMap<String, String>,
        activate: bool,
    ) -> Option<Self> {
        #[cfg(feature = "v8")]
        {
            spawn_v8(script, imports, activate)
        }
        #[cfg(not(feature = "v8"))]
        {
            let _ = (script, imports, activate);
            None
        }
    }

    /// Runs the stored fetch listener against `url` / `method`.
    pub(crate) fn fetch(
        &self,
        url: &str,
        method: &str,
        clients_json: &str,
    ) -> Option<(String, u16)> {
        let (reply, rx) = mpsc::channel();
        self.tx
            .send(SwCmd::Fetch {
                url: url.to_owned(),
                method: method.to_owned(),
                clients_json: clients_json.to_owned(),
                reply,
            })
            .ok()?;
        rx.recv_timeout(Duration::from_millis(2000)).ok().flatten()
    }

    /// Delivers a `message` event. Returns whether `skipWaiting()` has been called.
    pub(crate) fn post_message(&self, data: &str) -> bool {
        let (reply, rx) = mpsc::channel();
        if self
            .tx
            .send(SwCmd::Message {
                data: data.to_owned(),
                reply,
            })
            .is_err()
        {
            return false;
        }
        rx.recv_timeout(Duration::from_millis(2000))
            .ok()
            .unwrap_or(false)
    }

    /// Runs a deferred `activate` listener (waiting → active).
    pub(crate) fn activate(&self) -> bool {
        let (reply, rx) = mpsc::channel();
        if self.tx.send(SwCmd::Activate { reply }).is_err() {
            return false;
        }
        rx.recv_timeout(Duration::from_millis(2000))
            .ok()
            .unwrap_or(false)
    }

    /// `Client.postMessage` payloads queued during the last fetch/message.
    pub(crate) fn take_client_posts(&self) -> Vec<String> {
        self.client_posts
            .lock()
            .map(|mut g| std::mem::take(&mut *g))
            .unwrap_or_default()
    }
}

#[cfg(feature = "v8")]
fn spawn_v8(script: String, imports: HashMap<String, String>, activate: bool) -> Option<SwRealm> {
    use ve_script::{JsValue, JsVm, V8Vm};

    let (tx, rx) = mpsc::channel::<SwCmd>();
    let (ready_tx, ready_rx) = mpsc::channel::<bool>();
    let client_posts = std::sync::Arc::new(std::sync::Mutex::new(Vec::new()));
    let posts_thread = client_posts.clone();
    std::thread::Builder::new()
        .name("ve-sw-realm".into())
        .spawn(move || {
            let Some(mut vm) = V8Vm::new().ok() else {
                let _ = ready_tx.send(false);
                return;
            };
            let src_lit = match serde_json::to_string(&script) {
                Ok(s) => s,
                Err(_) => {
                    let _ = ready_tx.send(false);
                    return;
                }
            };
            let imports_lit = match serde_json::to_string(&imports) {
                Ok(s) => s,
                Err(_) => {
                    let _ = ready_tx.send(false);
                    return;
                }
            };
            let activate_lit = if activate { "true" } else { "false" };
            let boot = format!(
                "(function(){{\
                   var __installFetch = null;\
                   var __claimed = false;\
                   var __skip = false;\
                   var __activated = false;\
                   var __messageFns = [];\
                   var __imports = {imports_lit};\
                   function Response(body, init) {{\
                     this.body = body;\
                     this.status = (init && init.status) || 200;\
                   }}\
                   Response.redirect = function (url, status) {{\
                     return {{ body: String(url), status: status || 302 }};\
                   }};\
                   function importScripts() {{\
                     for (var i = 0; i < arguments.length; i++) {{\
                       var href = String(arguments[i]);\
                       var src = __imports[href];\
                       if (src == null) {{\
                         var parts = href.split('/');\
                         src = __imports[parts[parts.length - 1]];\
                       }}\
                       if (typeof src === 'string') eval(src);\
                     }}\
                   }}\
                   function ExtendableEvent() {{ this.waitUntil = function () {{}}; }}\
                   function resolved(value) {{\
                     return {{\
                       then: function (onFulfilled) {{\
                         try {{\
                           var next = onFulfilled ? onFulfilled(value) : value;\
                           if (next && typeof next.then === 'function') return next;\
                           return resolved(next);\
                         }} catch (e) {{\
                           return {{ then: function (_, rej) {{ if (rej) rej(e); return this; }} }};\
                         }}\
                       }}\
                     }};\
                   }}\
                   function matchAll(opts) {{\
                     var all = globalThis.__veClients || [];\
                     var include = opts && opts.includeUncontrolled;\
                     var out = [];\
                     for (var i = 0; i < all.length; i++) {{\
                       if (include || all[i].controlled) {{\
                         out.push({{\
                           url: all[i].url,\
                           type: all[i].type || 'window',\
                           id: all[i].id || String(i),\
                           frameType: all[i].frameType || 'top-level',\
                           postMessage: function (msg) {{\
                             globalThis.__veClientPosts = globalThis.__veClientPosts || [];\
                             globalThis.__veClientPosts.push(JSON.stringify(msg == null ? null : msg));\
                           }}\
                         }});\
                       }}\
                     }}\
                     return resolved(out);\
                   }}\
                   var installFn = null, activateFn = null;\
                   var self = {{\
                     addEventListener: function (t, fn) {{\
                       if (t === 'fetch') __installFetch = fn;\
                       if (t === 'install') installFn = fn;\
                       if (t === 'activate') activateFn = fn;\
                       if (t === 'message') __messageFns.push(fn);\
                     }},\
                     skipWaiting: function () {{ __skip = true; return resolved(undefined); }},\
                     importScripts: importScripts,\
                     clients: {{\
                       claim: function () {{ __claimed = true; return resolved(undefined); }},\
                       matchAll: matchAll\
                     }}\
                   }};\
                   self.importScripts = importScripts;\
                   self.clients = self.clients;\
                   eval({src_lit});\
                   if (typeof onfetch === 'function') __installFetch = onfetch;\
                   if (typeof oninstall === 'function') installFn = oninstall;\
                   if (typeof onactivate === 'function') activateFn = onactivate;\
                   if (typeof onmessage === 'function') __messageFns.push(onmessage);\
                   if (typeof installFn === 'function') installFn(new ExtendableEvent());\
                   if ({activate_lit} && typeof activateFn === 'function') {{\
                     __activated = true;\
                     activateFn(new ExtendableEvent());\
                   }}\
                   globalThis.__veSwFetch = __installFetch;\
                   globalThis.__veActivateFn = activateFn;\
                   globalThis.__veMessageFns = __messageFns;\
                   globalThis.__veSkip = function () {{ return __skip; }};\
                   globalThis.__veClaimed = function () {{ return __claimed; }};\
                   globalThis.__veRunActivate = function () {{\
                     if (!__activated && typeof activateFn === 'function') {{\
                       __activated = true;\
                       activateFn(new ExtendableEvent());\
                     }}\
                     return __claimed;\
                   }};\
                   globalThis.Response = Response;\
                   return __claimed;\
                 }})()"
            );
            let claimed = match vm.eval(&boot, "vector:sw-realm") {
                Ok(JsValue::Bool(b)) => b,
                Ok(JsValue::Number(n)) => n != 0.0,
                _ => {
                    let _ = ready_tx.send(false);
                    return;
                }
            };
            let _ = ready_tx.send(claimed);
            while let Ok(cmd) = rx.recv() {
                match cmd {
                    SwCmd::Fetch {
                        url,
                        method,
                        clients_json,
                        reply,
                    } => {
                        let url_lit = match serde_json::to_string(&url) {
                            Ok(s) => s,
                            Err(_) => {
                                let _ = reply.send(None);
                                continue;
                            }
                        };
                        let method_lit = match serde_json::to_string(&method) {
                            Ok(s) => s,
                            Err(_) => {
                                let _ = reply.send(None);
                                continue;
                            }
                        };
                        let clients_lit = match serde_json::to_string(&clients_json) {
                            Ok(s) => s,
                            Err(_) => {
                                let _ = reply.send(None);
                                continue;
                            }
                        };
                        let js = format!(
                            "(function(){{\
                               globalThis.__veClients = JSON.parse({clients_lit});\
                               globalThis.__veSwBody = null;\
                               globalThis.__veSwStatus = 200;\
                               var __used = false;\
                               function FetchEvent() {{\
                                 this.request = {{ url: {url_lit}, method: {method_lit} }};\
                                 this.respondWith = function (r) {{\
                                   __used = true;\
                                   function take(res) {{\
                                     globalThis.__veSwBody = res && res.body != null ? String(res.body) : String(res);\
                                     globalThis.__veSwStatus = (res && res.status) || 200;\
                                   }}\
                                   if (r && typeof r.then === 'function') r.then(take);\
                                   else take(r);\
                                 }};\
                               }}\
                               var fn = globalThis.__veSwFetch;\
                               if (typeof fn === 'function') fn(new FetchEvent());\
                               return __used;\
                             }})()"
                        );
                        let used = matches!(
                            vm.eval(&js, "vector:sw-fetch"),
                            Ok(JsValue::Bool(true) | JsValue::Number(_))
                        );
                        let _ = vm.run_pending_jobs();
                        if let Ok(JsValue::String(posts)) = vm.eval(
                            "(function(){ var p = globalThis.__veClientPosts || []; globalThis.__veClientPosts = []; return JSON.stringify(p); })()",
                            "vector:sw-client-posts",
                        ) {
                            if let Ok(list) = serde_json::from_str::<Vec<String>>(&posts)
                                && let Ok(mut g) = posts_thread.lock()
                            {
                                g.extend(list);
                            }
                        }
                        let out = if !used {
                            None
                        } else {
                            match vm.eval(
                                "(function(){ return JSON.stringify({ body: globalThis.__veSwBody, status: globalThis.__veSwStatus }); })()",
                                "vector:sw-fetch-read",
                            ) {
                                Ok(JsValue::String(s)) => serde_json::from_str::<serde_json::Value>(&s)
                                    .ok()
                                    .and_then(|v| {
                                        Some((
                                            v.get("body")?.as_str()?.to_owned(),
                                            u16::try_from(v.get("status")?.as_u64()?).ok()?,
                                        ))
                                    }),
                                _ => None,
                            }
                        };
                        let _ = reply.send(out);
                    }
                    SwCmd::Message { data, reply } => {
                        let data_lit = match serde_json::to_string(&data) {
                            Ok(s) => s,
                            Err(_) => {
                                let _ = reply.send(false);
                                continue;
                            }
                        };
                        let js = format!(
                            "(function(){{\
                               var ev = {{ data: JSON.parse({data_lit}), type: 'message' }};\
                               var fns = globalThis.__veMessageFns || [];\
                               for (var i = 0; i < fns.length; i++) {{\
                                 try {{ fns[i](ev); }} catch (e) {{}}\
                               }}\
                               return !!(globalThis.__veSkip && globalThis.__veSkip());\
                             }})()"
                        );
                        let skipped =
                            matches!(vm.eval(&js, "vector:sw-message"), Ok(JsValue::Bool(true)));
                        let _ = vm.run_pending_jobs();
                        let _ = reply.send(skipped);
                    }
                    SwCmd::Activate { reply } => {
                        let claimed = match vm.eval(
                            "(function(){ return globalThis.__veRunActivate(); })()",
                            "vector:sw-activate",
                        ) {
                            Ok(JsValue::Bool(b)) => b,
                            Ok(JsValue::Number(n)) => n != 0.0,
                            _ => false,
                        };
                        let _ = reply.send(claimed);
                    }
                }
            }
        })
        .ok()?;
    let claimed = ready_rx.recv_timeout(Duration::from_millis(2000)).ok()?;
    Some(SwRealm {
        tx,
        claimed,
        client_posts,
    })
}
