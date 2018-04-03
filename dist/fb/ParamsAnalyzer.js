"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParamsAnalyzer {
    constructor(originalSql) {
        this._placeholdersNames = [];
        this._tmpPlaceholders = {};
        this._originalSql = originalSql;
        let trimmedSql = this._replace(ParamsAnalyzer.BEGIN_END_BLOCK_PATTERN, this._originalSql);
        trimmedSql = this._replace(ParamsAnalyzer.BLOCK_COMMENT_PATTERN, trimmedSql);
        trimmedSql = this._replace(ParamsAnalyzer.IN_LINE_COMMENT_PATTERN, trimmedSql);
        trimmedSql = trimmedSql.replace(ParamsAnalyzer.PLACEHOLDER_PATTERN, placeholder => {
            this._placeholdersNames.push(placeholder.replace(":", ""));
            return "?".padEnd(placeholder.length); //for correct position sql errors
        });
        this._sql = Object.keys(this._tmpPlaceholders)
            .reduce((sql, key) => sql.replace(key, this._tmpPlaceholders[key]), trimmedSql);
    }
    get sql() {
        return this._sql;
    }
    prepareParams(params) {
        if (!params)
            return [];
        if (Array.isArray(params))
            return params;
        return this._placeholdersNames.map(placeholder => {
            if (placeholder in params) {
                return params[placeholder];
            }
            else {
                throw new Error("Missing value for statement.\n" +
                    `"${placeholder}" not provided for statement:\n\n${this._sql}\n\n` +
                    `this was provided: ${JSON.stringify(params)}`);
            }
        });
    }
    _replace(pattern, sql) {
        return sql.replace(pattern, comment => {
            const key = this._generateName();
            this._tmpPlaceholders[key] = comment;
            return key;
        });
    }
    _generateName(number = Object.keys(this._tmpPlaceholders).length) {
        const name = `$${number}`;
        if (this._originalSql.search(name) !== -1)
            return this._generateName(number + 1);
        return name;
    }
}
ParamsAnalyzer.BEGIN_END_BLOCK_PATTERN = /BEGIN[\s\S]*END/gi;
ParamsAnalyzer.BLOCK_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
ParamsAnalyzer.IN_LINE_COMMENT_PATTERN = /-{2}.*/g;
ParamsAnalyzer.PLACEHOLDER_PATTERN = /(:[a-zA-Z0-9_]+)/g;
exports.ParamsAnalyzer = ParamsAnalyzer;
//# sourceMappingURL=ParamsAnalyzer.js.map