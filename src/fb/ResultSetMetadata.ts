import {MessageMetadata} from "node-firebird-native-api";
import {AResultSetMetadata, Types} from "../AResultSetMetadata";
import {Statement} from "./Statement";
import {createDescriptors, fixMetadata, IDescriptor, SQLTypes} from "./utils/fb-utils";

export interface IResultSetMetadataSource {
    fixedHandler: MessageMetadata;
    descriptors: IDescriptor[];
    fixedDescriptors: IDescriptor[];
}

export class ResultSetMetadata extends AResultSetMetadata {

    private _source?: IResultSetMetadataSource;

    protected constructor(source: IResultSetMetadataSource) {
        super();
        this._source = source;
    }

    get descriptors(): IDescriptor[] {
        return this._source!.fixedDescriptors;
    }

    get columnCount(): number {
        this._checkClosed();

        return this._source!.descriptors.length;
    }

    get handler(): MessageMetadata {
        this._checkClosed();

        return this._source!.fixedHandler;
    }

    public static async getMetadata(statement: Statement): Promise<ResultSetMetadata> {
        const result: IResultSetMetadataSource = await statement.transaction.connection.context
            .statusAction(async (status) => {
                const metadata = await statement.source!.handler.getOutputMetadataAsync(status);
                const descriptors = createDescriptors(status, metadata!);

                const fixedHandler = fixMetadata(status, metadata)!;
                const fixedDescriptors = createDescriptors(status, fixMetadata(status, metadata));

                return {
                    fixedHandler,
                    descriptors,
                    fixedDescriptors
                };
            });
        return new ResultSetMetadata(result);
    }

    public getColumnLabel(i: number): string {
        this._checkClosed();

        return this._source!.descriptors[i].alias || "";
    }

    public getColumnName(i: number): string {
        this._checkClosed();

        return this._source!.descriptors[i].field || "";
    }

    public getColumnType(i: number): Types {
        this._checkClosed();

        switch (this._source!.descriptors[i].type) {
            case SQLTypes.SQL_BLOB:
                return Types.BLOB;
            case SQLTypes.SQL_BOOLEAN:
                return Types.BOOLEAN;
            case SQLTypes.SQL_DOUBLE:
                return Types.DOUBLE;
            case SQLTypes.SQL_FLOAT:
                return Types.FLOAT;
            case SQLTypes.SQL_INT64:
                return Types.BIGINT;
            case SQLTypes.SQL_LONG:
                return Types.INTEGER;
            case SQLTypes.SQL_SHORT:
                return Types.SMALLINT;
            case SQLTypes.SQL_TIMESTAMP:
                return Types.TIMESTAMP;
            case SQLTypes.SQL_TYPE_DATE:
                return Types.DATE;
            case SQLTypes.SQL_TYPE_TIME:
                return Types.TIME;
            case SQLTypes.SQL_NULL:
                return Types.NULL;
            case SQLTypes.SQL_TEXT:
                return Types.VARCHAR;
            case SQLTypes.SQL_VARYING:
                return Types.CHAR;
            default:
                return Types.OTHER;
        }
    }

    public isNullable(i: number): boolean {
        this._checkClosed();

        return this._source!.descriptors[i].isNullable;
    }

    public async release(): Promise<void> {
        await this._source!.fixedHandler.releaseAsync();
        this._source = undefined;
    }

    private _checkClosed(): void {
        if (!this._source) {
            throw new Error("ResultSet is closed");
        }
    }
}
