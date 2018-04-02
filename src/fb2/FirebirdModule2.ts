import {AModule} from "../AModule";
import {TConnectionPool} from "../AConnectionPool";
import {TDatabase} from "../ADatabase";
import {FirebirdDatabase2, FirebirdOptions2} from "./FirebirdDatabase2";
import {DefaultConnectionPool, DefaultConnectionPoolOptions} from "../DefaultConnectionPool";

export class FirebirdModule2 extends AModule<void, FirebirdOptions2> {

    newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions, FirebirdOptions2> {
        return new DefaultConnectionPool(() => new FirebirdDatabase2());
    }

    newConnectionPool(): TConnectionPool<void, FirebirdOptions2> {
        throw new Error("Unsupported yet");
    }

    newDatabase(): TDatabase<FirebirdOptions2> {
        return new FirebirdDatabase2();
    }
}