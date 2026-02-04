interface ServiceFactory<T = any> {
  (): T;
}

export class Container {
  private services = new Map<string, ServiceFactory>();
  private singletons = new Map<string, any>();

  register<T>(key: string, factory: ServiceFactory<T>, singleton: boolean = false): void {
    this.services.set(key, factory);
    if (singleton) {
      this.singletons.set(key, null);
    }
  }

  resolve<T>(key: string): T {
    // Check if it's a singleton that's already been instantiated
    if (this.singletons.has(key)) {
      let instance = this.singletons.get(key);
      if (!instance) {
        const factory = this.services.get(key);
        if (!factory) {
          throw new Error(`Service '${key}' not found`);
        }
        instance = factory();
        this.singletons.set(key, instance);
      }
      return instance;
    }

    // Regular service resolution
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service '${key}' not found`);
    }
    return factory();
  }

  has(key: string): boolean {
    return this.services.has(key);
  }

  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }
}

export const container = new Container();
