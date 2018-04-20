"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {Attachment, Blob, ResultSet, Transaction} from "node-firebird-driver-native";
const AResultSet_1 = require("../AResultSet");
const FirebirdBlob_1 = require("./FirebirdBlob");
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
    getBlob(field) {
        return new FirebirdBlob_1.FirebirdBlob(this._connection, this._transaction, this._getValue(field));
    }
    getBoolean(field) {
        this._throwIfBlob(field);
        if (this.isNull(field)) {
            return false;
        }
        return Boolean(this._getValue(field));
    }
    getDate(field) {
        this._throwIfBlob(field);
        if (this.isNull(field)) {
            return null;
        }
        return new Date(this._getValue(field));
    }
    getNumber(field) {
        this._throwIfBlob(field);
        if (this.isNull(field)) {
            return 0;
        }
        return Number.parseFloat(this._getValue(field));
    }
    getString(field) {
        this._throwIfBlob(field);
        if (this.isNull(field)) {
            return "";
        }
        return String(this._getValue(field));
    }
    getAny(field) {
        return this._getValue(field);
    }
    isNull(field) {
        const value = this._getValue(field);
        return value === null || value === undefined;
    }
    getObject() {
        const array = this.getArray();
        return array.reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {});
    }
    getArray() {
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
    _throwIfBlob(field) {
        if (this._getValue(field) instanceof Blob) {
            throw new Error("Invalid typecasting");
        }
    }
}
exports.FirebirdResultSet = FirebirdResultSet;
//# sourceMappingURL=FirebirdResultSet.js.map