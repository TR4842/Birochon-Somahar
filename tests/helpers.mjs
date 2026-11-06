// Minimal in-memory localStorage for Node unit tests.
export class MemoryStorage {
  constructor() { this.map = new Map(); }
  get length() { return this.map.size; }
  key(i) { return Array.from(this.map.keys())[i] ?? null; }
  getItem(k) { return this.map.has(String(k)) ? this.map.get(String(k)) : null; }
  setItem(k, v) { this.map.set(String(k), String(v)); }
  removeItem(k) { this.map.delete(String(k)); }
  clear() { this.map.clear(); }
}

export const installStorage = () => {
  globalThis.localStorage = new MemoryStorage();
  return globalThis.localStorage;
};
