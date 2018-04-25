"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AConnection_1 = require("../AConnection");
const FirebirdContext_1 = require("./FirebirdContext");
const FirebirdTransaction_1 = require("./FirebirdTransaction");
const fb_utils_1 = require("./utils/fb-utils");
class FirebirdConnection extends AConnection_1.AConnection {
    constructor() {
        super(...arguments);
        this.context = new FirebirdContext_1.FirebirdContext();
        this.transactions = new Set();
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
            return await this.context.client.dispatcher.createDatabaseAsync(status, FirebirdConnection._optionsToUri(options), dpb.length, dpb);
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
            return await this.context.client.dispatcher.attachDatabaseAsync(status, FirebirdConnection._optionsToUri(options), dpb.length, dpb);
        });
    }
    async createTransaction(options) {
        if (!this.handler) {
            throw new Error("Need database connection");
        }
        return await FirebirdTransaction_1.FirebirdTransaction.create(this, options);
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
    async isConnected() {
        return Boolean(this.handler);
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
exports.FirebirdConnection = FirebirdConnection;
//# sourceMappingURL=FirebirdConnection.js.map