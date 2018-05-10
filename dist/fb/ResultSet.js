"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_native_api_1 = require("node-firebird-native-api");
const AResultSet_1 = require("../AResultSet");
const BlobImpl_1 = require("./BlobImpl");
const BlobLink_1 = require("./BlobLink");
const ResultSetMetadata_1 = require("./ResultSetMetadata");
const fb_utils_1 = require("./utils/fb-utils");
var ResultStatus;
(function (ResultStatus) {
    ResultStatus[ResultStatus["ERROR"] = node_firebird_native_api_1.Status.RESULT_ERROR] = "ERROR";
    ResultStatus[ResultStatus["NO_DATA"] = node_firebird_native_api_1.Status.RESULT_NO_DATA] = "NO_DATA";
    ResultStatus[ResultStatus["OK"] = node_firebird_native_api_1.Status.RESULT_OK] = "OK";
    ResultStatus[ResultStatus["SEGMENT"] = node_firebird_native_api_1.Status.RESULT_SEGMENT] = "SEGMENT";
})(ResultStatus || (ResultStatus = {}));
class ResultSet extends AResultSet_1.AResultSet {
    constructor(statement, source, type) {
        super(statement, type);
        this.disposeStatementOnClose = false;
        this.source = source;
        this.statement.resultSets.add(this);
    }
    get statement() {
        return super.statement;
    }
    get closed() {
        return !this.source;
    }
    get metadata() {
        this._checkClosed();
        return this.source.metadata;
    }
    static async open(statement, params, type) {
        const source = await statement.transaction.connection.context.statusAction(async (status) => {
            const metadata = await ResultSetMetadata_1.ResultSetMetadata.getMetadata(statement);
            const inBuffer = new Uint8Array(statement.source.inMetadata.getMessageLengthSync(status));
            const outBuffer = new Uint8Array(metadata.handler.getMessageLengthSync(status));
            await fb_utils_1.dataWrite(statement, statement.source.inDescriptors, inBuffer, params);
            const handler = await statement.source.handler.openCursorAsync(status, statement.transaction.handler, statement.source.inMetadata, inBuffer, metadata.handler, type || AResultSet_1.AResultSet.DEFAULT_TYPE === AResultSet_1.CursorType.SCROLLABLE ? node_firebird_native_api_1.Statement.CURSOR_TYPE_SCROLLABLE : 0);
            // TODO IStatement::CURSOR_TYPE_SCROLLABLE optional
            return {
                handler: handler,
                metadata,
                outBuffer
            };
        });
        return new ResultSet(statement, source, type);
    }
    static _throwIfBlob(value) {
        if (value instanceof BlobLink_1.BlobLink) {
            throw new Error("Invalid typecasting");
        }
    }
    async next() {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchNextAsync(status, this.source.outBuffer)));
    }
    async previous() {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchPriorAsync(status, this.source.outBuffer)));
    }
    async absolute(i) {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchAbsoluteAsync(status, i, this.source.outBuffer)));
    }
    async relative(i) {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchRelativeAsync(status, i, this.source.outBuffer)));
    }
    async first() {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchFirstAsync(status, this.source.outBuffer)));
    }
    async last() {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchLastAsync(status, this.source.outBuffer)));
    }
    async close() {
        this._checkClosed();
        await this.source.metadata.release();
        await this.statement.transaction.connection.context
            .statusAction((status) => this.source.handler.closeAsync(status));
        this.source = undefined;
        this.statement.resultSets.delete(this);
        if (this.disposeStatementOnClose) {
            await this.statement.dispose();
        }
    }
    async isBof() {
        this._checkClosed();
        return await this.statement.transaction.connection.context.statusAction(async (status) => {
            return await this.source.handler.isBofAsync(status);
        });
    }
    async isEof() {
        this._checkClosed();
        return await this.statement.transaction.connection.context.statusAction(async (status) => {
            return await this.source.handler.isEofAsync(status);
        });
    }
    getBlob(field) {
        return new BlobImpl_1.BlobImpl(this, this._getValue(field));
    }
    getBoolean(field) {
        const value = this._getValue(field);
        ResultSet._throwIfBlob(value);
        if (value === null || value === undefined) {
            return false;
        }
        return Boolean(this._getValue(field));
    }
    getDate(field) {
        const value = this._getValue(field);
        ResultSet._throwIfBlob(value);
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
        ResultSet._throwIfBlob(value);
        if (value === null || value === undefined) {
            return 0;
        }
        return Number.parseFloat(this._getValue(field));
    }
    getString(field) {
        const value = this._getValue(field);
        ResultSet._throwIfBlob(value);
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
    isNull(field) {
        const value = this._getValue(field);
        return value === null || value === undefined;
    }
    _getValue(field) {
        this._checkClosed();
        const descriptor = this.getOutDescriptor(field);
        return fb_utils_1.bufferToValue(this.statement, descriptor, this.source.outBuffer);
    }
    getOutDescriptor(field) {
        this._checkClosed();
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
    _checkClosed() {
        if (!this.source) {
            throw new Error("ResultSet is closed");
        }
    }
    async _executeMove(callback) {
        let result = ResultStatus.ERROR;
        try {
            result = await this.statement.transaction.connection.context.statusAction(async (status) => {
                return await callback(status);
            });
        }
        catch (error) {
            throw error; // TODO replace on own errors
        }
        return result === node_firebird_native_api_1.Status.RESULT_OK;
    }
}
exports.ResultSet = ResultSet;
//# sourceMappingURL=ResultSet.js.map