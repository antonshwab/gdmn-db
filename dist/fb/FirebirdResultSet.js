"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_native_api_1 = require("node-firebird-native-api");
const AResultSet_1 = require("../AResultSet");
const FirebirdBlob_1 = require("./FirebirdBlob");
const FirebirdBlobLink_1 = require("./FirebirdBlobLink");
const fb_utils_1 = require("./utils/fb-utils");
class FirebirdResultSet extends AResultSet_1.AResultSet {
    constructor(parent, source) {
        super();
        this.disposeStatementOnClose = false;
        this._buffers = [];
        this._currentIndex = AResultSet_1.AResultSet.NO_INDEX;
        this._finished = false;
        this.parent = parent;
        this.source = source;
        this.parent.resultSets.add(this);
    }
    get position() {
        this._checkClosed();
        return this._currentIndex;
    }
    static async open(parent, params) {
        const source = await parent.parent.parent.context.statusAction(async (status) => {
            const inBuffer = new Uint8Array(parent.source.inMetadata.getMessageLengthSync(status));
            const outBuffer = new Uint8Array(parent.source.outMetadata.getMessageLengthSync(status));
            await fb_utils_1.dataWrite(parent, parent.source.inDescriptors, inBuffer, params);
            const handler = await parent.source.handler.openCursorAsync(status, parent.parent.handler, parent.source.inMetadata, inBuffer, parent.source.outMetadata, 0);
            return {
                handler: handler,
                outBuffer
            };
        });
        return new FirebirdResultSet(parent, source);
    }
    static _throwIfBlob(value) {
        if (value instanceof FirebirdBlobLink_1.FirebirdBlobLink) {
            throw new Error("Invalid typecasting");
        }
    }
    async next() {
        this._checkClosed();
        if (this._currentIndex < this._buffers.length) {
            this._currentIndex++;
            if (this._currentIndex === this._buffers.length) {
                if (!this._finished) {
                    const newResult = await this._fetch({ fetchSize: 1 });
                    if (newResult) {
                        this._buffers.push(newResult[0]);
                        return true;
                    }
                }
                return false;
            }
            return true;
        }
        return false;
    }
    async previous() {
        this._checkClosed();
        if (this._currentIndex > AResultSet_1.AResultSet.NO_INDEX) {
            this._currentIndex--;
            return this._currentIndex !== AResultSet_1.AResultSet.NO_INDEX;
        }
        return false;
    }
    async to(i) {
        this._checkClosed();
        if (i < AResultSet_1.AResultSet.NO_INDEX) {
            return false;
        }
        if (this._currentIndex < i) {
            while (await this.next()) {
                if (this._currentIndex === i) {
                    return true;
                }
            }
            return false;
        }
        if (this._currentIndex > i) {
            while (await this.previous()) {
                if (this._currentIndex === i) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    async beforeFirst() {
        this._checkClosed();
        if (!this._finished) {
            const index = this._currentIndex;
            await this.next();
            await this.to(index);
        }
        if (this._buffers.length) {
            await this.to(AResultSet_1.AResultSet.NO_INDEX);
        }
    }
    async afterLast() {
        this._checkClosed();
        if (!this._finished) {
            const index = this._currentIndex;
            await this.last();
            await this.to(index);
        }
        if (this._buffers.length) {
            await this.to(this._buffers.length);
        }
    }
    async first() {
        this._checkClosed();
        this._currentIndex = AResultSet_1.AResultSet.NO_INDEX;
        return await this.next();
    }
    async last() {
        this._checkClosed();
        while (await this.next()) {
            // nothing
        }
        if (this._buffers.length) {
            return await this.to(this._buffers.length - 1);
        }
        return false;
    }
    async isBeforeFirst() {
        this._checkClosed();
        if (this._currentIndex === AResultSet_1.AResultSet.NO_INDEX) {
            const firstExists = await this.next();
            await this.previous();
            return firstExists;
        }
        return false;
    }
    async isAfterLast() {
        this._checkClosed();
        if (this._finished) {
            return !!this._buffers.length && this._currentIndex === this._buffers.length;
        }
        return false;
    }
    async isFirst() {
        this._checkClosed();
        return !!this._buffers.length && this._currentIndex === 0;
    }
    async isLast() {
        this._checkClosed();
        if (this._currentIndex === AResultSet_1.AResultSet.NO_INDEX) {
            return false;
        }
        if (!this._finished) {
            await this.next();
            await this.previous();
        }
        return this._currentIndex === this._buffers.length - 1;
    }
    async isClosed() {
        return !this.source;
    }
    async close() {
        this._checkClosed();
        await this.parent.parent.parent.context.statusAction((status) => this.source.handler.closeAsync(status));
        this.source = undefined;
        this._buffers = [];
        this._currentIndex = AResultSet_1.AResultSet.NO_INDEX;
        this.parent.resultSets.delete(this);
        if (this.disposeStatementOnClose) {
            await this.parent.dispose();
        }
    }
    getBlob(field) {
        return new FirebirdBlob_1.FirebirdBlob(this, this._getValue(field));
    }
    getBoolean(field) {
        const value = this._getValue(field);
        FirebirdResultSet._throwIfBlob(value);
        if (value === null || value === undefined) {
            return false;
        }
        return Boolean(this._getValue(field));
    }
    getDate(field) {
        const value = this._getValue(field);
        FirebirdResultSet._throwIfBlob(value);
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
        FirebirdResultSet._throwIfBlob(value);
        if (value === null || value === undefined) {
            return 0;
        }
        return Number.parseFloat(this._getValue(field));
    }
    getString(field) {
        const value = this._getValue(field);
        FirebirdResultSet._throwIfBlob(value);
        if (value === null || value === undefined) {
            return "";
        }
        return String(this._getValue(field));
    }
    async getAny(field) {
        const value = this._getValue(field);
        if (value instanceof FirebirdBlobLink_1.FirebirdBlobLink) {
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
        return fb_utils_1.bufferToValue(this.parent, descriptor, this._buffers[this._currentIndex]);
    }
    getOutDescriptor(field) {
        this._checkClosed();
        const outDescriptors = this.parent.source.outDescriptors;
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
    async _fetch(options) {
        this._checkClosed();
        if (this._finished) {
            return [];
        }
        const fetchRet = await this.parent.parent.parent.context.statusAction(async (status) => {
            const rows = [];
            const buffers = [
                this.source.outBuffer,
                new Uint8Array(this.parent.source.outMetadata.getMessageLengthSync(status))
            ];
            let buffer = 0;
            let nextFetch = this.source.handler.fetchNextAsync(status, buffers[buffer]);
            while (true) {
                if (await nextFetch === node_firebird_native_api_1.Status.RESULT_OK) {
                    const buffer1 = buffer;
                    buffer = ++buffer % 2;
                    const finish = options && options.fetchSize && rows.length + 1 >= options.fetchSize;
                    if (!finish) {
                        nextFetch = this.source.handler.fetchNextAsync(status, buffers[buffer]);
                    }
                    rows.push(buffers[buffer1]);
                    if (finish) {
                        return { finished: false, rows };
                    }
                }
                else {
                    return { finished: true, rows };
                }
            }
        });
        if (fetchRet.finished) {
            this._finished = true;
            return;
        }
        return fetchRet.rows;
    }
}
exports.FirebirdResultSet = FirebirdResultSet;
//# sourceMappingURL=FirebirdResultSet.js.map