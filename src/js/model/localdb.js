import EventBus from 'eventbusjs';

const DB_VERSION = 1;
const indexedDB = window.indexedDB;

var dbPromise = new Promise(function(resolve, reject){
  if (!indexedDB) {
    console.error('Your browser doesn\'t support a stable version of IndexedDB. Such and such feature will not be available.');
  } else {

    var request = indexedDB.open('CartographeDB', DB_VERSION);
    request.onerror = function(event) {
      alert('DB error', event.target.errorCode);
      reject();
    };
    request.onsuccess = function(event) {
      var db = event.target.result;
      resolve(db);
    };
    request.onupgradeneeded = function(event) {
      console.info('DB onupgradeneeded', event.oldVersion);
      var db = event.target.result;
      if(event.oldVersion < 1){
        var objectStore = db.createObjectStore('cards', { keyPath: '_id' });
        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.transaction.oncomplete = function(){
          // done
        };
      }
    };
  }
});

class CartographeDB {
  constructor(){
  }

  get(id){
    return new Promise((resolve, reject)=>{
      if(!id){ return resolve(null); }
      dbPromise.then(db => {
        var req = db.transaction(['cards'])
                    .objectStore('cards')
                    .get(id);
        req.onerror = event => {
          console.error('Save failed');
          reject(event);
        };
        req.onsuccess = () => {
          resolve(req.result);
        };
      });
    });
  }

  save(obj) {
    return new Promise((resolve, reject)=>{
      dbPromise.then(db => {
        var req = db.transaction(['cards'], 'readwrite')
                    .objectStore('cards')
                    .put(obj);
        req.onerror = event => {
          console.error('Save failed');
          reject(event);
        };
        req.onsuccess = () => {
          EventBus.dispatch('object-saved', this, obj);
          resolve();
        };
      });
    });
  }
}

var db = new CartographeDB();
export default db;

