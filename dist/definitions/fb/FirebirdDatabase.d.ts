import { ADatabase, TDBOptions } from "../ADatabase";
import { FirebirdTransaction } from "./FirebirdTransaction";
import { FirebirdStatement } from "./FirebirdStatement";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { ITransactionOptions } from "../ATransaction";
export declare type FirebirdOptions = TDBOptions;
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
