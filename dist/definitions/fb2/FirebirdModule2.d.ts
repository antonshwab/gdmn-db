import { AModule } from "../AModule";
import { TConnectionPool } from "../AConnectionPool";
import { TDatabase } from "../ADatabase";
import { FirebirdOptions2 } from "./FirebirdDatabase2";
export declare class FirebirdModule2 extends AModule<FirebirdOptions2> {
    newConnectionPool(): TConnectionPool<FirebirdOptions2>;
    newDatabase(): TDatabase<FirebirdOptions2>;
}
