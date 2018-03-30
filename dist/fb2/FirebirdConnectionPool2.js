"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const AConnectionPool_1 = require("../AConnectionPool");
const FirebirdDatabase2_1 = require("./FirebirdDatabase2");
class FirebirdConnectionPool2 extends AConnectionPool_1.AConnectionPool {
    constructor() {
        super(...arguments);
        this._event = new events_1.EventEmitter();
        this._options = null;
        this._max = -1;
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
        if (this._connectionPool.length < this._max) {
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
    async create(options, maxConnections) {
        if (this._connectionPool)
            throw new Error("Connection pool already created");
        this._options = options;
        this._max = maxConnections;
        this._connectionPool = [];
    }
    async destroy() {
        if (!this._connectionPool)
            throw new Error("Connection pool need created");
        const promises = this._connectionPool.map(async (connection) => {
            if (connection.proxyDb) {
                await connection.proxyDb.disconnect();
            }
            await connection.db.disconnect();
        });
        await Promise.all(promises);
        this._max = -1;
        this._connectionPool = null;
    }
    async createAndUseConnection() {
        let connection = { db: new FirebirdDatabase2_1.FirebirdDatabase2() };
        this._connectionPool.push(connection);
        connection = this.useReleasedConnection();
        await connection.db.connect(this._options);
        return connection;
    }
    useReleasedConnection() {
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