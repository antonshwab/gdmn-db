import {Readable} from "stream";
import {AResultSet, TRow} from "../AResultSet";
import FBDatabase from "./driver/FBDatabase";

export class FirebirdResultSet extends AResultSet {

    private readonly _data: TRow[] = [];
    private _currentIndex: number = -1;

    constructor(data: TRow[]) {
        super();
        this._data = data;
    }

    async next(): Promise<boolean> {
        if (this._currentIndex < this._data.length - 1) {
            this._currentIndex++;
            return true;
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
        if (this._data.length) {
            this._currentIndex = this._data.length - 1;
            return true;
        }
        return false;
    }

    async getBlobBuffer(i: number): Promise<Buffer>;
    async getBlobBuffer(name: string): Promise<Buffer>;
    async getBlobBuffer(field: number | string): Promise<Buffer> {
        const value = this._getValue(field);
        if (typeof value === "function") {
            return await FBDatabase.blobToBuffer(value);
        }
        return;
    }

    async getBlobStream(i: number): Promise<NodeJS.ReadableStream>;
    async getBlobStream(name: string): Promise<NodeJS.ReadableStream>;
    async getBlobStream(field: number | string): Promise<NodeJS.ReadableStream> {
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
        return;
    }

    getBoolean(i: number): boolean;
    getBoolean(name: string): boolean;
    getBoolean(field: number | string): boolean {
        return Boolean(this._getValue(field));
    }

    getDate(i: number): Date;
    getDate(name: string): Date;
    getDate(field: number | string): Date {
        return new Date(this._getValue(field));
    }

    getNumber(i: number): number;
    getNumber(name: string): number;
    getNumber(field: number | string): number {
        return Number.parseFloat(this._getValue(field));
    }

    getString(i: number): string;
    getString(name: string): string;
    getString(field: number | string): string {
        return String(this._getValue(field));
    }

    getObject(): TRow {
        return this._data[this._currentIndex];
    }

    getObjects(): TRow[] {
        return this._data;
    }

    private _getValue(field: number | string): any {
        const row = this._data[this._currentIndex];
        switch (typeof field) {
            case "number":
                const i = Object.keys(row);
                if (i.length) return row[i[field]];
                return;
            case "string":
                return row[field];
        }
    }
}