import { Master, Provider, Status, Util } from "node-firebird-native-api";
export interface IClient {
    master: Master;
    dispatcher: Provider;
    util: Util;
}
export declare class Context {
    private _client?;
    readonly client: IClient | undefined;
    create(): void;
    destroy(): void;
    statusAction<T>(action: (status: Status) => Promise<T>): Promise<T>;
    statusActionSync<T>(action: (status: Status) => T): T;
}
