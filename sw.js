/* Service worker: guarda os arquivos do aplicativo para uso sem internet
 * quando ele é instalado a partir de um endereço https (PWA). */
const VERSAO = "metodo-logico-v4";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/estilo.css",
  "./vendor/jszip.min.js",
  "./js/aulas.js",
  "./js/planejador.js",
  "./js/diagnostico.js",
  "./js/metodo.js",
  "./js/verificador.js",
  "./js/app.js",
  "./icones/icone.svg",
  "./icones/icone-192.png",
  "./icones/icone-512.png",
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Rede primeiro (para receber atualizações); sem rede, usa a cópia guardada. */
self.addEventListener("fetch", (ev) => {
  if (ev.request.method !== "GET" || new URL(ev.request.url).origin !== location.origin) return;
  ev.respondWith(
    fetch(ev.request)
      .then((r) => {
        const copia = r.clone();
        caches.open(VERSAO).then((c) => c.put(ev.request, copia));
        return r;
      })
      .catch(() => caches.match(ev.request, { ignoreSearch: true }))
  );
});
