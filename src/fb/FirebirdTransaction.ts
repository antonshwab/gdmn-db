import {Attachment, Transaction} from "node-firebird-driver-native";
import {ATransaction, TNamedParams} from "../ATransaction";
import {DBStructure} from "../DBStructure";
import {FirebirdStatement} from "./FirebirdStatement";
import {FirebirdResultSet} from "./FirebirdResultSet";
import {FirebirdDBStructure} from "./FirebirdDBStructure";
import {ParamsAnalyzer} from "./ParamsAnalyzer";

export class FirebirdTransaction extends ATransaction<FirebirdResultSet, FirebirdStatement> {

    private readonly _connect: Attachment;
    private _transaction: null | Transaction = null;

    constructor(connect: Attachment) {
        super();
        this._connect = connect;
    }

    async start(): Promise<void> {
        if (this._transaction) throw new Error("Transaction already opened");

        this._transaction = await this._connect.startTransaction();
    }

    async commit(): Promise<void> {
        if (!this._transaction) throw new Error("Need to open transaction");

        await this._transaction.commit();
        this._transaction = null;
    }

    async rollback(): Promise<void> {
        if (!this._transaction) throw new Error("Need to open transaction");

        await this._transaction.rollback();
        this._transaction = null;
    }

    async isActive(): Promise<boolean> {
        return Boolean(this._transaction);
    }

    async prepareSQL(sql: string): Promise<FirebirdStatement> {
        if (!this._transaction) throw new Error("Need to open transaction");

        const paramsAnalyzer = new ParamsAnalyzer(sql);
        const statement = await this._connect.prepare(this._transaction, paramsAnalyzer.sql);
        return new FirebirdStatement(this._connect, this._transaction, statement, paramsAnalyzer);
    }

    async executeSQL(sql: string, params?: any[] | TNamedParams): Promise<FirebirdResultSet> {
        if (!this._transaction) throw new Error("Need to open transaction");

        const paramsAnalyzer = new ParamsAnalyzer(sql);
        const resultSet = await this._connect.executeQuery(this._transaction, paramsAnalyzer.sql,
            paramsAnalyzer.prepareParams(params));
        return new FirebirdResultSet(this._connect, this._transaction, resultSet);
    }

    async readDBStructure(): Promise<DBStructure> {
        if (!this._transaction) throw new Error("Need to open transaction");

        return await FirebirdDBStructure.readStructure(this);
    }
}