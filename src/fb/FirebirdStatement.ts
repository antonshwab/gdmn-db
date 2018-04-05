import {Attachment, Statement, Transaction} from "node-firebird-driver-native";
import {AStatement} from "../AStatement";
import {INamedParams} from "../ATransaction";
import {FirebirdResultSet} from "./FirebirdResultSet";
import {ParamsAnalyzer} from "./ParamsAnalyzer";

export class FirebirdStatement extends AStatement<FirebirdResultSet> {

    private readonly _connect: Attachment;
    private readonly _transaction: Transaction;
    private readonly _statement: Statement;
    private readonly _paramsAnalyzer: ParamsAnalyzer;

    constructor(connect: Attachment, transaction: Transaction, statement: Statement, paramsAnalyzer: ParamsAnalyzer) {
        super();
        this._connect = connect;
        this._transaction = transaction;
        this._statement = statement;
        this._paramsAnalyzer = paramsAnalyzer;
    }

    public async dispose(): Promise<void> {
        await this._statement.dispose();
    }

    public async execute(params?: null | any[] | INamedParams): Promise<void> {
        await this._statement.execute(this._transaction, this._paramsAnalyzer.prepareParams(params));
    }

    public async executeQuery(params?: null | any[] | INamedParams): Promise<FirebirdResultSet> {
        const resultSet = await this._statement.executeQuery(this._transaction,
            this._paramsAnalyzer.prepareParams(params));
        return new FirebirdResultSet(this._connect, this._transaction, resultSet);
    }
}
