import ATransaction, {QuerySeqCallback} from "../ATransaction";
import FBDatabase, {FBTransaction} from "./FBDatabase";

export default class FirebirdTransaction extends ATransaction {

    private _database: FBDatabase;
    private _transaction: FBTransaction;

    constructor(database: FBDatabase) {
        super();
        this._database = database;
    }

    async start(): Promise<void> {
        this._transaction = await this._database.transaction();
    }

    async commit(): Promise<void> {
        await this._transaction.commit();
    }

    async rollback(): Promise<void> {
        await this._transaction.rollback();
    }

    async isActive(): Promise<boolean> {
        return this._transaction.isInTransaction();
    }

    async query(query: string, params?: any[]): Promise<any[]> {
        return await this._transaction.query(query, params);
    }

    async querySequentially(query: string, callback: QuerySeqCallback, params?: any[]): Promise<void> {
        return await this._transaction.sequentially(query, params, callback);
    }
}