import { AConnectionPool } from "../AConnectionPool";
import { FirebirdTransaction } from "./FirebirdTransaction";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { FirebirdDatabase, FirebirdOptions } from "./FirebirdDatabase";
export declare class FirebirdConnectionPool extends AConnectionPool<FirebirdOptions, FirebirdResultSet, FirebirdTransaction, FirebirdDatabase> {
    private readonly _connectionPool;
    isCreated(): Promise<boolean>;
    attach(): Promise<FirebirdDatabase>;
    create(options: FirebirdOptions, maxConnections?: number): Promise<void>;
    destroy(): Promise<void>;
}
