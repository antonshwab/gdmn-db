import * as fb from "node-firebird-native-api";
import { BlobObj } from "./blobObj";
import { BlobStream } from "./blobStream";
import { Client } from "./client";
import { ResultSet } from "./resultSet";
import { Statement } from "./statement";
import { Transaction } from "./transaction";
import { ConnectOptions, TransactionOptions } from "./types";
/** Attachment implementation. */
export declare class Attachment {
    client: Client | undefined;
    statements: Set<Statement>;
    transactions: Set<Transaction>;
    attachmentHandle?: fb.Attachment;
    protected constructor(client?: Client | undefined);
    static connect(client: Client, uri: string, options?: ConnectOptions): Promise<Attachment>;
    static createDatabase(client: Client, uri: string, options?: ConnectOptions): Promise<Attachment>;
    /** Disconnects this attachment. */
    disconnect(): Promise<void>;
    /** Drops the database and release this attachment. */
    dropDatabase(): Promise<void>;
    /** Executes a statement that uses the SET TRANSACTION command. Returns the new transaction. */
    executeTransaction(transaction: Transaction, sqlStmt: string): Promise<Transaction>;
    /** Executes a statement that has no result set. */
    execute(transaction: Transaction, sqlStmt: string, parameters?: any[]): Promise<void>;
    /** Executes a statement that returns a single record. */
    executeReturning(transaction: Transaction, sqlStmt: string, parameters?: any[]): Promise<any[]>;
    /** Executes a statement that has result set. */
    executeQuery(transaction: Transaction, sqlStmt: string, parameters?: any[]): Promise<ResultSet>;
    createBlob(transaction: Transaction): Promise<BlobStream>;
    openBlob(transaction: Transaction, blob: BlobObj): Promise<BlobStream>;
    /** Starts a new transaction. */
    startTransaction(options?: TransactionOptions): Promise<Transaction>;
    /** Prepares a query. */
    prepare(transaction: Transaction, sqlStmt: string): Promise<Statement>;
    private check();
    private preDispose();
    private postDispose();
}
