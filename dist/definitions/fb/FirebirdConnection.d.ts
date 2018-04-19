import { AConnection, IConnectionOptions } from "../AConnection";
import { ITransactionOptions } from "../ATransaction";
import { FirebirdBlob } from "./FirebirdBlob";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { FirebirdStatement } from "./FirebirdStatement";
import { FirebirdTransaction } from "./FirebirdTransaction";
export declare type FirebirdOptions = IConnectionOptions;
export declare class FirebirdConnection extends AConnection<FirebirdOptions, FirebirdBlob, FirebirdResultSet, FirebirdStatement, FirebirdTransaction> {
    private _client;
    private _connection;
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
