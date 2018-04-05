import { ADatabase, IDBOptions } from "../ADatabase";
import { ITransactionOptions } from "../ATransaction";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { FirebirdStatement } from "./FirebirdStatement";
import { FirebirdTransaction } from "./FirebirdTransaction";
export declare type FirebirdOptions = IDBOptions;
export declare class FirebirdDatabase extends ADatabase<FirebirdOptions, FirebirdResultSet, FirebirdStatement, FirebirdTransaction> {
    private _client;
    private _connect;
    constructor();
    private static _optionsToUri(options);
    createDatabase(options: FirebirdOptions): Promise<void>;
    dropDatabase(): Promise<void>;
    connect(options: FirebirdOptions): Promise<void>;
    createTransaction(options?: ITransactionOptions): Promise<FirebirdTransaction>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
    private _clearVariables();
}
