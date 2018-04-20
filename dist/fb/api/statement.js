"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fb = __importStar(require("node-firebird-native-api"));
const fb_utils_1 = require("./fb-utils");
const resultSet_1 = require("./resultSet");
/** Statement implementation. */
class Statement {
    constructor(attachment) {
        this.attachment = attachment;
    }
    static async prepare(attachment, transaction, sqlStmt) {
        const statement = new Statement(attachment);
        if (!attachment || !attachment.client) {
            throw new Error("Statement is already disposed.");
        }
        return await attachment.client.statusAction(async (status) => {
            //// FIXME: options/flags, dialect
            statement.statementHandle = await attachment.attachmentHandle.prepareAsync(status, transaction.transactionHandle, 0, sqlStmt, 3, fb.Statement.PREPARE_PREFETCH_ALL);
            statement.inMetadata = fb_utils_1.fixMetadata(status, await statement.statementHandle.getInputMetadataAsync(status));
            statement.outMetadata = fb_utils_1.fixMetadata(status, await statement.statementHandle.getOutputMetadataAsync(status));
            if (statement.inMetadata) {
                statement.inBuffer = new Uint8Array(statement.inMetadata.getMessageLengthSync(status));
                statement.dataWriter = fb_utils_1.createDataWriter(fb_utils_1.createDescriptors(status, statement.inMetadata));
            }
            if (statement.outMetadata) {
                statement.outBuffer = new Uint8Array(statement.outMetadata.getMessageLengthSync(status));
                statement.dataReader = fb_utils_1.createDataReader(fb_utils_1.createDescriptors(status, statement.outMetadata));
            }
            return statement;
        });
    }
    /** Disposes this statement's resources. */
    async dispose() {
        if (!this.attachment || !this.attachment.client) {
            throw new Error("Statement is already disposed.");
        }
        if (this.resultSet) {
            await this.resultSet.close();
        }
        if (this.outMetadata) {
            this.outMetadata.releaseSync();
            this.outMetadata = undefined;
        }
        if (this.inMetadata) {
            this.inMetadata.releaseSync();
            this.inMetadata = undefined;
        }
        await this.attachment.client.statusAction((status) => this.statementHandle.freeAsync(status));
        this.statementHandle = undefined;
        this.attachment.statements.delete(this);
        this.attachment = undefined;
    }
    /** Executes a prepared statement that uses the SET TRANSACTION command. Returns the new transaction. */
    async executeTransaction(transaction) {
        if (!this.attachment || !this.attachment.client) {
            throw new Error("Statement is already disposed.");
        }
        //// TODO: check opened resultSet.
        throw new Error("Uninplemented method: executeTransaction.");
    }
    /** Executes a prepared statement that has no result set. */
    async execute(transaction, parameters) {
        //// TODO: check opened resultSet.
        await this.internalExecute(transaction, parameters);
    }
    /** Executes a statement that returns a single record. */
    async executeReturning(transaction, parameters) {
        //// TODO: check opened resultSet.
        return await this.internalExecute(transaction, parameters);
    }
    /** Executes a prepared statement that has result set. */
    async executeQuery(transaction, parameters) {
        if (!this.attachment || !this.attachment.client) {
            throw new Error("Statement is already disposed.");
        }
        //// TODO: check opened resultSet.
        const resultSet = await resultSet_1.ResultSet.open(this, transaction, parameters);
        this.resultSet = resultSet;
        return resultSet;
    }
    async internalExecute(transaction, parameters) {
        if (!this.attachment || !this.attachment.client) {
            throw new Error("Statement is already disposed.");
        }
        return await this.attachment.client.statusAction(async (status) => {
            const dataWriter = this.dataWriter;
            const dataReader = this.dataReader;
            const inBuffer = this.inBuffer;
            const outBuffer = this.outBuffer;
            await dataWriter(this.attachment, transaction, inBuffer, parameters);
            const newTransaction = await this.statementHandle.executeAsync(status, transaction.transactionHandle, this.inMetadata, this.inBuffer, this.outMetadata, this.outBuffer);
            if (newTransaction && transaction.transactionHandle !== newTransaction) {
                //// FIXME: newTransaction.releaseSync();
            }
            return this.outMetadata
                ? await dataReader(this.attachment, transaction, outBuffer)
                : [];
        });
    }
}
exports.Statement = Statement;
//# sourceMappingURL=statement.js.map