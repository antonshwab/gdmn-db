import { MessageMetadata } from "node-firebird-native-api";
import { AResultSetMetadata, Types } from "../AResultSetMetadata";
import { Statement } from "./Statement";
import { IDescriptor } from "./utils/fb-utils";
export interface IResultSetMetadataSource {
    fixedHandler: MessageMetadata;
    descriptors: IDescriptor[];
    fixedDescriptors: IDescriptor[];
}
export declare class ResultSetMetadata extends AResultSetMetadata {
    private _source?;
    protected constructor(source: IResultSetMetadataSource);
    readonly descriptors: IDescriptor[];
    readonly columnCount: number;
    readonly handler: MessageMetadata;
    static getMetadata(statement: Statement): Promise<ResultSetMetadata>;
    getColumnLabel(i: number): string;
    getColumnName(i: number): string;
    getColumnType(i: number): Types;
    isNullable(i: number): boolean;
    release(): Promise<void>;
    private _checkClosed();
}
