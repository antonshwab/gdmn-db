"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const AResultSet_1 = require("../AResultSet");
const FirebirdTransaction_1 = require("./FirebirdTransaction");
const FBDatabase_1 = __importDefault(require("./driver/FBDatabase"));
class FirebirdResultSet extends AResultSet_1.AResultSet {
    constructor(event) {
        super();
        this._data = [];
        this._currentIndex = -1;
        this._event = event;
        this._event.on(FirebirdTransaction_1.FirebirdTransaction.EVENT_DATA, (row, index, next) => {
            this._data.push(row);
            this._nextFn = next;
        });
        this._event.once(FirebirdTransaction_1.FirebirdTransaction.EVENT_END, (error) => {
            this._nextFn = null;
            this._done = error ? error : true;
        });
    }
    get position() {
        return this._currentIndex;
    }
    async next() {
        if (this._currentIndex < this._data.length - 1) {
            this._currentIndex++;
            return true;
        }
        //throw error if exist
        if (this._done instanceof Error) {
            throw this._done;
        }
        //loading next row
        if (!this._done) {
            const waitNext = this.getWaitNext(); // must be created before call next()
            if (this._nextFn) {
                const next = this._nextFn;
                this._nextFn = null;
                next();
            }
            await waitNext;
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
    async getBlobBuffer(field) {
        const value = this._getValue(field);
        if (typeof value === "function") {
            return await FBDatabase_1.default.blobToBuffer(value);
        }
        return;
    }
    async getBlobStream(field) {
        const value = this._getValue(field);
        if (typeof value === "function") {
            const event = await FBDatabase_1.default.blobToStream(value);
            const stream = new stream_1.Readable({ read: () => null });
            event.on("data", (chunk) => {
                stream.push(chunk);
            });
            event.on("end", () => {
                stream.push(null);
            });
            return stream;
        }
        return;
    }
    getBoolean(field) {
        return Boolean(this._getValue(field));
    }
    getDate(field) {
        return new Date(this._getValue(field));
    }
    getNumber(field) {
        return Number.parseFloat(this._getValue(field));
    }
    getString(field) {
        return String(this._getValue(field));
    }
    getObject() {
        return this._data[this._currentIndex];
    }
    getArray() {
        return Object.values(this.getObject());
    }
    async getObjects() {
        //loading all rows
        if (!this._done) {
            while (await this.next()) {
            }
        }
        return this._data;
    }
    async getArrays() {
        const objects = await this.getObjects();
        return objects.map(object => Object.values(object));
    }
    async getWaitNext() {
        return new Promise(resolve => {
            const callback = () => {
                resolve();
                this._event.removeListener(FirebirdTransaction_1.FirebirdTransaction.EVENT_DATA, callback);
                this._event.removeListener(FirebirdTransaction_1.FirebirdTransaction.EVENT_END, callback);
            };
            this._event.once(FirebirdTransaction_1.FirebirdTransaction.EVENT_DATA, callback);
            this._event.once(FirebirdTransaction_1.FirebirdTransaction.EVENT_END, callback);
        });
    }
    _getValue(field) {
        const row = this._data[this._currentIndex];
        switch (typeof field) {
            case "number":
                const i = Object.keys(row);
                if (i.length)
                    return row[i[field]];
                return;
            case "string":
                return row[field];
        }
    }
}
exports.FirebirdResultSet = FirebirdResultSet;
//# sourceMappingURL=FirebirdResultSet.js.map