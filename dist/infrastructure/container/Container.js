"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.Container = void 0;
class Container {
    services = new Map();
    singletons = new Map();
    register(key, factory, singleton = false) {
        this.services.set(key, factory);
        if (singleton) {
            this.singletons.set(key, null);
        }
    }
    resolve(key) {
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
        const factory = this.services.get(key);
        if (!factory) {
            throw new Error(`Service '${key}' not found`);
        }
        return factory();
    }
    has(key) {
        return this.services.has(key);
    }
    clear() {
        this.services.clear();
        this.singletons.clear();
    }
}
exports.Container = Container;
exports.container = new Container();
//# sourceMappingURL=Container.js.map