import {Attachment, Statement, Transaction} from "node-firebird-driver-native";
import {AStatement} from "../AStatement";
import {FirebirdResultSet} from "./FirebirdResultSet";
import {ParamsAnalyzer} from "./ParamsAnalyzer";
import {TNamedParams} from "../ATransaction";

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

    async dispose(): Promise<void> {
        await this._statement.dispose();
    }

    async execute(params?: null | any[] | TNamedParams): Promise<void> {
        await this._statement.execute(this._transaction, this._paramsAnalyzer.prepareParams(params));
    }

    async executeQuery(params?: null | any[] | TNamedParams): Promise<FirebirdResultSet> {
        const resultSet = await this._statement.executeQuery(this._transaction,
            this._paramsAnalyzer.prepareParams(params));
        return new FirebirdResultSet(this._connect, this._transaction, resultSet);
    }
}