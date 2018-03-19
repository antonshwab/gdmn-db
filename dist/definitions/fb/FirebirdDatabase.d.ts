import { ADatabase } from "../ADatabase";
import { FirebirdTransaction } from "./FirebirdTransaction";
import { FirebirdResultSet } from "./FirebirdResultSet";
import FBDatabase, { DBOptions } from "./driver/FBDatabase";
export { DBOptions as FirebirdOptions };
export declare class FirebirdDatabase extends ADatabase<DBOptions, FirebirdResultSet, FirebirdTransaction> {
    private readonly _database;
    constructor(database?: FBDatabase);
    connect(options: DBOptions): Promise<void>;
    createTransaction(): Promise<FirebirdTransaction>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
}
