import { AModule } from "../AModule";
import { TConnectionPool } from "../AConnectionPool";
import { TDatabase } from "../ADatabase";
import { FirebirdOptions } from "./FirebirdDatabase";
import { DefaultConnectionPoolOptions } from "../DefaultConnectionPool";
export declare class FirebirdModule extends AModule<void, FirebirdOptions> {
    newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions, FirebirdOptions>;
    newConnectionPool(): TConnectionPool<void, FirebirdOptions>;
    newDatabase(): TDatabase<FirebirdOptions>;
}
