import {INamedParams} from "../ATransaction";

interface ITmpPlaceholders {
    [placeholder: string]: string;
}

export class ParamsAnalyzer {// TODO make default

    private static IN_LINE_COMMENT_PATTERN = /-{2}.*/g;
    private static BLOCK_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
    private static VALUES_PATTERN = /'[\s\S]*?'/g;
    private static BEGIN_END_BLOCK_PATTERN = /BEGIN[\s\S]*END/gi;
    private static PLACEHOLDER_PATTERN = /(:[a-zA-Z0-9_]+)/g;

    private readonly _originalSql: string;
    private readonly _placeholdersNames: string[] = [];
    private readonly _tmpPlaceholders: ITmpPlaceholders = {};
    private readonly _sql: string;

    constructor(originalSql: string) {
        this._originalSql = originalSql;

        let shortSql = this._originalSql;
        shortSql = this._replace(ParamsAnalyzer.IN_LINE_COMMENT_PATTERN, shortSql);
        shortSql = this._replace(ParamsAnalyzer.BLOCK_COMMENT_PATTERN, shortSql);
        shortSql = this._replace(ParamsAnalyzer.VALUES_PATTERN, shortSql);
        shortSql = this._replace(ParamsAnalyzer.BEGIN_END_BLOCK_PATTERN, shortSql);

        shortSql = shortSql.replace(ParamsAnalyzer.PLACEHOLDER_PATTERN, (placeholder) => {
            this._placeholdersNames.push(placeholder.replace(":", ""));
            return "?".padEnd(placeholder.length); // for correct position sql errors
        });

        this._sql = Object.entries(this._tmpPlaceholders)
            .reduce((sql, [key, value]) => sql.replace(key, value), shortSql);
    }

    get originalSql(): string {
        return this._originalSql;
    }

    get sql(): string {
        return this._sql;
    }

    public prepareParams(params?: null | any[] | INamedParams): any[] {
        if (!params) {
            return [];
        }
        if (Array.isArray(params)) {
            return params;
        }

        return this._placeholdersNames.map((placeholder) => {
            if (placeholder in params) {
                return params[placeholder];
            } else {
                throw new Error("Missing value for statement.\n" +
                    `"${placeholder}" not provided for statement:\n\n${this._sql}\n\n` +
                    `this was provided: ${JSON.stringify(params)}`);
            }
        });
    }

    private _replace(pattern: RegExp, sql: string): string {
        return sql.replace(pattern, (comment) => {
            const key = this._generateName();
            this._tmpPlaceholders[key] = comment;
            return key;
        });
    }

    private _generateName(count: number = Object.keys(this._tmpPlaceholders).length): string {
        const name = `$${count}`;
        if (this._originalSql.search(name) !== -1) {
            return this._generateName(count + 1);
        }
        return name;
    }
}
