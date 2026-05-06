// Service de stockage robuste avec support IndexedDB comme fallback

interface StorageOptions {
  useIndexedDB?: boolean;
}

class IndexedDBService {
  private static db: IDBDatabase | null = null;
  private static readonly DB_NAME = 'faroty_db';
  private static readonly STORE_NAME = 'storage';

  static async init(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    });
  }

  static async get(key: string): Promise<string | null> {
    if (!this.db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  static async set(key: string, value: string): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  static async remove(key: string): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  static async clear(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Service de stockage compatible multi-plateforme
export class RobustStorageService {
  private static indexedDBReady = false;

  static async init(): Promise<void> {
    try {
      await IndexedDBService.init();
      this.indexedDBReady = true;
    } catch (error) {
      console.warn('IndexedDB initialization failed, using localStorage only:', error);
      this.indexedDBReady = false;
    }
  }

  static async getItem(key: string): Promise<string | null> {
    // Essayer localStorage d'abord
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          return value;
        }
      }
    } catch (error) {
      // localStorage non disponible (mode incognito, etc.)
      console.warn(`localStorage.getItem failed for key ${key}:`, error);
    }

    // Fallback à IndexedDB
    if (this.indexedDBReady) {
      try {
        return await IndexedDBService.get(key);
      } catch (error) {
        console.warn(`IndexedDB.get failed for key ${key}:`, error);
      }
    }

    return null;
  }

  static async setItem(key: string, value: string): Promise<void> {
    let localStorageSuccess = false;

    // Essayer localStorage d'abord
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        localStorageSuccess = true;
      }
    } catch (error) {
      // localStorage non disponible
      console.warn(`localStorage.setItem failed for key ${key}:`, error);
    }

    // Utiliser IndexedDB comme backup si localStorage a échoué
    if (!localStorageSuccess && this.indexedDBReady) {
      try {
        await IndexedDBService.set(key, value);
      } catch (error) {
        console.warn(`IndexedDB.set failed for key ${key}:`, error);
        throw new Error(`Failed to store item ${key} in any storage`);
      }
    }
  }

  static async removeItem(key: string): Promise<void> {
    // Supprimer de localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`localStorage.removeItem failed for key ${key}:`, error);
    }

    // Supprimer d'IndexedDB
    if (this.indexedDBReady) {
      try {
        await IndexedDBService.remove(key);
      } catch (error) {
        console.warn(`IndexedDB.remove failed for key ${key}:`, error);
      }
    }
  }

  static async clear(): Promise<void> {
    // Vider localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
      }
    } catch (error) {
      console.warn('localStorage.clear failed:', error);
    }

    // Vider IndexedDB
    if (this.indexedDBReady) {
      try {
        await IndexedDBService.clear();
      } catch (error) {
        console.warn('IndexedDB.clear failed:', error);
      }
    }
  }

  static isAvailable(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      if (window.localStorage) {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      }

      return this.indexedDBReady;
    } catch (error) {
      return this.indexedDBReady;
    }
  }
}

// Initialiser le service au chargement
if (typeof window !== 'undefined') {
  RobustStorageService.init().catch(console.error);
}

export default RobustStorageService;
