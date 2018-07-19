"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AResult_1 = require("../AResult");
const BlobImpl_1 = require("./BlobImpl");
const ResultMetadata_1 = require("./ResultMetadata");
const BlobLink_1 = require("./utils/BlobLink");
const fb_utils_1 = require("./utils/fb-utils");
class Result extends AResult_1.AResult {
    constructor(statement, source) {
        super(statement);
        this.source = source;
    }
    get statement() {
        return super.statement;
    }
    get metadata() {
        return this.source.metadata;
    }
    static async get(statement, source) {
        if (Array.isArray(source)) {
            source = await statement.transaction.connection.client.statusAction(async (status) => {
                const outMetadata = fb_utils_1.fixMetadata(status, await statement.source.handler.getOutputMetadataAsync(status));
                const inBuffer = new Uint8Array(statement.source.inMetadata.getMessageLengthSync(status));
                const buffer = new Uint8Array(outMetadata.getMessageLengthSync(status));
                try {
                    await fb_utils_1.dataWrite(statement, statement.source.inDescriptors, inBuffer, source);
                    const newTransaction = await statement.source.handler.executeAsync(status, statement.transaction.handler, statement.source.inMetadata, inBuffer, outMetadata, buffer);
                    if (newTransaction && statement.transaction.handler !== newTransaction) {
                        //// FIXME: newTransaction.releaseSync();
                    }
                    return {
                        metadata: await ResultMetadata_1.ResultMetadata.getMetadata(statement),
                        buffer
                    };
                }
                finally {
                    if (outMetadata) {
                        await outMetadata.releaseAsync();
                    }
                }
            });
        }
        return new Result(statement, source);
    }
    static _throwIfBlob(value) {
        if (value instanceof BlobLink_1.BlobLink) {
            throw new Error("Invalid typecasting");
        }
    }
    getBlob(field) {
        return new BlobImpl_1.BlobImpl(this.statement.transaction, this._getValue(field));
    }
    getBoolean(field) {
        const value = this._getValue(field);
        Result._throwIfBlob(value);
        if (value === null || value === undefined) {
            return false;
        }
        return Boolean(this._getValue(field));
    }
    getDate(field) {
        const value = this._getValue(field);
        Result._throwIfBlob(value);
        if (value === null || value === undefined) {
            return null;
        }
        if (value instanceof Date) {
            return value;
        }
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }
    getNumber(field) {
        const value = this._getValue(field);
        Result._throwIfBlob(value);
        if (value === null || value === undefined) {
            return 0;
        }
        return Number.parseFloat(this._getValue(field));
    }
    getString(field) {
        const value = this._getValue(field);
        Result._throwIfBlob(value);
        if (value === null || value === undefined) {
            return "";
        }
        return String(this._getValue(field));
    }
    async getAny(field) {
        const value = this._getValue(field);
        if (value instanceof BlobLink_1.BlobLink) {
            const descriptor = this.getOutDescriptor(field);
            if (descriptor.subType === fb_utils_1.SQL_BLOB_SUB_TYPE.TEXT) {
                return await this.getBlob(field).asString();
            }
            else {
                return await this.getBlob(field).asBuffer();
            }
        }
        return value;
    }
    async getAll() {
        const result = [];
        for (let i = 0; i < this.metadata.columnCount; i++) {
            result.push(await this.getAny(i));
        }
        return result;
    }
    isNull(field) {
        const value = this._getValue(field);
        return value === null || value === undefined;
    }
    _getValue(field) {
        const descriptor = this.getOutDescriptor(field);
        return fb_utils_1.bufferToValue(this.statement, descriptor, this.source.buffer);
    }
    getOutDescriptor(field) {
        const outDescriptors = this.source.metadata.descriptors;
        if (typeof field === "number") {
            if (field >= outDescriptors.length) {
                throw new Error("Index not found");
            }
            return outDescriptors[field];
        }
        else {
            const outDescriptor = outDescriptors.find((item) => item.alias === field);
            if (!outDescriptor) {
                throw new Error("Name not found");
            }
            return outDescriptor;
        }
    }
}
exports.Result = Result;
//# sourceMappingURL=Result.js.map