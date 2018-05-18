import { INamedParams } from "../AStatement";
export declare class DefaultParamsAnalyzer {
    private readonly _originalSql;
    private readonly _placeholdersNames;
    private readonly _tmpPlaceholders;
    private readonly _sql;
    constructor(originalSql: string, excludePatterns: RegExp[], placeholderPattern: RegExp);
    readonly originalSql: string;
    readonly sql: string;
    prepareParams(params?: any[] | INamedParams): any[];
    private _generateName(count?);
}
