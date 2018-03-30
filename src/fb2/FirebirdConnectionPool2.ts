import {EventEmitter} from "events";
import {AConnectionPool} from "../AConnectionPool";
import {FirebirdTransaction2} from "./FirebirdTransaction2";
import {FirebirdResultSet2} from "./FirebirdResultSet2";
import {FirebirdDatabase2, FirebirdOptions2} from "./FirebirdDatabase2";

interface FirebirdConnection2 {
    db: FirebirdDatabase2;
    proxyDb?: FirebirdDatabaseProxy2;
}

export class FirebirdConnectionPool2 extends AConnectionPool<FirebirdOptions2, FirebirdResultSet2, FirebirdTransaction2,
    FirebirdDatabase2> {

    private static EVENT_RELEASE = "release";

    private _event = new EventEmitter();
    private _options: FirebirdOptions2 = null;
    private _max: number = -1;
    private _connectionPool: FirebirdConnection2[] = null;

    async isCreated(): Promise<boolean> {
        return Boolean(this._connectionPool);
    }

    async get(): Promise<FirebirdDatabase2> {
        if (!this._connectionPool) throw new Error("Connection pool need created");
        const connection = this.useReleasedConnection();
        if (connection) return connection.proxyDb;

        if (this._connectionPool.length < this._max) {
            const connection = await this.createAndUseConnection();
            return connection.proxyDb;
        }

        const waitDatabase = new Promise<FirebirdDatabase2>(resolve => {
            const callback = () => {
                const connection = this.useReleasedConnection();
                if (connection) {
                    this._event.removeListener(FirebirdConnectionPool2.EVENT_RELEASE, callback);
                    resolve(connection.proxyDb);
                }
            };
            this._event.on(FirebirdConnectionPool2.EVENT_RELEASE, callback);
        });
        return await waitDatabase;
    }

    async create(options: FirebirdOptions2, maxConnections?: number): Promise<void> {
        if (this._connectionPool) throw new Error("Connection pool already created");
        this._options = options;
        this._max = maxConnections;
        this._connectionPool = [];
    }

    async destroy(): Promise<void> {
        if (!this._connectionPool) throw new Error("Connection pool need created");
        const promises = this._connectionPool.map(async connection => {
            if (connection.proxyDb) {
                await connection.proxyDb.disconnect();
            }
            await connection.db.disconnect();
        });
        await Promise.all(promises);
        this._max = -1;
        this._connectionPool = null;
    }

    private async createAndUseConnection(): Promise<FirebirdConnection2> {
        let connection: FirebirdConnection2 = {db: new FirebirdDatabase2()};
        this._connectionPool.push(connection);
        connection = this.useReleasedConnection();
        await connection.db.connect(this._options);
        return connection;
    }

    private useReleasedConnection(): null | FirebirdConnection2 {
        const connection = this._connectionPool.find(connection => !connection.proxyDb);
        if (connection) {
            connection.proxyDb = new FirebirdDatabaseProxy2(connection.db, () => {
                connection.proxyDb = null;
                this._event.emit(FirebirdConnectionPool2.EVENT_RELEASE, connection);
            });
        }
        return connection;
    }
}

class FirebirdDatabaseProxy2 extends FirebirdDatabase2 {

    private _database: FirebirdDatabase2;
    private readonly _releaseFunc: () => void;

    constructor(database: FirebirdDatabase2, releaseFunc: () => void) {
        super();
        this._database = database;
        this._releaseFunc = releaseFunc;
    }

    async createDatabase(options: FirebirdOptions2): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    async dropDatabase(): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    async connect(options: FirebirdOptions2): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    async createTransaction(): Promise<FirebirdTransaction2> {
        if (!this._database) throw new Error("Need database connection");
        return await this._database.createTransaction();
    }

    async disconnect(): Promise<void> {
        if (!this._database) throw new Error("Need database connection");
        this._database = null;
        this._releaseFunc();
    }

    async isConnected(): Promise<boolean> {
        if (!this._database) return false;
        return await this._database.isConnected();
    }
}