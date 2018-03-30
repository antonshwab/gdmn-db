import { AModule } from "../AModule";
import { TConnectionPool } from "../AConnectionPool";
import { TDatabase } from "../ADatabase";
import { FirebirdOptions } from "./FirebirdDatabase";
export declare class FirebirdModule extends AModule<FirebirdOptions> {
    newConnectionPool(): TConnectionPool<FirebirdOptions>;
    newDatabase(): TDatabase<FirebirdOptions>;
}
