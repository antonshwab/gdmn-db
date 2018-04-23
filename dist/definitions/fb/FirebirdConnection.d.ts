import { Attachment } from "node-firebird-native-api";
import { AConnection, IConnectionOptions } from "../AConnection";
import { ITransactionOptions } from "../ATransaction";
import { FirebirdBlob } from "./FirebirdBlob";
import { FirebirdContext } from "./FirebirdContext";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { FirebirdStatement } from "./FirebirdStatement";
import { FirebirdTransaction } from "./FirebirdTransaction";
export declare type FirebirdOptions = IConnectionOptions;
export declare class FirebirdConnection extends AConnection<FirebirdOptions, FirebirdBlob, FirebirdResultSet, FirebirdStatement, FirebirdTransaction> {
    context: FirebirdContext;
    handler?: Attachment;
    private static _optionsToUri(options);
    createDatabase(options: FirebirdOptions): Promise<void>;
    dropDatabase(): Promise<void>;
    connect(options: FirebirdOptions): Promise<void>;
    createTransaction(options?: ITransactionOptions): Promise<FirebirdTransaction>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
}
