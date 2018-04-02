import {AModule} from "../AModule";
import {TConnectionPool} from "../AConnectionPool";
import {TDatabase} from "../ADatabase";
import {FirebirdDatabase, FirebirdOptions} from "./FirebirdDatabase";
import {DefaultConnectionPool, DefaultConnectionPoolOptions} from "../DefaultConnectionPool";

export class FirebirdModule extends AModule<void, FirebirdOptions> {

    newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions, FirebirdOptions> {
        return new DefaultConnectionPool(() => new FirebirdDatabase());
    }

    newConnectionPool(): TConnectionPool<void, FirebirdOptions> {
        throw new Error("Unsupported yet");
    }

    newDatabase(): TDatabase<FirebirdOptions> {
        return new FirebirdDatabase();
    }
}