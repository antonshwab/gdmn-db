"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_driver_native_1 = require("node-firebird-driver-native");
const stream_1 = require("stream");
const AResultSet_1 = require("../AResultSet");
class FirebirdResultSet2 extends AResultSet_1.AResultSet {
    constructor(connect, transaction, resultSet) {
        super();
        this._data = [];
        this._currentIndex = -1;
        this._connect = connect;
        this._transaction = transaction;
        this._resultSet = resultSet;
    }
    get position() {
        return this._currentIndex;
    }
    async next() {
        if (this._currentIndex < this._data.length - 1) {
            this._currentIndex++;
            return true;
        }
        //loading next row
        if (!this._done) {
            const newResult = await this._resultSet.fetch({ fetchSize: 1 });
            if (newResult.length) {
                this._data.push(newResult[0]);
            }
            else {
                this._done = true;
            }
            return await this.next();
        }
        return false;
    }
    async previous() {
        if (this._currentIndex > 0) {
            this._currentIndex--;
            return true;
        }
        return false;
    }
    async to(i) {
        if (i < this._data.length && i >= 0) {
            this._currentIndex = i;
            return true;
        }
        //loading all rows
        if (!this._done) {
            while (await this.next()) {
                if (this._currentIndex === i)
                    return true;
            }
        }
        return false;
    }
    async first() {
        if (this._data.length) {
            this._currentIndex = 0;
            return true;
        }
        return false;
    }
    async last() {
        //loading all rows
        if (!this._done) {
            while (await this.next()) {
            }
        }
        if (this._data.length) {
            this._currentIndex = this._data.length - 1;
            return true;
        }
        return false;
    }
    async close() {
        await this._resultSet.close();
        this._done = true;
    }
    async getBlobBuffer(field) {
        const value = this._getValue(field);
        if (value === null || value === undefined)
            return null;
        if (value instanceof node_firebird_driver_native_1.Blob) {
            const blobStream = await this._connect.openBlob(this._transaction, value);
            const length = await blobStream.length;
            const buffers = [];
            let i = 0;
            while (i < length) {
                let size = length - i < 1024 * 16 ? length - i : 1024 * 16;
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
        const value = this._getValue(field);
        if (value === null || value === undefined)
            return null;
        const stream = new stream_1.Readable({ read: () => null });
        if (value instanceof node_firebird_driver_native_1.Blob) {
            const blobStream = await this._connect.openBlob(this._transaction, value);
            const length = await blobStream.length;
            const buffers = [];
            let i = 0;
            while (i < length) {
                let size = length - i < 1024 * 16 ? length - i : 1024 * 16;
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
    getBoolean(field) {
        const value = this._getValue(field);
        if (value === null || value === undefined)
            return null;
        return Boolean(this._getValue(field));
    }
    getDate(field) {
        const value = this._getValue(field);
        if (value === null || value === undefined)
            return null;
        return new Date(value);
    }
    getNumber(field) {
        const value = this._getValue(field);
        if (value === null || value === undefined)
            return null;
        return Number.parseFloat(value);
    }
    getString(field) {
        const value = this._getValue(field);
        if (value === null || value === undefined)
            return null;
        return String(value);
    }
    getObject() {
        return this.getArray().reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {});
    }
    getArray() {
        return this._data[this._currentIndex];
    }
    async getObjects() {
        const arrays = await this.getArrays();
        return arrays.map(array => array.reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {}));
    }
    async getArrays() {
        //loading all rows
        if (!this._done) {
            while (await this.next()) {
            }
        }
        return this._data;
    }
    _getValue(field) {
        const row = this._data[this._currentIndex];
        switch (typeof field) {
            case "number":
                return row[field];
            case "string":
                throw new Error("Not supported yet");
        }
    }
}
exports.FirebirdResultSet2 = FirebirdResultSet2;
//# sourceMappingURL=FirebirdResultSet2.js.map