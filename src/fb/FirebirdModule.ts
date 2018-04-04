import {AModule} from "../AModule";
import {TConnectionPool} from "../AConnectionPool";
import {TDatabase} from "../ADatabase";
import {FirebirdDatabase} from "./FirebirdDatabase";
import {DefaultConnectionPool, DefaultConnectionPoolOptions} from "../DefaultConnectionPool";

export class FirebirdModule extends AModule<void> {

    newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions> {
        return new DefaultConnectionPool(() => new FirebirdDatabase());
    }

    newConnectionPool(): TConnectionPool<void> {
        throw new Error("Unsupported yet");
    }

    newDatabase(): TDatabase {
        return new FirebirdDatabase();
    }
}