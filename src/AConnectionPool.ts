import {ADatabase} from "./ADatabase";
import {ATransaction} from "./ATransaction";

export abstract class AConnectionPool<Options, T extends ATransaction, D extends ADatabase<Options, T>> {

    abstract create(options: Options, maxConnections?: number): Promise<void>;

    abstract destroy(): Promise<void>;

    abstract attach(): Promise<D>;
}