"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_native_api_1 = require("node-firebird-native-api");
const AResultSet_1 = require("../AResultSet");
const Result_1 = require("./Result");
const ResultMetadata_1 = require("./ResultMetadata");
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
        return this.source.result.metadata;
    }
    static async open(statement, params, type) {
        const source = await statement.transaction.connection.client.statusAction(async (status) => {
            const outMetadata = fb_utils_1.fixMetadata(status, await statement.source.handler.getOutputMetadataAsync(status));
            const inBuffer = new Uint8Array(statement.source.inMetadata.getMessageLengthSync(status));
            const buffer = new Uint8Array(outMetadata.getMessageLengthSync(status));
            try {
                await fb_utils_1.dataWrite(statement, statement.source.inDescriptors, inBuffer, params);
                const handler = await statement.source.handler.openCursorAsync(status, statement.transaction.handler, statement.source.inMetadata, inBuffer, outMetadata, type || AResultSet_1.AResultSet.DEFAULT_TYPE === AResultSet_1.CursorType.SCROLLABLE
                    ? node_firebird_native_api_1.Statement.CURSOR_TYPE_SCROLLABLE : 0);
                return {
                    handler: handler,
                    result: await Result_1.Result.get(statement, { metadata: await ResultMetadata_1.ResultMetadata.getMetadata(statement), buffer })
                };
            }
            finally {
                if (outMetadata) {
                    await outMetadata.releaseAsync();
                }
            }
        });
        return new ResultSet(statement, source, type);
    }
    async next() {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchNextAsync(status, this.source.result.source.buffer)));
    }
    async previous() {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchPriorAsync(status, this.source.result.source.buffer)));
    }
    async absolute(i) {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchAbsoluteAsync(status, i, this.source.result.source.buffer)));
    }
    async relative(i) {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchRelativeAsync(status, i, this.source.result.source.buffer)));
    }
    async first() {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchFirstAsync(status, this.source.result.source.buffer)));
    }
    async last() {
        this._checkClosed();
        return await this._executeMove((status) => (this.source.handler.fetchLastAsync(status, this.source.result.source.buffer)));
    }
    async close() {
        this._checkClosed();
        await this.statement.transaction.connection.client
            .statusAction((status) => this.source.handler.closeAsync(status));
        this.source = undefined;
        this.statement.resultSets.delete(this);
        if (this.disposeStatementOnClose) {
            await this.statement.dispose();
        }
    }
    async isBof() {
        this._checkClosed();
        return await this.statement.transaction.connection.client.statusAction(async (status) => {
            return await this.source.handler.isBofAsync(status);
        });
    }
    async isEof() {
        this._checkClosed();
        return await this.statement.transaction.connection.client.statusAction(async (status) => {
            return await this.source.handler.isEofAsync(status);
        });
    }
    getBlob(field) {
        this._checkClosed();
        return this.source.result.getBlob(field);
    }
    getBoolean(field) {
        this._checkClosed();
        return this.source.result.getBoolean(field);
    }
    getDate(field) {
        this._checkClosed();
        return this.source.result.getDate(field);
    }
    getNumber(field) {
        this._checkClosed();
        return this.source.result.getNumber(field);
    }
    getString(field) {
        this._checkClosed();
        return this.source.result.getString(field);
    }
    async getAny(field) {
        this._checkClosed();
        return this.source.result.getAny(field);
    }
    async getAll() {
        this._checkClosed();
        return this.source.result.getAll();
    }
    isNull(field) {
        this._checkClosed();
        return this.source.result.isNull(field);
    }
    _checkClosed() {
        if (!this.source) {
            throw new Error("ResultSet is closed");
        }
    }
    async _executeMove(callback) {
        let result = ResultStatus.ERROR;
        try {
            result = await this.statement.transaction.connection.client.statusAction(async (status) => {
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