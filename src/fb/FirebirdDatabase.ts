import {ADatabase} from "../ADatabase";
import {FirebirdTransaction} from "./FirebirdTransaction";
import {FirebirdResultSet} from "./FirebirdResultSet";
import FBDatabase, {DBOptions} from "./driver/FBDatabase";

export {DBOptions as FirebirdOptions};

export class FirebirdDatabase extends ADatabase<DBOptions, FirebirdResultSet, FirebirdTransaction> {

    private readonly _database: FBDatabase;

    constructor(database: FBDatabase = new FBDatabase()) {
        super();
        this._database = database;
    }

    async connect(options: DBOptions): Promise<void> {
        return await this._database.attach(options);
    }

    async createTransaction(): Promise<FirebirdTransaction> {
        return new FirebirdTransaction(this._database);
    }

    async disconnect(): Promise<void> {
        return await this._database.detach();
    }

    async isConnected(): Promise<boolean> {
        return this._database.isAttached();
    }
}