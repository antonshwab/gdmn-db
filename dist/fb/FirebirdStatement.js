"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AStatement_1 = require("../AStatement");
const FirebirdResultSet_1 = require("./FirebirdResultSet");
class FirebirdStatement extends AStatement_1.AStatement {
    constructor(connect, transaction, statement) {
        super();
        this._connect = connect;
        this._transaction = transaction;
        this._statement = statement;
    }
    async dispose() {
        await this._statement.dispose();
    }
    async execute(params) {
        await this._statement.execute(this._transaction, params);
    }
    async executeQuery(params) {
        const resultSet = await this._statement.executeQuery(this._transaction, params);
        return new FirebirdResultSet_1.FirebirdResultSet(this._connect, this._transaction, resultSet);
    }
}
exports.FirebirdStatement = FirebirdStatement;
//# sourceMappingURL=FirebirdStatement.js.map