// Safe storage utility that gracefully falls back to in-memory storage 
// if localStorage or sessionStorage are blocked by iframe security policies (e.g. cross-origin restriction).

class MemoryStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

function getSafeStorage(type: 'localStorage' | 'sessionStorage'): Storage | MemoryStorage {
  try {
    const storage = window[type];
    // Test if storage is actually writable and readable
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    console.warn(`[SafeStorage] ${type} is blocked or unavailable. Falling back to in-memory storage.`, e);
    return new MemoryStorage();
  }
}

export const safeLocalStorage = getSafeStorage('localStorage');
export const safeSessionStorage = getSafeStorage('sessionStorage');
