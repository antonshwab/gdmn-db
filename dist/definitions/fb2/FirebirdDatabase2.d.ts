import { ADatabase } from "../ADatabase";
import { FirebirdTransaction2 } from "./FirebirdTransaction2";
import { FirebirdResultSet2 } from "./FirebirdResultSet2";
export declare type FirebirdOptions2 = {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    dbPath: string;
};
export declare class FirebirdDatabase2 extends ADatabase<FirebirdOptions2, FirebirdResultSet2, FirebirdTransaction2> {
    private _client;
    private _connect;
    constructor();
    private static _optionsToUri(options);
    createDatabase(options: FirebirdOptions2): Promise<void>;
    dropDatabase(): Promise<void>;
    connect(options: FirebirdOptions2): Promise<void>;
    createTransaction(): Promise<FirebirdTransaction2>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
    private _clearVariables();
}
