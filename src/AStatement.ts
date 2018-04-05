import {AResultSet, TResultSet} from "./AResultSet";
import {INamedParams} from "./ATransaction";
import {TExecutor} from "./types";

export type TStatement = AStatement<TResultSet>;

export abstract class AStatement<RS extends AResultSet> {

    public static async executeFromParent<R>(sourceCallback: TExecutor<null, TStatement>,
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
    public static async executeResultSet<R>(
        statement: TStatement,
        params: null | any[] | INamedParams,
        callback: TExecutor<TResultSet, R>
    ): Promise<R> {
        return await AResultSet.executeFromParent(() => statement.executeQuery(params), callback);
    }

    public abstract async executeQuery(params?: null | any[] | INamedParams): Promise<RS>;

    public abstract async execute(params?: null | any[] | INamedParams): Promise<void>;

    public abstract async dispose(): Promise<void>;
}
