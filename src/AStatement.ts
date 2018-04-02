import {TExecutor} from "./AConnectionPool";
import {AResultSet, TResultSet} from "./AResultSet";

export type TStatement = AStatement<TResultSet>;

export abstract class AStatement<RS extends AResultSet> {

    static async executeFromParent<R>(sourceCallback: TExecutor<null, TStatement>,
                                      resultCallback: TExecutor<TStatement, R>): Promise<R> {
        let statement: undefined | TStatement;
        try {
            statement = await sourceCallback(null);
            return await resultCallback(statement);
        } finally {
            if (statement) {
                await statement.dispose();
            }
        }
    }

    /**
     * Example:
     * <pre>
     * const result = await AStatement.executeResultSet(statement, [param1, param2], async (resultSet) => {
     *      return await resultSet.getArrays();
     * })}
     * </pre>
     *
     * @param {TStatement} statement
     * @param {any[]} params
     * @param {TExecutor<TResultSet, R>} callback
     * @returns {Promise<any>}
     */
    static async executeResultSet<R>(
        statement: TStatement,
        params: any[] = [],
        callback: TExecutor<TResultSet, R>
    ): Promise<R> {
        return await AResultSet.executeFromParent(() => statement.executeQuery(params), callback);
    }

    abstract async executeQuery(params?: any[]): Promise<RS>;

    abstract async execute(params?: any[]): Promise<void>;

    abstract async dispose(): Promise<void>;
}