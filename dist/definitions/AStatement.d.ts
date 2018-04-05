import { AResultSet, TResultSet } from "./AResultSet";
import { INamedParams } from "./ATransaction";
import { TExecutor } from "./types";
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
    static executeResultSet<R>(statement: TStatement, params: null | any[] | INamedParams, callback: TExecutor<TResultSet, R>): Promise<R>;
    abstract executeQuery(params?: null | any[] | INamedParams): Promise<RS>;
    abstract execute(params?: null | any[] | INamedParams): Promise<void>;
    abstract dispose(): Promise<void>;
}
