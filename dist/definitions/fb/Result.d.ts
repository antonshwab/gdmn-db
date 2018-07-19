import { AResult } from "../AResult";
import { AResultMetadata } from "../AResultMetadata";
import { BlobImpl } from "./BlobImpl";
import { ResultMetadata } from "./ResultMetadata";
import { Statement } from "./Statement";
export interface IResultSource {
    metadata: ResultMetadata;
    buffer: Uint8Array;
}
export declare class Result extends AResult {
    source: IResultSource;
    protected constructor(statement: Statement, source: IResultSource);
    readonly statement: Statement;
    readonly metadata: AResultMetadata;
    static get(statement: Statement, source: IResultSource): Promise<Result>;
    static get(statement: Statement, params: any[]): Promise<Result>;
    private static _throwIfBlob;
    getBlob(i: number): BlobImpl;
    getBlob(name: string): BlobImpl;
    getBoolean(i: number): boolean;
    getBoolean(name: string): boolean;
    getDate(i: number): null | Date;
    getDate(name: string): null | Date;
    getNumber(i: number): number;
    getNumber(name: string): number;
    getString(i: number): string;
    getString(name: string): string;
    getAny(i: number): Promise<any>;
    getAny(name: string): Promise<any>;
    getAll(): Promise<any[]>;
    isNull(i: number): boolean;
    isNull(name: string): boolean;
    private _getValue;
    private getOutDescriptor;
}
