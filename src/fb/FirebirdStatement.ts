import {Attachment, Statement, Transaction} from "node-firebird-driver-native";
import {AStatement} from "../AStatement";
import {INamedParams} from "../ATransaction";
import {DefaultParamsAnalyzer} from "../default/DefaultParamsAnalyzer";
import {FirebirdBlob} from "./FirebirdBlob";
import {FirebirdResultSet} from "./FirebirdResultSet";

export class FirebirdStatement extends AStatement<FirebirdBlob, FirebirdResultSet> {

    private readonly _connection: Attachment;
    private readonly _transaction: Transaction;
    private readonly _statement: Statement;
    private readonly _paramsAnalyzer: DefaultParamsAnalyzer;

    constructor(connect: Attachment,
                transaction: Transaction,
                statement: Statement,
                paramsAnalyzer: DefaultParamsAnalyzer) {
        super();
        this._connection = connect;
        this._transaction = transaction;
        this._statement = statement;
        this._paramsAnalyzer = paramsAnalyzer;
    }

    public async dispose(): Promise<void> {
        await this._statement.dispose();
    }

    public async execute(params?: any[] | INamedParams): Promise<void> {
        await this._statement.execute(this._transaction, this._paramsAnalyzer.prepareParams(params));
    }

    public async executeQuery(params?: any[] | INamedParams): Promise<FirebirdResultSet> {
        const resultSet = await this._statement.executeQuery(this._transaction,
            this._paramsAnalyzer.prepareParams(params));
        return new FirebirdResultSet(this._connection, this._transaction, resultSet);
    }
}
