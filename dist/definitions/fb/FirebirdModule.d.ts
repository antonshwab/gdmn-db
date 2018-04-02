import { AModule } from "../AModule";
import { TConnectionPool } from "../AConnectionPool";
import { TDatabase } from "../ADatabase";
import { FirebirdOptions } from "./FirebirdDatabase";
import { FirebirdPoolOptions } from "./FirebirdConnectionPool";
import { DefaultConnectionPoolOptions } from "../DefaultConnectionPool";
export declare class FirebirdModule extends AModule<FirebirdPoolOptions, FirebirdOptions> {
    newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions, FirebirdOptions>;
    newConnectionPool(): TConnectionPool<FirebirdPoolOptions, FirebirdOptions>;
    newDatabase(): TDatabase<FirebirdOptions>;
}
