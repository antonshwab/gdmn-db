import { Attachment, Statement, Transaction } from "node-firebird-driver-native";
import { AStatement } from "../AStatement";
import { INamedParams } from "../ATransaction";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { ParamsAnalyzer } from "./ParamsAnalyzer";
export declare class FirebirdStatement extends AStatement<FirebirdResultSet> {
    private readonly _connect;
    private readonly _transaction;
    private readonly _statement;
    private readonly _paramsAnalyzer;
    constructor(connect: Attachment, transaction: Transaction, statement: Statement, paramsAnalyzer: ParamsAnalyzer);
    dispose(): Promise<void>;
    execute(params?: null | any[] | INamedParams): Promise<void>;
    executeQuery(params?: null | any[] | INamedParams): Promise<FirebirdResultSet>;
}
