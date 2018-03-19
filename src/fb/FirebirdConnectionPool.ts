import {AConnectionPool} from "../AConnectionPool";
import {FirebirdTransaction} from "./FirebirdTransaction";
import {FirebirdDatabase, FirebirdOptions} from "./FirebirdDatabase";
import {FBConnectionPool} from "./FBDatabase";

export class FirebirdConnectionPool extends AConnectionPool<FirebirdOptions, FirebirdTransaction, FirebirdDatabase> {

    private _connectionPool: FBConnectionPool = new FBConnectionPool();

    async isCreated(): Promise<boolean> {
        return this._connectionPool.isConnectionPoolCreated();
    }

    async attach(): Promise<FirebirdDatabase> {
        const db = await this._connectionPool.attach();
        return new FirebirdDatabase(db);
    }

    async create(options: FirebirdOptions, maxConnections?: number): Promise<void> {
        return this._connectionPool.createConnectionPool(options, maxConnections);
    }

    async destroy(): Promise<void> {
        return this._connectionPool.destroyConnectionPool();
    }
}