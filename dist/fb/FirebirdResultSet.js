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
const AResultSet_1 = require("../AResultSet");
const FirebirdBlob_1 = require("./FirebirdBlob");
const FirebirdBlobLink_1 = require("./FirebirdBlobLink");
var Status;
(function (Status) {
    Status[Status["UNFINISHED"] = 0] = "UNFINISHED";
    Status[Status["FINISHED"] = 1] = "FINISHED";
})(Status || (Status = {}));
class FirebirdResultSet extends AResultSet_1.AResultSet {
    constructor(parent, handler) {
        super();
        this.disposeStatementOnClose = false;
        this._data = [];
        this._currentIndex = AResultSet_1.AResultSet.NO_INDEX;
        this._status = Status.UNFINISHED;
        this.parent = parent;
        this._handler = handler;
    }
    get position() {
        this._checkClosed();
        return this._currentIndex;
    }
    static async open(parent) {
        const handler = await parent.parent.parent.context.statusAction((status) => parent.source.handler.openCursorAsync(status, parent.parent.handler, parent.source.inMetadata, parent.source.inBuffer, parent.source.outMetadata, 0));
        return new FirebirdResultSet(parent, handler);
    }
    async next() {
        this._checkClosed();
        if (this._currentIndex < this._data.length) {
            this._currentIndex++;
            if (this._currentIndex === this._data.length) {
                if (this._status === Status.UNFINISHED) {
                    const newResult = await this._fetch({ fetchSize: 1 });
                    if (newResult) {
                        this._data.push(newResult[0]);
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
        return !this._handler;
    }
    async close() {
        this._checkClosed();
        await this.parent.parent.parent.context.statusAction((status) => this._handler.closeAsync(status));
        this._handler = undefined;
        this._data = [];
        this._currentIndex = AResultSet_1.AResultSet.NO_INDEX;
        if (this.disposeStatementOnClose) {
            await this.parent.dispose();
        }
    }
    getBlob(field) {
        return new FirebirdBlob_1.FirebirdBlob(this, this._getValue(field));
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
        const date = new Date(this._getValue(field));
        return isNaN(date.getTime()) ? null : date;
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
        return this.parent.source.outDescriptors.reduce((row, descriptor, index) => {
            if (descriptor.alias) {
                row[descriptor.alias] = this.getAny(index);
            }
            return row;
        }, {});
    }
    getArray() {
        this._checkClosed();
        return this._data[this._currentIndex];
    }
    async getObjects() {
        await this.beforeFirst();
        const objects = [];
        while (await this.next()) {
            objects.push(this.getObject());
        }
        return objects;
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
            const index = this.parent.source.outDescriptors.findIndex((descriptor) => descriptor.alias === field);
            // TODO
            return row[index];
        }
    }
    _checkClosed() {
        if (!this._handler) {
            throw new Error("ResultSet is closed");
        }
    }
    _throwIfBlob(field) {
        if (this._getValue(field) instanceof FirebirdBlobLink_1.FirebirdBlobLink) {
            throw new Error("Invalid typecasting");
        }
    }
    async _fetch(options) {
        this._checkClosed();
        if (this._status === Status.FINISHED) {
            return [];
        }
        const fetchRet = await this.parent.parent.parent.context.statusAction(async (status) => {
            const rows = [];
            const buffers = [
                this.parent.source.outBuffer,
                new Uint8Array(this.parent.source.outMetadata.getMessageLengthSync(status))
            ];
            let buffer = 0;
            let nextFetch = this._handler.fetchNextAsync(status, buffers[buffer]);
            while (true) {
                if (await nextFetch === fb.Status.RESULT_OK) {
                    const buffer1 = buffer;
                    buffer = ++buffer % 2;
                    const finish = options && options.fetchSize && rows.length + 1 >= options.fetchSize;
                    if (!finish) {
                        nextFetch = this._handler.fetchNextAsync(status, buffers[buffer]);
                    }
                    rows.push(await this.parent.source.dataReader(this.parent, buffers[buffer1]));
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
            this._status = Status.FINISHED;
            return;
        }
        return fetchRet.rows;
    }
}
exports.FirebirdResultSet = FirebirdResultSet;
//# sourceMappingURL=FirebirdResultSet.js.map