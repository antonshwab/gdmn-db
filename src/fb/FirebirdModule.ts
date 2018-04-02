import {AModule} from "../AModule";
import {TConnectionPool} from "../AConnectionPool";
import {TDatabase} from "../ADatabase";
import {FirebirdDatabase, FirebirdOptions} from "./FirebirdDatabase";
import {FirebirdConnectionPool, FirebirdPoolOptions} from "./FirebirdConnectionPool";
import {DefaultConnectionPool, DefaultConnectionPoolOptions} from "../DefaultConnectionPool";

export class FirebirdModule extends AModule<FirebirdPoolOptions, FirebirdOptions> {

    newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions, FirebirdOptions> {
        return new DefaultConnectionPool(() => new FirebirdDatabase());
    }

    newConnectionPool(): TConnectionPool<FirebirdPoolOptions, FirebirdOptions> {
        return new FirebirdConnectionPool();
    }

    newDatabase(): TDatabase<FirebirdOptions> {
        return new FirebirdDatabase();
    }
}