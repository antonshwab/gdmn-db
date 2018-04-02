import {Attachment, Blob, ResultSet, Transaction} from "node-firebird-driver-native";
import {Readable} from "stream";
import {AResultSet, TRow} from "../AResultSet";

export class FirebirdResultSet extends AResultSet {

    private _connect: Attachment;
    private _transaction: Transaction;
    private _resultSet: ResultSet;
    private _data: any[][] = [];
    private _currentIndex: number = -1;
    private _done: boolean = false;

    constructor(connect: Attachment, transaction: Transaction, resultSet: ResultSet) {
        super();
        this._connect = connect;
        this._transaction = transaction;
        this._resultSet = resultSet;
    }

    get position(): number {
        return this._currentIndex;
    }

    async next(): Promise<boolean> {
        if (this._currentIndex < this._data.length - 1) {
            this._currentIndex++;
            return true;
        }

        //loading next row
        if (!this._done) {
            const newResult = await this._resultSet.fetch({fetchSize: 1});
            if (newResult.length) {
                this._data.push(newResult[0]);
            } else {
                this._done = true;
            }
            return await this.next();
        }
        return false;
    }

    async previous(): Promise<boolean> {
        if (this._currentIndex > 0) {
            this._currentIndex--;
            return true;
        }
        return false;
    }

    async to(i: number): Promise<boolean> {
        if (i < this._data.length && i >= 0) {
            this._currentIndex = i;
            return true;
        }

        //loading all rows
        if (!this._done) {
            while (await this.next()) {
                if (this._currentIndex === i) return true;
            }
        }
        return false;
    }

    async first(): Promise<boolean> {
        if (this._data.length) {
            this._currentIndex = 0;
            return true;
        }
        return false;
    }

    async last(): Promise<boolean> {
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

    async isFirst(): Promise<boolean> {
        return this._currentIndex === 0;
    }

    async isLast(): Promise<boolean> {
        //loading and check next
        if (!this._done) {
            if (await this.next()) {
                await this.previous();
                return false;
            } else {
                return true;
            }
        }

        return this._currentIndex === this._data.length - 1;
    }

    async close(): Promise<void> {
        await this._resultSet.close();
        this._done = true;
    }

    async getBlobBuffer(i: number): Promise<null | Buffer>;
    async getBlobBuffer(name: string): Promise<null | Buffer>;
    async getBlobBuffer(field: number | string): Promise<null | Buffer> {
        const value = this._getValue(field);
        if (value === null || value === undefined) return null;
        if (value instanceof Blob) {
            const blobStream = await this._connect.openBlob(this._transaction, value);
            const length = await blobStream.length;

            const buffers: Buffer[] = [];
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

    async getBlobStream(i: number): Promise<null | NodeJS.ReadableStream>;
    async getBlobStream(name: string): Promise<null | NodeJS.ReadableStream>;
    async getBlobStream(field: number | string): Promise<null | NodeJS.ReadableStream> {
        const value = this._getValue(field);
        if (value === null || value === undefined) return null;
        const stream = new Readable({read: () => null});
        if (value instanceof Blob) {
            const blobStream = await this._connect.openBlob(this._transaction, value);
            const length = await blobStream.length;

            const buffers: Buffer[] = [];
            let i = 0;
            while (i < length) {
                let size = length - i < 1024 * 16 ? length - i : 1024 * 16;
                i += size;
                buffers.push(Buffer.alloc(size));
            }
            const promises = buffers.map(async buffer => {
                await blobStream.read(buffer);
                stream.push(buffer);
            });
            Promise.all(promises).then(() => stream.push(null)).catch(console.warn);
        }
        return stream;
    }

    getBoolean(i: number): null | boolean;
    getBoolean(name: string): null | boolean;
    getBoolean(field: number | string): null | boolean {
        const value = this._getValue(field);
        if (value === null || value === undefined) return null;
        return Boolean(this._getValue(field));
    }

    getDate(i: number): null | Date;
    getDate(name: string): null | Date;
    getDate(field: number | string): null | Date {
        const value = this._getValue(field);
        if (value === null || value === undefined) return null;
        return new Date(value);
    }

    getNumber(i: number): null | number;
    getNumber(name: string): null | number;
    getNumber(field: number | string): null | number {
        const value = this._getValue(field);
        if (value === null || value === undefined) return null;
        return Number.parseFloat(value);
    }

    getString(i: number): null | string;
    getString(name: string): null | string;
    getString(field: number | string): null | string {
        const value = this._getValue(field);
        if (value === null || value === undefined) return null;
        return String(value);
    }

    getAny(i: number): any;
    getAny(name: string): any;
    getAny(field: number | string): any {
        return this._getValue(field);
    }

    getObject(): TRow {
        return this.getArray().reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {});
    }

    getArray(): any[] {
        return this._data[this._currentIndex];
    }

    async getObjects(): Promise<TRow[]> {
        const arrays = await this.getArrays();
        return arrays.map(array => array.reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {}));
    }

    async getArrays(): Promise<any[][]> {
        //loading all rows
        if (!this._done) {
            while (await this.next()) {
            }
        }
        return this._data;
    }

    private _getValue(field: number | string): any {
        const row = this._data[this._currentIndex];
        if (typeof field === "number") {
            return row[field];
        } else {
            throw new Error("Not supported yet");
        }
    }
}