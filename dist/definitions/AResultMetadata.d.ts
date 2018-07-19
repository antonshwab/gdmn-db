export declare enum Types {
    BIGINT = 0,
    INTEGER = 1,
    SMALLINT = 2,
    BLOB = 3,
    BOOLEAN = 4,
    CHAR = 5,
    VARCHAR = 6,
    DATE = 7,
    TIME = 8,
    TIMESTAMP = 9,
    DOUBLE = 10,
    FLOAT = 11,
    NULL = 12,
    OTHER = 13
}
export declare abstract class AResultMetadata {
    abstract readonly columnCount: number;
    abstract getColumnLabel(i: number): string;
    abstract getColumnName(i: number): string;
    abstract getColumnType(i: number): Types;
    abstract isNullable(i: number): boolean;
}
