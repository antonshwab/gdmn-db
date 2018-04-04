import { AModule } from "../AModule";
import { TConnectionPool } from "../AConnectionPool";
import { TDatabase } from "../ADatabase";
import { DefaultConnectionPoolOptions } from "../DefaultConnectionPool";
export declare class FirebirdModule extends AModule<void> {
    newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions>;
    newConnectionPool(): TConnectionPool<void>;
    newDatabase(): TDatabase;
}
