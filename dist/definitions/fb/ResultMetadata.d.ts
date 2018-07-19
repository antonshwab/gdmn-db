import { AResultMetadata, Types } from "../AResultMetadata";
import { Statement } from "./Statement";
import { IDescriptor } from "./utils/fb-utils";
export interface IResultSetMetadataSource {
    descriptors: IDescriptor[];
    fixedDescriptors: IDescriptor[];
}
export declare class ResultMetadata extends AResultMetadata {
    private _source?;
    protected constructor(source: IResultSetMetadataSource);
    readonly descriptors: IDescriptor[];
    readonly columnCount: number;
    static getMetadata(statement: Statement): Promise<ResultMetadata>;
    getColumnLabel(i: number): string;
    getColumnName(i: number): string;
    getColumnType(i: number): Types;
    isNullable(i: number): boolean;
}
