"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_native_api_1 = require("node-firebird-native-api");
const AStatement_1 = require("../AStatement");
const DefaultParamsAnalyzer_1 = require("../default/DefaultParamsAnalyzer");
const FirebirdResultSet_1 = require("./FirebirdResultSet");
const FirebirdTransaction_1 = require("./FirebirdTransaction");
const fb_utils_1 = require("./utils/fb-utils");
class FirebirdStatement extends AStatement_1.AStatement {
    constructor(parent, paramsAnalyzer, source) {
        super();
        this.resultSets = new Set();
        this.parent = parent;
        this._paramsAnalyzer = paramsAnalyzer;
        this.source = source;
        parent.statements.add(this);
    }
    static async prepare(transaction, sql) {
        const paramsAnalyzer = new DefaultParamsAnalyzer_1.DefaultParamsAnalyzer(sql, FirebirdTransaction_1.FirebirdTransaction.EXCLUDE_PATTERNS, FirebirdTransaction_1.FirebirdTransaction.PLACEHOLDER_PATTERN);
        const source = await transaction.parent.context.statusAction(async (status) => {
            const handler = await transaction.parent.handler.prepareAsync(status, transaction.handler, 0, paramsAnalyzer.sql, 3, node_firebird_native_api_1.Statement.PREPARE_PREFETCH_ALL);
            const inMetadata = fb_utils_1.fixMetadata(status, await handler.getInputMetadataAsync(status));
            const outMetadata = fb_utils_1.fixMetadata(status, await handler.getOutputMetadataAsync(status));
            const inDescriptors = fb_utils_1.createDescriptors(status, inMetadata);
            const outDescriptors = fb_utils_1.createDescriptors(status, outMetadata);
            return {
                handler: handler,
                inMetadata,
                outMetadata,
                inDescriptors,
                outDescriptors
            };
        });
        return new FirebirdStatement(transaction, paramsAnalyzer, source);
    }
    async dispose() {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }
        await this._closeChildren();
        this.source.inMetadata.releaseSync();
        this.source.outMetadata.releaseSync();
        await this.parent.parent.context.statusAction((status) => this.source.handler.freeAsync(status));
        this.source = undefined;
        this.parent.statements.delete(this);
    }
    async execute(params) {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }
        await this.parent.parent.context.statusAction(async (status) => {
            const inBuffer = new Uint8Array(this.source.inMetadata.getMessageLengthSync(status));
            await fb_utils_1.dataWrite(this, this.source.inDescriptors, inBuffer, this._paramsAnalyzer.prepareParams(params));
            const newTransaction = await this.source.handler.executeAsync(status, this.parent.handler, this.source.inMetadata, inBuffer, this.source.outMetadata, undefined);
            if (newTransaction && this.parent.handler !== newTransaction) {
                //// FIXME: newTransaction.releaseSync();
            }
        });
    }
    async executeQuery(params) {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }
        return FirebirdResultSet_1.FirebirdResultSet.open(this, this._paramsAnalyzer.prepareParams(params));
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
exports.FirebirdStatement = FirebirdStatement;
//# sourceMappingURL=FirebirdStatement.js.map