import { AConnectionPool } from "../AConnectionPool";
import { FirebirdTransaction } from "./FirebirdTransaction";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { FirebirdDatabase, FirebirdOptions } from "./FirebirdDatabase";
export declare type FirebirdPoolOptions = {
    max: number;
};
export declare class FirebirdConnectionPool extends AConnectionPool<FirebirdPoolOptions, FirebirdOptions, FirebirdResultSet, FirebirdTransaction, FirebirdDatabase> {
    private readonly _connectionPool;
    isCreated(): Promise<boolean>;
    get(): Promise<FirebirdDatabase>;
    create(dbOptions: FirebirdOptions, options: FirebirdPoolOptions): Promise<void>;
    destroy(): Promise<void>;
}
