"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AStatement_1 = require("../AStatement");
const FirebirdResultSet_1 = require("./FirebirdResultSet");
class FirebirdStatement extends AStatement_1.AStatement {
    constructor(connect, transaction, statement, paramsAnalyzer) {
        super();
        this._connect = connect;
        this._transaction = transaction;
        this._statement = statement;
        this._paramsAnalyzer = paramsAnalyzer;
    }
    async dispose() {
        await this._statement.dispose();
    }
    async execute(params) {
        await this._statement.execute(this._transaction, this._paramsAnalyzer.prepareParams(params));
    }
    async executeQuery(params) {
        const resultSet = await this._statement.executeQuery(this._transaction, this._paramsAnalyzer.prepareParams(params));
        return new FirebirdResultSet_1.FirebirdResultSet(this._connect, this._transaction, resultSet);
    }
}
exports.FirebirdStatement = FirebirdStatement;
//# sourceMappingURL=FirebirdStatement.js.map