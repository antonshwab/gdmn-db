"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const AConnectionPool_1 = require("../AConnectionPool");
const FirebirdDatabase2_1 = require("./FirebirdDatabase2");
class FirebirdConnectionPool2 extends AConnectionPool_1.AConnectionPool {
    constructor() {
        super(...arguments);
        this._event = new events_1.EventEmitter();
        this._connectionPool = null;
    }
    async isCreated() {
        return Boolean(this._connectionPool);
    }
    async get() {
        if (!this._connectionPool)
            throw new Error("Connection pool need created");
        const connection = this.useReleasedConnection();
        if (connection)
            return connection.proxyDb;
        if (this._connectionPool.connections.length < this._connectionPool.max) {
            const connection = await this.createAndUseConnection();
            return connection.proxyDb;
        }
        const waitDatabase = new Promise(resolve => {
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
    async create(options, maxConnections = 10) {
        if (this._connectionPool)
            throw new Error("Connection pool already created");
        this._connectionPool = {
            options: options,
            max: maxConnections,
            connections: []
        };
    }
    async destroy() {
        if (!this._connectionPool)
            throw new Error("Connection pool need created");
        const promises = this._connectionPool.connections.map(async (connection) => {
            if (connection.proxyDb) {
                await connection.proxyDb.disconnect();
            }
            await connection.db.disconnect();
        });
        await Promise.all(promises);
        this._connectionPool = null;
    }
    async createAndUseConnection() {
        if (this._connectionPool) {
            this._connectionPool.connections.push({
                db: new FirebirdDatabase2_1.FirebirdDatabase2(),
                proxyDb: null
            });
            const connection = this.useReleasedConnection();
            if (connection) {
                await connection.db.connect(this._connectionPool.options);
                return connection;
            }
        }
        throw new Error("This error should never been happen");
    }
    useReleasedConnection() {
        if (!this._connectionPool)
            return null;
        const connection = this._connectionPool.connections.find(connection => !connection.proxyDb);
        if (connection) {
            connection.proxyDb = new FirebirdDatabaseProxy2(connection.db, () => {
                connection.proxyDb = null;
                this._event.emit(FirebirdConnectionPool2.EVENT_RELEASE, connection);
            });
            return connection;
        }
        return null;
    }
}
FirebirdConnectionPool2.EVENT_RELEASE = "release";
exports.FirebirdConnectionPool2 = FirebirdConnectionPool2;
class FirebirdDatabaseProxy2 extends FirebirdDatabase2_1.FirebirdDatabase2 {
    constructor(database, releaseFunc) {
        super();
        this._database = database;
        this._releaseFunc = releaseFunc;
    }
    async createDatabase(options) {
        throw new Error("Invalid operation for connection from the pool");
    }
    async dropDatabase() {
        throw new Error("Invalid operation for connection from the pool");
    }
    async connect(options) {
        throw new Error("Invalid operation for connection from the pool");
    }
    async createTransaction() {
        if (!this._database)
            throw new Error("Need database connection");
        return await this._database.createTransaction();
    }
    async disconnect() {
        if (!this._database)
            throw new Error("Need database connection");
        this._database = null;
        this._releaseFunc();
    }
    async isConnected() {
        if (!this._database)
            return false;
        return await this._database.isConnected();
    }
}
//# sourceMappingURL=FirebirdConnectionPool2.js.map