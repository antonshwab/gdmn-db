"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blobStream_1 = require("./blobStream");
const fb_utils_1 = require("./fb-utils");
const statement_1 = require("./statement");
const transaction_1 = require("./transaction");
/** Attachment implementation. */
class Attachment {
    constructor(client) {
        this.client = client;
        this.statements = new Set();
        this.transactions = new Set();
    }
    static async connect(client, uri, options) {
        const attachment = new Attachment(client);
        return await client.statusAction(async (status) => {
            const dpb = fb_utils_1.createDpb(options);
            attachment.attachmentHandle = await client.dispatcher.attachDatabaseAsync(status, uri, dpb.length, dpb);
            return attachment;
        });
    }
    static async createDatabase(client, uri, options) {
        const attachment = new Attachment(client);
        return await client.statusAction(async (status) => {
            const dpb = fb_utils_1.createDpb(options);
            attachment.attachmentHandle = await client.dispatcher.createDatabaseAsync(status, uri, dpb.length, dpb);
            return attachment;
        });
    }
    /** Disconnects this attachment. */
    async disconnect() {
        this.check();
        await this.preDispose();
        if (this.client) {
            await this.client.statusAction((status) => this.attachmentHandle.detachAsync(status));
        }
        this.attachmentHandle = undefined;
        await this.postDispose();
    }
    /** Drops the database and release this attachment. */
    async dropDatabase() {
        this.check();
        await this.preDispose();
        if (this.client) {
            await this.client.statusAction((status) => this.attachmentHandle.dropDatabaseAsync(status));
        }
        this.attachmentHandle = undefined;
        await this.postDispose();
    }
    /** Executes a statement that uses the SET TRANSACTION command. Returns the new transaction. */
    async executeTransaction(transaction, sqlStmt) {
        this.check();
        const statement = await this.prepare(transaction, sqlStmt);
        try {
            const newTransaction = await statement.executeTransaction(transaction);
            this.transactions.add(newTransaction);
            return newTransaction;
        }
        finally {
            await statement.dispose();
        }
    }
    /** Executes a statement that has no result set. */
    async execute(transaction, sqlStmt, parameters) {
        this.check();
        const statement = await this.prepare(transaction, sqlStmt);
        try {
            return await statement.execute(transaction, parameters);
        }
        finally {
            await statement.dispose();
        }
    }
    /** Executes a statement that returns a single record. */
    async executeReturning(transaction, sqlStmt, parameters) {
        this.check();
        const statement = await this.prepare(transaction, sqlStmt);
        try {
            return await statement.executeReturning(transaction, parameters);
        }
        finally {
            await statement.dispose();
        }
    }
    /** Executes a statement that has result set. */
    async executeQuery(transaction, sqlStmt, parameters) {
        this.check();
        const statement = await this.prepare(transaction, sqlStmt);
        try {
            const resultSet = await statement.executeQuery(transaction, parameters);
            resultSet.diposeStatementOnClose = true;
            return resultSet;
        }
        catch (e) {
            await statement.dispose();
            throw e;
        }
    }
    async createBlob(transaction) {
        return await blobStream_1.BlobStream.create(this, transaction);
    }
    async openBlob(transaction, blob) {
        return await blobStream_1.BlobStream.open(this, transaction, blob);
    }
    /** Starts a new transaction. */
    async startTransaction(options) {
        this.check();
        const transaction = await transaction_1.Transaction.start(this, options);
        this.transactions.add(transaction);
        return transaction;
    }
    /** Prepares a query. */
    async prepare(transaction, sqlStmt) {
        this.check();
        const statement = await statement_1.Statement.prepare(this, transaction, sqlStmt);
        this.statements.add(statement);
        return statement;
    }
    check() {
        if (!this.client) {
            throw new Error("Attachment is already disconnected.");
        }
    }
    async preDispose() {
        try {
            await Promise.all(Array.from(this.statements).map((statement) => statement.dispose()));
            await Promise.all(Array.from(this.transactions).map((transaction) => transaction.rollback()));
        }
        finally {
            this.statements.clear();
            this.transactions.clear();
        }
    }
    async postDispose() {
        this.client.attachments.delete(this);
        this.client = undefined;
    }
}
exports.Attachment = Attachment;
//# sourceMappingURL=attachment.js.map