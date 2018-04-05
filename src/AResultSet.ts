import {TExecutor} from "./types";

export interface IRow {
    [fieldName: string]: any;
}

export type TResultSet = AResultSet;

export abstract class AResultSet {

    abstract get position(): number;

    public static async executeFromParent<R>(sourceCallback: TExecutor<null, TResultSet>,
                                             resultCallback: TExecutor<TResultSet, R>): Promise<R> {
        let resultSet: undefined | TResultSet;
        try {
            resultSet = await sourceCallback(null);
            return await resultCallback(resultSet);
        } finally {
            if (resultSet) {
                await resultSet.close();
            }
        }
    }

    public abstract async next(): Promise<boolean>;

    public abstract async previous(): Promise<boolean>;

    public abstract async to(i: number): Promise<boolean>;

    public abstract async first(): Promise<boolean>;

    public abstract async last(): Promise<boolean>;

    public abstract async isFirst(): Promise<boolean>;

    public abstract async isLast(): Promise<boolean>;

    public abstract async close(): Promise<void>;

    public abstract async getBlobBuffer(i: number): Promise<null | Buffer>;
    public abstract async getBlobBuffer(name: string): Promise<null | Buffer>;
    public abstract async getBlobBuffer(field: number | string): Promise<null | Buffer>;

    public abstract async getBlobStream(i: number): Promise<null | NodeJS.ReadableStream>;
    public abstract async getBlobStream(name: string): Promise<null | NodeJS.ReadableStream>;
    public abstract async getBlobStream(field: number | string): Promise<null | NodeJS.ReadableStream>;

    public abstract getString(i: number): null | string;
    public abstract getString(name: string): null | string;
    public abstract getString(field: number | string): null | string;

    public abstract getNumber(i: number): null | number;
    public abstract getNumber(name: string): null | number;
    public abstract getNumber(field: number | string): null | number;

    public abstract getBoolean(i: number): null | boolean;
    public abstract getBoolean(name: string): null | boolean;
    public abstract getBoolean(field: number | string): null | boolean;

    public abstract getDate(i: number): null | Date;
    public abstract getDate(name: string): null | Date;
    public abstract getDate(field: number | string): null | Date;

    public abstract getAny(i: number): any;
    public abstract getAny(name: string): any;
    public abstract getAny(field: number | string): any;

    public abstract getObject(): IRow;

    public abstract getArray(): any[];

    public abstract async getObjects(): Promise<IRow[]>;

    public abstract async getArrays(): Promise<any[][]>;
}
