import {TExecutor} from "./types";
import {AStatement, TStatement} from "./AStatement";
import {AResultSet, TResultSet} from "./AResultSet";
import {DBStructure} from "./DBStructure";

export type TNamedParams = { [paramName: string]: any };

export type TTransaction = ATransaction<TResultSet, TStatement>;

export abstract class ATransaction<RS extends AResultSet, S extends AStatement<RS>> {

    static async executeFromParent<R>(sourceCallback: TExecutor<null, TTransaction>,
                                      resultCallback: TExecutor<TTransaction, R>): Promise<R> {
        let transaction: undefined | TTransaction;
        try {
            transaction = await sourceCallback(null);
            const result = await resultCallback(transaction);
            await transaction.commit();
            return result;
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

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
    static async executeStatement<R>(
        transaction: TTransaction,
        sql: string,
        callback: TExecutor<TStatement, R>
    ): Promise<R> {
        return await AStatement.executeFromParent(() => transaction.prepareSQL(sql), callback);
    }

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
    static async executeResultSet<R>(
        transaction: TTransaction,
        sql: string,
        params: null | any[] | TNamedParams,
        callback: TExecutor<TResultSet, R>
    ): Promise<R> {
        return await AResultSet.executeFromParent(() => transaction.executeSQL(sql, params), callback);
    }

    abstract async start(): Promise<void>;

    abstract async commit(): Promise<void>;

    abstract async rollback(): Promise<void>;

    abstract async isActive(): Promise<boolean>;

    abstract async prepareSQL(sql: string): Promise<S>;

    abstract async executeSQL(sql: string, params?: null | any[] | TNamedParams): Promise<RS>;

    abstract async readDBStructure(): Promise<DBStructure>;
}