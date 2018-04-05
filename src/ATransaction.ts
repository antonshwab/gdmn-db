import {AResultSet, TResultSet} from "./AResultSet";
import {AStatement, TStatement} from "./AStatement";
import {DBStructure} from "./dbStructure/DBStructure";
import {TExecutor} from "./types";

export interface INamedParams {
    [paramName: string]: any;
}

export type TTransaction = ATransaction<TResultSet, TStatement>;

export enum AccessMode {
    READ_WRITE, READ_ONLY
}

export enum Isolation {
    READ_COMMITED,
    READ_UNCOMMITED,
    REPEATABLE_READ,
    SERIALIZABLE
}

export interface ITransactionOptions {
    isolation: Isolation;
    accessMode: AccessMode;
}

export abstract class ATransaction<RS extends AResultSet, S extends AStatement<RS>> {

    protected static _DEFAULT_OPTIONS: ITransactionOptions = {
        isolation: Isolation.READ_COMMITED,
        accessMode: AccessMode.READ_WRITE
    };
    protected _options: ITransactionOptions;

    protected constructor(options: ITransactionOptions = ATransaction._DEFAULT_OPTIONS) {
        this._options = options;
    }

    public static async executeFromParent<R>(sourceCallback: TExecutor<null, TTransaction>,
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
    public static async executeStatement<R>(
        transaction: TTransaction,
        sql: string,
        callback: TExecutor<TStatement, R>
    ): Promise<R> {
        return await AStatement.executeFromParent(() => transaction.prepareSQL(sql), callback);
    }

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
    public static async executeResultSet<R>(
        transaction: TTransaction,
        sql: string,
        params: null | any[] | INamedParams,
        callback: TExecutor<TResultSet, R>
    ): Promise<R> {
        return await AResultSet.executeFromParent(() => transaction.executeSQL(sql, params), callback);
    }

    public abstract async start(): Promise<void>;

    public abstract async commit(): Promise<void>;

    public abstract async rollback(): Promise<void>;

    public abstract async isActive(): Promise<boolean>;

    public abstract async prepareSQL(sql: string): Promise<S>;

    public abstract async executeSQL(sql: string, params?: null | any[] | INamedParams): Promise<RS>;

    public abstract async readDBStructure(): Promise<DBStructure>;
}
