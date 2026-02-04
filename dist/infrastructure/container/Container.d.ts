interface ServiceFactory<T = any> {
    (): T;
}
export declare class Container {
    private services;
    private singletons;
    register<T>(key: string, factory: ServiceFactory<T>, singleton?: boolean): void;
    resolve<T>(key: string): T;
    has(key: string): boolean;
    clear(): void;
}
export declare const container: Container;
export {};
//# sourceMappingURL=Container.d.ts.map