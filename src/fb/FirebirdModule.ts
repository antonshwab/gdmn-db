import {AModule} from "../AModule";
import {TConnectionPool} from "../AConnectionPool";
import {TDatabase} from "../ADatabase";
import {FirebirdDatabase, FirebirdOptions} from "./FirebirdDatabase";
import {FirebirdConnectionPool} from "./FirebirdConnectionPool";

export class FirebirdModule extends AModule<FirebirdOptions> {

    newConnectionPool(): TConnectionPool<FirebirdOptions> {
        return new FirebirdConnectionPool();
    }

    newDatabase(): TDatabase<FirebirdOptions> {
        return new FirebirdDatabase();
    }
}