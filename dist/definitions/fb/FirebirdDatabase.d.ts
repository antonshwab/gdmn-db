import { ADatabase } from "../ADatabase";
import { FirebirdTransaction } from "./FirebirdTransaction";
import { FirebirdStatement } from "./FirebirdStatement";
import { FirebirdResultSet } from "./FirebirdResultSet";
export declare type FirebirdOptions = {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    dbPath: string;
};
export declare class FirebirdDatabase extends ADatabase<FirebirdOptions, FirebirdResultSet, FirebirdStatement, FirebirdTransaction> {
    private _client;
    private _connect;
    constructor();
    private static _optionsToUri(options);
    createDatabase(options: FirebirdOptions): Promise<void>;
    dropDatabase(): Promise<void>;
    connect(options: FirebirdOptions): Promise<void>;
    createTransaction(): Promise<FirebirdTransaction>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
    private _clearVariables();
}
