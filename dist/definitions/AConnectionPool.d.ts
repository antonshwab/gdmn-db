import { ADatabase, TDatabase } from "./ADatabase";
import { ATransaction } from "./ATransaction";
import { AResultSet } from "./AResultSet";
export declare type TConnectionPool<Opt, DBOpt> = AConnectionPool<Opt, DBOpt, AResultSet, ATransaction<AResultSet>, TDatabase<DBOpt>>;
export declare abstract class AConnectionPool<Options, DBOptions, RS extends AResultSet, T extends ATransaction<RS>, D extends ADatabase<DBOptions, RS, T>> {
    abstract isCreated(): Promise<boolean>;
    abstract create(dbOptions: DBOptions, options: Options): Promise<void>;
    abstract destroy(): Promise<void>;
    abstract get(): Promise<D>;
}
