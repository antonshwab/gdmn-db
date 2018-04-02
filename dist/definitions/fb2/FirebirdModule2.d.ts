import { AModule } from "../AModule";
import { TConnectionPool } from "../AConnectionPool";
import { TDatabase } from "../ADatabase";
import { FirebirdOptions2 } from "./FirebirdDatabase2";
import { DefaultConnectionPoolOptions } from "../DefaultConnectionPool";
export declare class FirebirdModule2 extends AModule<void, FirebirdOptions2> {
    newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions, FirebirdOptions2>;
    newConnectionPool(): TConnectionPool<void, FirebirdOptions2>;
    newDatabase(): TDatabase<FirebirdOptions2>;
}
