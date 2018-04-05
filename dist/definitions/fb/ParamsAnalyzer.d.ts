import { INamedParams } from "../ATransaction";
export declare class ParamsAnalyzer {
    private static IN_LINE_COMMENT_PATTERN;
    private static BLOCK_COMMENT_PATTERN;
    private static VALUES_PATTERN;
    private static BEGIN_END_BLOCK_PATTERN;
    private static PLACEHOLDER_PATTERN;
    private readonly _originalSql;
    private readonly _placeholdersNames;
    private readonly _tmpPlaceholders;
    private readonly _sql;
    constructor(originalSql: string);
    readonly originalSql: string;
    readonly sql: string;
    prepareParams(params?: null | any[] | INamedParams): any[];
    private _replace(pattern, sql);
    private _generateName(count?);
}
