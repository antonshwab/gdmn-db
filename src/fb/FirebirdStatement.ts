import {Attachment, Statement, Transaction} from "node-firebird-driver-native";
import {AStatement} from "../AStatement";
import {FirebirdResultSet} from "./FirebirdResultSet";

export class FirebirdStatement extends AStatement<FirebirdResultSet> {

    private readonly _connect: Attachment;
    private readonly _transaction: Transaction;
    private readonly _statement: Statement;

    constructor(connect: Attachment, transaction: Transaction, statement: Statement) {
        super();
        this._connect = connect;
        this._transaction = transaction;
        this._statement = statement;
    }

    async dispose(): Promise<void> {
        await this._statement.dispose();
    }

    async execute(params?: any[]): Promise<void> {
        await this._statement.execute(this._transaction, params);
    }

    async executeQuery(params?: any[]): Promise<FirebirdResultSet> {
        const resultSet = await this._statement.executeQuery(this._transaction, params);
        return new FirebirdResultSet(this._connect, this._transaction, resultSet);
    }
}