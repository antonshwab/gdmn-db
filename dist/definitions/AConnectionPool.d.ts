import { ADatabase } from "./ADatabase";
import { ATransaction } from "./ATransaction";
import { AResultSet } from "./AResultSet";
export declare abstract class AConnectionPool<Options, RS extends AResultSet, T extends ATransaction<RS>, D extends ADatabase<Options, RS, T>> {
    abstract isCreated(): Promise<boolean>;
    abstract create(options: Options, maxConnections?: number): Promise<void>;
    abstract destroy(): Promise<void>;
    abstract attach(): Promise<D>;
}
