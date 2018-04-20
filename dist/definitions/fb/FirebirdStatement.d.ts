import { AStatement } from "../AStatement";
import { INamedParams } from "../ATransaction";
import { DefaultParamsAnalyzer } from "../default/DefaultParamsAnalyzer";
import { Attachment } from "./api/attachment";
import { Statement } from "./api/statement";
import { Transaction } from "./api/transaction";
import { FirebirdBlob } from "./FirebirdBlob";
import { FirebirdResultSet } from "./FirebirdResultSet";
export declare class FirebirdStatement extends AStatement<FirebirdBlob, FirebirdResultSet> {
    private readonly _connection;
    private readonly _transaction;
    private readonly _statement;
    private readonly _paramsAnalyzer;
    constructor(connect: Attachment, transaction: Transaction, statement: Statement, paramsAnalyzer: DefaultParamsAnalyzer);
    dispose(): Promise<void>;
    execute(params?: any[] | INamedParams): Promise<void>;
    executeQuery(params?: any[] | INamedParams): Promise<FirebirdResultSet>;
}
