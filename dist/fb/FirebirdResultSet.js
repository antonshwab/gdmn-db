"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_driver_native_1 = require("node-firebird-driver-native");
const stream_1 = require("stream");
const AResultSet_1 = require("../AResultSet");
var Status;
(function (Status) {
    Status[Status["UNFINISHED"] = 0] = "UNFINISHED";
    Status[Status["FINISHED"] = 1] = "FINISHED";
    Status[Status["CLOSED"] = 2] = "CLOSED";
})(Status || (Status = {}));
class FirebirdResultSet extends AResultSet_1.AResultSet {
    constructor(connect, transaction, resultSet) {
        super();
        this._data = [];
        this._currentIndex = AResultSet_1.AResultSet.NO_INDEX;
        this._status = Status.UNFINISHED;
        this._connection = connect;
        this._transaction = transaction;
        this._resultSet = resultSet;
    }
    get position() {
        this._checkClosed();
        return this._currentIndex;
    }
    async next() {
        this._checkClosed();
        if (this._currentIndex < this._data.length) {
            this._currentIndex++;
            if (this._currentIndex === this._data.length) {
                if (this._status === Status.UNFINISHED) {
                    const newResult = await this._resultSet.fetch({ fetchSize: 1 });
                    if (newResult.length) {
                        this._data.push(newResult[0]);
                        return true;
                    }
                    else {
                        this._status = Status.FINISHED;
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
        if (this._status === Status.UNFINISHED) {
            const index = this._currentIndex;
            await this.next();
            await this.to(index);
        }
        if (this._data.length) {
            await this.to(AResultSet_1.AResultSet.NO_INDEX);
        }
    }
    async afterLast() {
        this._checkClosed();
        if (this._status === Status.UNFINISHED) {
            const index = this._currentIndex;
            await this.last();
            await this.to(index);
        }
        if (this._data.length) {
            await this.to(this._data.length);
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
        if (this._data.length) {
            return await this.to(this._data.length - 1);
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
        if (this._status === Status.FINISHED) {
            return !!this._data.length && this._currentIndex === this._data.length;
        }
        return false;
    }
    async isFirst() {
        this._checkClosed();
        return !!this._data.length && this._currentIndex === 0;
    }
    async isLast() {
        this._checkClosed();
        if (this._currentIndex === AResultSet_1.AResultSet.NO_INDEX) {
            return false;
        }
        if (this._status === Status.UNFINISHED) {
            await this.next();
            await this.previous();
        }
        return this._currentIndex === this._data.length - 1;
    }
    async isClosed() {
        return this._status === Status.CLOSED;
    }
    async close() {
        this._checkClosed();
        await this._resultSet.close();
        this._status = Status.CLOSED;
        this._data = [];
        this._currentIndex = AResultSet_1.AResultSet.NO_INDEX;
    }
    async getBlobBuffer(field) {
        if (await this.isNull(field)) {
            return null;
        }
        const value = this._getValue(field);
        if (value instanceof node_firebird_driver_native_1.Blob) {
            const blobStream = await this._connection.openBlob(this._transaction, value);
            const length = await blobStream.length;
            const buffers = [];
            let i = 0;
            while (i < length) {
                const size = length - i < 1024 * 16 ? length - i : 1024 * 16;
                i += size;
                const buffer = Buffer.alloc(size);
                buffers.push(buffer);
                await blobStream.read(buffer);
            }
            return Buffer.concat(buffers, length);
        }
        return null;
    }
    async getBlobStream(field) {
        if (await this.isNull(field)) {
            return null;
        }
        const value = this._getValue(field);
        const stream = new stream_1.Readable({ read: () => null });
        if (value instanceof node_firebird_driver_native_1.Blob) {
            const blobStream = await this._connection.openBlob(this._transaction, value);
            const length = await blobStream.length;
            const buffers = [];
            let i = 0;
            while (i < length) {
                const size = length - i < 1024 * 16 ? length - i : 1024 * 16;
                i += size;
                buffers.push(Buffer.alloc(size));
            }
            const promises = buffers.map(async (buffer) => {
                await blobStream.read(buffer);
                stream.push(buffer);
            });
            Promise.all(promises).then(() => stream.push(null)).catch(console.warn);
        }
        return stream;
    }
    async getBoolean(field) {
        if (await this.isNull(field)) {
            return false;
        }
        let value = this._getValue(field);
        if (value instanceof node_firebird_driver_native_1.Blob) {
            const blobBuffer = await this.getBlobBuffer(field);
            if (blobBuffer) {
                value = blobBuffer.toString("utf-8");
            }
        }
        return Boolean(value);
    }
    async getDate(field) {
        if (await this.isNull(field)) {
            return null;
        }
        let value = this._getValue(field);
        if (value instanceof node_firebird_driver_native_1.Blob) {
            const blobBuffer = await this.getBlobBuffer(field);
            if (blobBuffer) {
                value = blobBuffer.toString("utf-8");
            }
        }
        return new Date(value);
    }
    async getNumber(field) {
        if (await this.isNull(field)) {
            return 0;
        }
        let value = this._getValue(field);
        if (value instanceof node_firebird_driver_native_1.Blob) {
            const blobBuffer = await this.getBlobBuffer(field);
            if (blobBuffer) {
                value = blobBuffer.toString("utf-8");
            }
        }
        return Number.parseFloat(value);
    }
    async getString(field) {
        if (await this.isNull(field)) {
            return "";
        }
        let value = this._getValue(field);
        if (value instanceof node_firebird_driver_native_1.Blob) {
            const blobBuffer = await this.getBlobBuffer(field);
            if (blobBuffer) {
                value = blobBuffer.toString("utf-8");
            }
        }
        return String(value);
    }
    async getAny(field) {
        return this._getValue(field);
    }
    async isNull(field) {
        const value = this._getValue(field);
        return value === null || value === undefined;
    }
    async getObject() {
        const array = await this.getArray();
        return array.reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {});
    }
    async getArray() {
        this._checkClosed();
        return this._data[this._currentIndex];
    }
    async getObjects() {
        const arrays = await this.getArrays();
        return arrays.map((array) => array.reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {}));
    }
    async getArrays() {
        this._checkClosed();
        // loading all rows
        if (this._status === Status.UNFINISHED) {
            while (await this.next()) {
                // nothing
            }
        }
        return this._data;
    }
    _getValue(field) {
        this._checkClosed();
        const row = this._data[this._currentIndex];
        if (typeof field === "number") {
            return row[field];
        }
        else {
            throw new Error("Not supported yet");
        }
    }
    _checkClosed() {
        if (this._status === Status.CLOSED) {
            throw new Error("ResultSet is closed");
        }
    }
}
exports.FirebirdResultSet = FirebirdResultSet;
//# sourceMappingURL=FirebirdResultSet.js.map