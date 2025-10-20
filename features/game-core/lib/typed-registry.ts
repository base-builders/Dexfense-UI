export interface GameRegistry {
  user: {
    address: string;
  } | null;
}

export class TypedRegistry {
  constructor(private registry: Phaser.Data.DataManager) {}

  set<K extends keyof GameRegistry>(key: K, value: GameRegistry[K]) {
    this.registry.set(key as string, value);
  }

  get<K extends keyof GameRegistry>(key: K): GameRegistry[K] {
    return this.registry.get(key as string);
  }

  onChange<K extends keyof GameRegistry>(
    key: K,
    callback: (value: GameRegistry[K]) => void
  ) {
    this.registry.events.on(
      `changedata-${String(key)}`,
      (_: unknown, value: GameRegistry[K]) => callback(value)
    );
  }

  offChange<K extends keyof GameRegistry>(key: K) {
    this.registry.events.off(`changedata-${String(key)}`);
  }
}
