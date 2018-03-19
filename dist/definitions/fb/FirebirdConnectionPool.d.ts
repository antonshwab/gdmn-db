import { AConnectionPool } from "../AConnectionPool";
import { FirebirdTransaction } from "./FirebirdTransaction";
import { FirebirdDatabase, FirebirdOptions } from "./FirebirdDatabase";
export declare class FirebirdConnectionPool extends AConnectionPool<FirebirdOptions, FirebirdTransaction, FirebirdDatabase> {
    private _connectionPool;
    isCreated(): Promise<boolean>;
    attach(): Promise<FirebirdDatabase>;
    create(options: FirebirdOptions, maxConnections?: number): Promise<void>;
    destroy(): Promise<void>;
}
