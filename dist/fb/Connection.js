"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AConnection_1 = require("../AConnection");
const Context_1 = require("./Context");
const Statement_1 = require("./Statement");
const Transaction_1 = require("./Transaction");
const fb_utils_1 = require("./utils/fb-utils");
class Connection extends AConnection_1.AConnection {
    constructor() {
        super(...arguments);
        this.context = new Context_1.Context();
        this.transactions = new Set();
        this.statements = new Set();
    }
    get connected() {
        return Boolean(this.handler);
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
        this.context.create();
        this.handler = await this.context.statusAction(async (status) => {
            const dpb = fb_utils_1.createDpb(options);
            return await this.context.client.dispatcher.createDatabaseAsync(status, Connection._optionsToUri(options), dpb.length, dpb);
        });
    }
    async dropDatabase() {
        if (!this.handler) {
            throw new Error("Need database connection");
        }
        await this._closeChildren();
        await this.context.statusAction((status) => this.handler.dropDatabaseAsync(status));
        this.handler = undefined;
        this.context.destroy();
    }
    async connect(options) {
        if (this.handler) {
            throw new Error("Database already connected");
        }
        this.context.create();
        this.handler = await this.context.statusAction(async (status) => {
            const dpb = fb_utils_1.createDpb(options);
            return await this.context.client.dispatcher.attachDatabaseAsync(status, Connection._optionsToUri(options), dpb.length, dpb);
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
        await this.context.statusAction((status) => this.handler.detachAsync(status));
        this.handler = undefined;
        this.context.destroy();
    }
    async execute(transaction, sql, params) {
        return undefined;
    }
    async executeQuery(transaction, sql, params, type) {
        if (transaction.finished) {
            throw new Error("Need absolute open transaction");
        }
        const statement = await Statement_1.Statement.prepare(transaction, sql);
        const resultSet = await statement.executeQuery(params, type);
        resultSet.disposeStatementOnClose = true;
        return resultSet;
    }
    async prepare(transaction, sql) {
        if (transaction.finished) {
            throw new Error("Need absolute open transaction");
        }
        return await Statement_1.Statement.prepare(transaction, sql);
    }
    async _closeChildren() {
        if (this.statements.size) {
            console.warn("Not all statements disposed, they will be disposed");
        }
        await Promise.all(Array.from(this.statements).reduceRight((promises, statement) => {
            promises.push(statement.dispose());
            return promises;
        }, []));
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