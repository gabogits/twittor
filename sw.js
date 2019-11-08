//8

importScripts('js/sw-utils.js');

//2)
const STATIC_CACHE = 'static_v4';
const DYNAMIC_CACHE = 'dynamic_v2';
const INMUTABLE_CACHE = 'inmutable_v1';

//3)
const APP_SHELL = [
    '/index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'js/app.js'
];
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
]

//5)
self.addEventListener('install', e => {
    const cacheStatic = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL));
    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => cache.addAll(APP_SHELL_INMUTABLE));
    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
})

//6)

self.addEventListener('activate', e => {
    const respuesta = caches.keys().then(keys => { //vamos a ver si hay otros caches existentes con el nombre de static
        keys.forEach(key => { //va a barrer todos los caches existentes  
            // static-v4
            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key)
            }

            //esto es para el dynamic-cache
            if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                return caches.delete(key)
            }

        });

    });

    e.waitUntil(respuesta);
})

// 7)
self.addEventListener('fetch', e => {

    const respuesta = caches.match(e.request).then(res => {
        if (res) {
            return res;
        } else {
            console.log(e.request.url)
            //al hacer fetch no nos encuentra esta fuente 
            //esto es solo una referencia al css https://fonts.googleapis.com/css?family=Quicksand:300,400  
            //pero internamente hace una solicitud ya para obtener la fuente https://fonts.gstatic.com/s/quicksand/v19/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkP8o58a-wg.woff2


            //network fall, hay que hacer un fetch al recurso que no encuentra -al recurso nuevo.
            //aqui hay que almacenarlo en el cache dinamico

            return fetch(e.request).then(newRes => {
                return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes)
            })

        }
    })


    e.respondWith(respuesta)
})