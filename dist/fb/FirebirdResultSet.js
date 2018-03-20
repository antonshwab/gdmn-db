"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const AResultSet_1 = require("../AResultSet");
const FBDatabase_1 = __importDefault(require("./driver/FBDatabase"));
class FirebirdResultSet extends AResultSet_1.AResultSet {
    constructor(data) {
        super();
        this._data = [];
        this._currentIndex = -1;
        this._data = data;
    }
    async next() {
        if (this._currentIndex < this._data.length - 1) {
            this._currentIndex++;
            return true;
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
    getObjects() {
        return this._data;
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