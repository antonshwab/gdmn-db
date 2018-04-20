import * as fb from "node-firebird-native-api";
import { Statement } from "./statement";
import { Transaction } from "./transaction";
/** ResultSet implementation. */
export declare class ResultSet {
    statement: Statement | undefined;
    transaction: Transaction | undefined;
    finished: boolean;
    diposeStatementOnClose: boolean;
    resultSetHandle?: fb.ResultSet;
    protected constructor(statement?: Statement | undefined, transaction?: Transaction | undefined);
    static open(statement: Statement, transaction: Transaction, parameters?: any[]): Promise<ResultSet>;
    /** Closes this result set. */
    close(): Promise<void>;
    /** Fetchs data from this result set. */
    fetch(options?: {
        fetchSize?: number;
    }): Promise<any[][]>;
}
