import { TExecutor } from "./types";
import { AStatement, TStatement } from "./AStatement";
import { AResultSet, TResultSet } from "./AResultSet";
import { DBStructure } from "./DBStructure";
export declare type TNamedParams = {
    [paramName: string]: any;
};
export declare type TTransaction = ATransaction<TResultSet, TStatement>;
export declare abstract class ATransaction<RS extends AResultSet, S extends AStatement<RS>> {
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
     * const result = await ATransaction.executeResultSet(transaction, "some sql", [param1, param2], async (resultSet) => {
     *      return await resultSet.getArrays();
     * })}
     * </pre>
     *
     * @param {TTransaction} transaction
     * @param {string} sql
     * @param {any[]} params
     * @param {TExecutor<TResultSet, R>} callback
     * @returns {Promise<R>}
     */
    static executeResultSet<R>(transaction: TTransaction, sql: string, params: null | any[] | TNamedParams, callback: TExecutor<TResultSet, R>): Promise<R>;
    abstract start(): Promise<void>;
    abstract commit(): Promise<void>;
    abstract rollback(): Promise<void>;
    abstract isActive(): Promise<boolean>;
    abstract prepareSQL(sql: string): Promise<S>;
    abstract executeSQL(sql: string, params?: null | any[] | TNamedParams): Promise<RS>;
    abstract readDBStructure(): Promise<DBStructure>;
}
