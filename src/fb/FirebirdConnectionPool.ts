import {AConnectionPool} from "../AConnectionPool";
import {FirebirdTransaction} from "./FirebirdTransaction";
import {FirebirdResultSet} from "./FirebirdResultSet";
import {FirebirdDatabase, FirebirdOptions} from "./FirebirdDatabase";
import {FBConnectionPool} from "./driver/FBDatabase";

export class FirebirdConnectionPool extends AConnectionPool<FirebirdOptions, FirebirdResultSet, FirebirdTransaction,
    FirebirdDatabase> {

    private readonly _connectionPool: FBConnectionPool = new FBConnectionPool();

    async isCreated(): Promise<boolean> {
        return this._connectionPool.isConnectionPoolCreated();
    }

    async get(): Promise<FirebirdDatabase> {
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