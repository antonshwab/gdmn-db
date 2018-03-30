import {AModule} from "../AModule";
import {TConnectionPool} from "../AConnectionPool";
import {TDatabase} from "../ADatabase";
import {FirebirdDatabase2, FirebirdOptions2} from "./FirebirdDatabase2";
import {FirebirdConnectionPool2} from "./FirebirdConnectionPool2";

export class FirebirdModule2 extends AModule<FirebirdOptions2> {

    newConnectionPool(): TConnectionPool<FirebirdOptions2> {
        return new FirebirdConnectionPool2();
    }

    newDatabase(): TDatabase<FirebirdOptions2> {
        return new FirebirdDatabase2();
    }
}