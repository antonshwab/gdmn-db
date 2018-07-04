"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AConnection_1 = require("../AConnection");
const Client_1 = require("./Client");
const Statement_1 = require("./Statement");
const Transaction_1 = require("./Transaction");
const fb_utils_1 = require("./utils/fb-utils");
class Connection extends AConnection_1.AConnection {
    constructor() {
        super(...arguments);
        this.client = new Client_1.Client();
        this.transactions = new Set();
    }
    get connected() {
        if (this.handler) {
            // this.client.statusActionSync((status) => this.handler!.pingSync(status));
            try {
                this.client.statusActionSync((status) => {
                    const infoReq = new Uint8Array([fb_utils_1.blobInfo.totalLength]);
                    const infoRet = new Uint8Array(20);
                    this.handler.getInfoSync(status, infoReq.byteLength, infoReq, infoRet.byteLength, infoRet);
                });
            }
            catch (error) {
                return false;
            }
            return true;
        }
        return false;
    }
    static _optionsToUri(options) {
        let url = "";
        if (options.host) {
            url += options.host;
        }
        if (options.port) {
            url += `/${options.port}`;
        }
        if (url) {
            url += ":";
        }
        url += options.path;
        return url;
    }
    async createDatabase(options) {
        if (this.handler) {
            throw new Error("Database already connected");
        }
        await this.client.create();
        this.handler = await this.client.statusAction(async (status) => {
            const dpb = fb_utils_1.createDpb(options);
            return await this.client.client.dispatcher.createDatabaseAsync(status, Connection._optionsToUri(options), dpb.length, dpb);
        });
    }
    async dropDatabase() {
        if (!this.handler) {
            throw new Error("Need database connection");
        }
        await this._closeChildren();
        await this.client.statusAction((status) => this.handler.dropDatabaseAsync(status));
        this.handler = undefined;
        await this.client.destroy();
    }
    async connect(options) {
        if (this.handler) {
            throw new Error("Database already connected");
        }
        await this.client.create();
        this.handler = await this.client.statusAction(async (status) => {
            const dpb = fb_utils_1.createDpb(options);
            return await this.client.client.dispatcher.attachDatabaseAsync(status, Connection._optionsToUri(options), dpb.length, dpb);
        });
    }
    async startTransaction(options) {
        if (!this.handler) {
            throw new Error("Need database connection");
        }
        return await Transaction_1.Transaction.create(this, options);
    }
    async disconnect() {
        if (!this.handler) {
            throw new Error("Need database connection");
        }
        await this._closeChildren();
        await this.client.statusAction((status) => this.handler.detachAsync(status));
        await this.client.destroy();
        this.handler = undefined;
    }
    async execute(transaction, sql, params) {
        const statement = await Statement_1.Statement.prepare(transaction, sql);
        await statement.execute(params);
        await statement.dispose();
    }
    async executeQuery(transaction, sql, params, type) {
        if (transaction.finished) {
            throw new Error("Need to open transaction");
        }
        const statement = await Statement_1.Statement.prepare(transaction, sql);
        const resultSet = await statement.executeQuery(params, type);
        resultSet.disposeStatementOnClose = true;
        return resultSet;
    }
    async prepare(transaction, sql) {
        if (transaction.finished) {
            throw new Error("Need to open transaction");
        }
        return await Statement_1.Statement.prepare(transaction, sql);
    }
    async _closeChildren() {
        if (this.transactions.size) {
            console.warn("Not all transactions finished, they will be rollbacked");
        }
        await Promise.all(Array.from(this.transactions).reduceRight((promises, transaction) => {
            promises.push(transaction.rollback());
            return promises;
        }, []));
    }
}
exports.Connection = Connection;
//# sourceMappingURL=Connection.js.map