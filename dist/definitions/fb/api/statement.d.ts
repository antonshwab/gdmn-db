import * as fb from "node-firebird-native-api";
import { Attachment } from "./attachment";
import { DataReader, DataWriter } from "./fb-utils";
import { ResultSet } from "./resultSet";
import { Transaction } from "./transaction";
/** Statement implementation. */
export declare class Statement {
    attachment: Attachment | undefined;
    resultSet?: ResultSet;
    statementHandle?: fb.Statement;
    inMetadata?: fb.MessageMetadata;
    outMetadata?: fb.MessageMetadata;
    inBuffer?: Uint8Array;
    outBuffer?: Uint8Array;
    dataWriter?: DataWriter;
    dataReader?: DataReader;
    protected constructor(attachment?: Attachment | undefined);
    static prepare(attachment: Attachment, transaction: Transaction, sqlStmt: string): Promise<Statement>;
    /** Disposes this statement's resources. */
    dispose(): Promise<void>;
    /** Executes a prepared statement that uses the SET TRANSACTION command. Returns the new transaction. */
    executeTransaction(transaction: Transaction): Promise<Transaction>;
    /** Executes a prepared statement that has no result set. */
    execute(transaction: Transaction, parameters?: any[]): Promise<void>;
    /** Executes a statement that returns a single record. */
    executeReturning(transaction: Transaction, parameters?: any[]): Promise<any[]>;
    /** Executes a prepared statement that has result set. */
    executeQuery(transaction: Transaction, parameters?: any[]): Promise<ResultSet>;
    protected internalExecute(transaction: Transaction, parameters?: any[]): Promise<any[]>;
}
