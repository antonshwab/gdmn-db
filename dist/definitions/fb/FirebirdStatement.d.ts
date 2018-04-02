import { Attachment, Statement, Transaction } from "node-firebird-driver-native";
import { AStatement } from "../AStatement";
import { FirebirdResultSet } from "./FirebirdResultSet";
export declare class FirebirdStatement extends AStatement<FirebirdResultSet> {
    private readonly _connect;
    private readonly _transaction;
    private readonly _statement;
    constructor(connect: Attachment, transaction: Transaction, statement: Statement);
    dispose(): Promise<void>;
    execute(params?: any[]): Promise<void>;
    executeQuery(params?: any[]): Promise<FirebirdResultSet>;
}
