import {TConnectionPool} from "./AConnectionPool";
import {TDatabase} from "./ADatabase";

export abstract class AModule<Options> {

    abstract newDatabase(): TDatabase<Options>;

    abstract newConnectionPool(): TConnectionPool<Options>;
}