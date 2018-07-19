"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_native_api_1 = require("node-firebird-native-api");
const AStatement_1 = require("../AStatement");
const DefaultParamsAnalyzer_1 = require("../default/DefaultParamsAnalyzer");
const Result_1 = require("./Result");
const ResultSet_1 = require("./ResultSet");
const fb_utils_1 = require("./utils/fb-utils");
class Statement extends AStatement_1.AStatement {
    constructor(transaction, paramsAnalyzer, source) {
        super(transaction, paramsAnalyzer.sql);
        this.resultSets = new Set();
        this._paramsAnalyzer = paramsAnalyzer;
        this.source = source;
        this.transaction.statements.add(this);
    }
    get transaction() {
        return super.transaction;
    }
    get disposed() {
        return !this.source;
    }
    static async prepare(transaction, sql) {
        const paramsAnalyzer = new DefaultParamsAnalyzer_1.DefaultParamsAnalyzer(sql, Statement.EXCLUDE_PATTERNS, Statement.PLACEHOLDER_PATTERN);
        const source = await transaction.connection.client.statusAction(async (status) => {
            const handler = await transaction.connection.handler.prepareAsync(status, transaction.handler, 0, paramsAnalyzer.sql, 3, node_firebird_native_api_1.Statement.PREPARE_PREFETCH_ALL);
            const inMetadata = fb_utils_1.fixMetadata(status, await handler.getInputMetadataAsync(status));
            const inDescriptors = fb_utils_1.createDescriptors(status, inMetadata);
            return {
                handler: handler,
                inMetadata,
                inDescriptors
            };
        });
        return new Statement(transaction, paramsAnalyzer, source);
    }
    async dispose() {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }
        await this._closeChildren();
        this.source.inMetadata.releaseSync();
        await this.transaction.connection.client.statusAction((status) => this.source.handler.freeAsync(status));
        this.source = undefined;
        this.transaction.statements.delete(this);
    }
    async executeQuery(params, type) {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }
        return ResultSet_1.ResultSet.open(this, this._paramsAnalyzer.prepareParams(params), type);
    }
    async executeReturning(params) {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }
        return Result_1.Result.get(this, this._paramsAnalyzer.prepareParams(params));
    }
    async execute(params) {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }
        await this.transaction.connection.client.statusAction(async (status) => {
            const outMetadata = fb_utils_1.fixMetadata(status, await this.source.handler.getOutputMetadataAsync(status));
            const inBuffer = new Uint8Array(this.source.inMetadata.getMessageLengthSync(status));
            try {
                await fb_utils_1.dataWrite(this, this.source.inDescriptors, inBuffer, this._paramsAnalyzer.prepareParams(params));
                const newTransaction = await this.source.handler.executeAsync(status, this.transaction.handler, this.source.inMetadata, inBuffer, outMetadata, undefined);
                if (newTransaction && this.transaction.handler !== newTransaction) {
                    //// FIXME: newTransaction.releaseSync();
                }
            }
            finally {
                if (outMetadata) {
                    await outMetadata.releaseAsync();
                }
            }
        });
    }
    async _closeChildren() {
        if (this.resultSets.size) {
            console.warn("Not all resultSets closed, they will be closed");
        }
        await Promise.all(Array.from(this.resultSets).reduceRight((promises, resultSet) => {
            resultSet.disposeStatementOnClose = false;
            promises.push(resultSet.close());
            return promises;
        }, []));
    }
}
Statement.EXCLUDE_PATTERNS = [
    /-{2}.*/g,
    /\/\*[\s\S]*?\*\//g,
    /'[\s\S]*?'/g,
    /\bBEGIN\b[\s\S]*\bEND\b/gi // begin ... end
];
Statement.PLACEHOLDER_PATTERN = /(:[a-zA-Z0-9_$]+)/g;
exports.Statement = Statement;
//# sourceMappingURL=Statement.js.map