import { TExecutor } from "./AConnectionPool";
import { AResultSet, TResultSet } from "./AResultSet";
export declare type TStatement = AStatement<TResultSet>;
export declare abstract class AStatement<RS extends AResultSet> {
    static executeFromParent<R>(sourceCallback: TExecutor<null, TStatement>, resultCallback: TExecutor<TStatement, R>): Promise<R>;
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
    static executeResultSet<R>(statement: TStatement, params: any[] | undefined, callback: TExecutor<TResultSet, R>): Promise<R>;
    abstract executeQuery(params?: any[]): Promise<RS>;
    abstract execute(params?: any[]): Promise<void>;
    abstract dispose(): Promise<void>;
}
