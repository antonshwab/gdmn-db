import {ATransaction} from "../ATransaction";
import {FirebirdResultSet} from "./FirebirdResultSet";
import FBDatabase, {FBTransaction} from "./driver/FBDatabase";

export class FirebirdTransaction extends ATransaction<FirebirdResultSet> {

    private readonly _database: FBDatabase;
    private _transaction: FBTransaction;

    constructor(database: FBDatabase) {
        super();
        this._database = database;
    }

    async start(): Promise<void> {
        if (this._transaction) throw new Error("Transaction already opened");
        this._transaction = await this._database.transaction();
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
        if (!this._transaction) throw new Error("Need to open transaction");
        return this._transaction.isInTransaction();
    }

    async executeSQL(sql: string, params?: any[]): Promise<FirebirdResultSet> {
        if (!this._transaction) throw new Error("Need to open transaction");
        const result = await this._transaction.query(sql, params);  //TODO sequentially
        return new FirebirdResultSet(result);
    }
}