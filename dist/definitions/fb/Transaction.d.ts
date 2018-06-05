import { Transaction as NativeTransaction } from "node-firebird-native-api";
import { ATransaction, ITransactionOptions } from "../ATransaction";
import { Connection } from "./Connection";
import { Statement } from "./Statement";
export declare class Transaction extends ATransaction {
    statements: Set<Statement>;
    handler?: NativeTransaction;
    constructor(connection: Connection, options: ITransactionOptions, handler: NativeTransaction);
    readonly connection: Connection;
    readonly finished: boolean;
    static create(connection: Connection, options?: ITransactionOptions): Promise<Transaction>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    private _closeChildren;
}
