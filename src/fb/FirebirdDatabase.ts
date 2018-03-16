import {ADatabase} from "../ADatabase";
import FBDatabase, {DBOptions} from "./FBDatabase";
import {FirebirdTransaction} from "./FirebirdTransaction";

export {DBOptions};

export class FirebirdDatabase extends ADatabase<DBOptions, FirebirdTransaction> {

    private _database = new FBDatabase();

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