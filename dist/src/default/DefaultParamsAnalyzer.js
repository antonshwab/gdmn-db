"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DefaultParamsAnalyzer {
    constructor(originalSql, excludePatterns, placeholderPattern) {
        this._placeholdersNames = [];
        this._tmpPlaceholders = {};
        this._originalSql = originalSql;
        let shortSql = excludePatterns.reduce((sql, excludePattern) => {
            return sql.replace(excludePattern, (str) => {
                const key = this._generateName();
                this._tmpPlaceholders[key] = str;
                return key;
            });
        }, this._originalSql);
        shortSql = shortSql.replace(placeholderPattern, (placeholder) => {
            this._placeholdersNames.push(placeholder.replace(":", ""));
            return "?".padEnd(placeholder.length); // for correct position sql errors
        });
        this._sql = Object.entries(this._tmpPlaceholders)
            .reduce((sql, [key, value]) => sql.replace(key, value), shortSql);
    }
    get originalSql() {
        return this._originalSql;
    }
    get sql() {
        return this._sql;
    }
    prepareParams(params) {
        if (!params) {
            return [];
        }
        if (Array.isArray(params)) {
            return params;
        }
        return this._placeholdersNames.map((placeholder) => {
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
    _generateName(count = Object.keys(this._tmpPlaceholders).length) {
        const name = `$${count}`;
        if (this._originalSql.search(name) !== -1) {
            return this._generateName(count + 1);
        }
        return name;
    }
}
exports.DefaultParamsAnalyzer = DefaultParamsAnalyzer;
//# sourceMappingURL=DefaultParamsAnalyzer.js.map