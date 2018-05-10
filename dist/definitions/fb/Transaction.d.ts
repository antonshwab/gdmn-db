import { Transaction as NativeTransaction } from "node-firebird-native-api";
import { ATransaction, ITransactionOptions } from "../ATransaction";
import { Connection } from "./Connection";
export declare class Transaction extends ATransaction {
    static EXCLUDE_PATTERNS: RegExp[];
    static PLACEHOLDER_PATTERN: RegExp;
    handler?: NativeTransaction;
    constructor(connection: Connection, options: ITransactionOptions, handler: NativeTransaction);
    readonly connection: Connection;
    readonly finished: boolean;
    static create(connection: Connection, options?: ITransactionOptions): Promise<Transaction>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
