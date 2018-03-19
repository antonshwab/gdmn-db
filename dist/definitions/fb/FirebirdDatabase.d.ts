import { ADatabase } from "../ADatabase";
import FBDatabase, { DBOptions } from "./FBDatabase";
import { FirebirdTransaction } from "./FirebirdTransaction";
export { DBOptions as FirebirdOptions };
export declare class FirebirdDatabase extends ADatabase<DBOptions, FirebirdTransaction> {
    private readonly _database;
    constructor(database?: FBDatabase);
    connect(options: DBOptions): Promise<void>;
    createTransaction(): Promise<FirebirdTransaction>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
}
