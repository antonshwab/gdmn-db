import { AResultSet, TResultSet } from "./AResultSet";
import { AStatement, TStatement } from "./AStatement";
import { DBStructure } from "./DBStructure";
import { TExecutor } from "./types";
export interface INamedParams {
    [paramName: string]: any;
}
export declare type TTransaction = ATransaction<TResultSet, TStatement>;
export declare enum AccessMode {
    READ_WRITE = 0,
    READ_ONLY = 1,
}
export declare enum Isolation {
    READ_COMMITED = 0,
    READ_UNCOMMITED = 1,
    REPEATABLE_READ = 2,
    SERIALIZABLE = 3,
}
export interface ITransactionOptions {
    isolation: Isolation;
    accessMode: AccessMode;
}
export declare abstract class ATransaction<RS extends AResultSet, S extends AStatement<RS>> {
    protected static _DEFAULT_OPTIONS: ITransactionOptions;
    protected _options: ITransactionOptions;
    protected constructor(options?: ITransactionOptions);
    static executeFromParent<R>(sourceCallback: TExecutor<null, TTransaction>, resultCallback: TExecutor<TTransaction, R>): Promise<R>;
    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeStatement(transaction, "some sql with params", async (statement) => {
     *      await statement.execute([param1, param2]);
     *      await statement.execute([param3, param4]);
     *      return "some value";
     * })}
     * </pre>
     *
     * @param {TTransaction} transaction
     * @param {string} sql
     * @param {TExecutor<TStatement, R>} callback
     * @returns {Promise<R>}
     */
    static executeStatement<R>(transaction: TTransaction, sql: string, callback: TExecutor<TStatement, R>): Promise<R>;
    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeResultSet(transaction, "some sql", [param1, param2],
     *      async (resultSet) => {
     *          return await resultSet.getArrays();
     *      })
     * </pre>
     *
     * @param {TTransaction} transaction
     * @param {string} sql
     * @param {any[]} params
     * @param {TExecutor<TResultSet, R>} callback
     * @returns {Promise<R>}
     */
    static executeResultSet<R>(transaction: TTransaction, sql: string, params: null | any[] | INamedParams, callback: TExecutor<TResultSet, R>): Promise<R>;
    abstract start(): Promise<void>;
    abstract commit(): Promise<void>;
    abstract rollback(): Promise<void>;
    abstract isActive(): Promise<boolean>;
    abstract prepareSQL(sql: string): Promise<S>;
    abstract executeSQL(sql: string, params?: null | any[] | INamedParams): Promise<RS>;
    abstract readDBStructure(): Promise<DBStructure>;
}
