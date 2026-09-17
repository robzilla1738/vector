[Exposed=Window]
interface Worker : EventTarget {
  undefined postMessage(any message);
  undefined terminate();
};

[Exposed=Window]
interface ServiceWorker : EventTarget {
  readonly attribute USVString scriptURL;
  readonly attribute DOMString state;
  undefined postMessage(any message);
};

[Exposed=Window]
interface ServiceWorkerRegistration : EventTarget {
  readonly attribute ServiceWorker? installing;
  readonly attribute ServiceWorker? waiting;
  readonly attribute ServiceWorker? active;
  readonly attribute USVString scope;
};

[Exposed=Window]
interface ServiceWorkerContainer : EventTarget {
  Promise<ServiceWorkerRegistration> register(USVString scriptURL, optional any options);
  readonly attribute Promise<ServiceWorkerRegistration> ready;
};

[Exposed=ServiceWorker]
interface Client {
  readonly attribute USVString url;
  readonly attribute DOMString frameType;
  readonly attribute DOMString id;
  readonly attribute DOMString type;
};

[Exposed=ServiceWorker]
interface Clients {
  Promise<sequence<Client>> matchAll(optional any options);
  Promise<undefined> claim();
};

[Exposed=ServiceWorker]
interface ServiceWorkerGlobalScope : EventTarget {
  readonly attribute Clients clients;
  Promise<undefined> skipWaiting();
};

[Exposed=Window]
interface XMLHttpRequest : EventTarget {
  undefined open(DOMString method, USVString url);
  undefined send(optional any body);
  undefined abort();
  readonly attribute unsigned short status;
  readonly attribute DOMString responseText;
};
