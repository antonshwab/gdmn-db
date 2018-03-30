import {Readable} from "stream";
import {EventEmitter} from "events";
import {AResultSet, TRow} from "../AResultSet";
import {FirebirdTransaction} from "./FirebirdTransaction";
import FBDatabase from "./driver/FBDatabase";

export class FirebirdResultSet extends AResultSet {

    private readonly _data: TRow[] = [];
    private _currentIndex: number = -1;
    private _event: EventEmitter;
    private _nextFn: null | (() => void) = null;
    private _done: boolean | Error = false;

    constructor(event: EventEmitter) {
        super();
        this._event = event;
        this._event.on(FirebirdTransaction.EVENT_DATA, (row, index, next) => {
            this._data.push(row);
            this._nextFn = next;
        });
        this._event.once(FirebirdTransaction.EVENT_END, (error) => {
            this._nextFn = null;
            this._done = error ? error : true;
        });
    }

    get position(): number {
        return this._currentIndex;
    }

    async next(): Promise<boolean> {
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
            const waitNext = this.getWaitNext();// must be created before call next()
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

    async close(): Promise<void> {
        this._done = true;
    }

    async getBlobBuffer(i: number): Promise<null | Buffer>;
    async getBlobBuffer(name: string): Promise<null | Buffer>;
    async getBlobBuffer(field: number | string): Promise<null | Buffer> {
        const value = this._getValue(field);
        if (typeof value === "function") {
            return await FBDatabase.blobToBuffer(value);
        }
        return null;
    }

    async getBlobStream(i: number): Promise<null | NodeJS.ReadableStream>;
    async getBlobStream(name: string): Promise<null | NodeJS.ReadableStream>;
    async getBlobStream(field: number | string): Promise<null | NodeJS.ReadableStream> {
        const value = this._getValue(field);
        if (typeof value === "function") {
            const event = await FBDatabase.blobToStream(value);
            const stream = new Readable({read: () => null});
            event.on("data", (chunk) => {
                stream.push(chunk);
            });
            event.on("end", () => {
                stream.push(null);
            });
            return stream;
        }
        return null;
    }

    getBoolean(i: number): null | boolean;
    getBoolean(name: string): null | boolean;
    getBoolean(field: number | string): null | boolean {
        const value = this._getValue(field);
        if (value === null || value === undefined) return null;
        return Boolean(value);
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
        return this._data[this._currentIndex];
    }

    getArray(): any[] {
        return Object.values(this.getObject());
    }

    async getObjects(): Promise<TRow[]> {
        //loading all rows
        if (!this._done) {
            while (await this.next()) {
            }
        }
        return this._data;
    }

    async getArrays(): Promise<any[][]> {
        const objects = await this.getObjects();
        return objects.map(object => Object.values(object));
    }

    private async getWaitNext(): Promise<void> {
        return new Promise<void>(resolve => {
            const callback = () => {
                resolve();
                this._event.removeListener(FirebirdTransaction.EVENT_DATA, callback);
                this._event.removeListener(FirebirdTransaction.EVENT_END, callback);
            };
            this._event.once(FirebirdTransaction.EVENT_DATA, callback);
            this._event.once(FirebirdTransaction.EVENT_END, callback);
        });
    }

    private _getValue(field: number | string): any {
        const row = this._data[this._currentIndex];
        switch (typeof field) {
            case "number":
                const i = Object.keys(row);
                if (i.length) return row[(<any>i)[field]];
                return;
            case "string":
                return row[field];
        }
    }
}