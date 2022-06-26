export class BiMap {
  map: Map<string, string>
  inverseMap: Map<string, string>

  constructor(map: Map<string, string>, inverseMap: Map<string, string>) {
      this.map = map;
      this.inverseMap = inverseMap;
  }

  static create() {
      return new BiMap(new Map(), new Map());
  }

  get size() {
      return this.map.size;
  }

  public set(key: string, value: string) {
      const oldValue = this.map.get(key);
      this.inverseMap.delete(oldValue ?? '');
      this.map.set(key, value);
      this.inverseMap.set(value, key);
      return this;
  }

  public clear() {
      this.map.clear();
      this.inverseMap.clear();
  }

  public delete(key: string) {
      const value = this.map.get(key);
      const deleted = this.map.delete(key);
      const inverseDeleted = this.inverseMap.delete(value ?? '');

      return deleted || inverseDeleted;
  }

  public entries() {
      return this.map.entries();
  }

  public forEach(callbackFn: any, thisArg?: any) {
      return this.map.forEach(callbackFn, thisArg);
  }

  public get(key: string) {
      return this.map.get(key);
  }

  public has(key: string) {
      return this.map.has(key);
  }

  public keys() {
      return this.map.keys();
  }

  public inverse() {
      return new BiMap(this.inverseMap, this.map);
  }

  public values() {
      return this.inverseMap.keys();
  }

  *[Symbol.iterator]() {
      yield* this.map;
  }
}