"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fb = __importStar(require("node-firebird-native-api"));
/** ResultSet implementation. */
class ResultSet {
    constructor(statement, transaction) {
        this.statement = statement;
        this.transaction = transaction;
        this.finished = false;
        this.disposeStatementOnClose = false;
    }
    static async open(statement, transaction, parameters) {
        const resultSet = new ResultSet(statement, transaction);
        if (!statement || !statement.attachment || !statement.attachment.client) {
            throw new Error("ResultSet is already closed.");
        }
        return await statement.attachment.client.statusAction(async (status) => {
            const attachment = statement.attachment;
            const dataWriter = statement.dataWriter;
            const inBuffer = statement.inBuffer;
            //// FIXME: options
            await dataWriter(attachment, transaction, inBuffer, parameters);
            resultSet.resultSetHandle = await statement.statementHandle.openCursorAsync(status, transaction.transactionHandle, statement.inMetadata, statement.inBuffer, statement.outMetadata, 0);
            return resultSet;
        });
    }
    /** Closes this result set. */
    async close() {
        if (!this.statement || !this.statement.attachment || !this.statement.attachment.client) {
            throw new Error("ResultSet is already closed.");
        }
        if (this.disposeStatementOnClose) {
            this.disposeStatementOnClose = false;
            await this.statement.dispose();
            return;
        }
        await this.statement.attachment.client.statusAction(async (status) => {
            await this.resultSetHandle.closeAsync(status);
            this.resultSetHandle = undefined;
        });
        this.statement.resultSet = undefined;
        this.statement = undefined;
    }
    /** Fetchs data from this result set. */
    async fetch(options) {
        if (!this.statement || !this.statement.attachment || !this.statement.attachment.client) {
            throw new Error("ResultSet is already closed.");
        }
        if (this.finished) {
            return [];
        }
        const fetchRet = await this.statement.attachment.client.statusAction(async (status) => {
            const statement = this.statement;
            const attachment = statement.attachment;
            const dataReader = statement.dataReader;
            const outBuffer = statement.outBuffer;
            const rows = [];
            const buffers = [outBuffer, new Uint8Array(statement.outMetadata.getMessageLengthSync(status))];
            let buffer = 0;
            let nextFetch = this.resultSetHandle.fetchNextAsync(status, buffers[buffer]);
            while (true) {
                if (await nextFetch === fb.Status.RESULT_OK) {
                    const buffer1 = buffer;
                    buffer = ++buffer % 2;
                    const finish = options && options.fetchSize && rows.length + 1 >= options.fetchSize;
                    if (!finish) {
                        nextFetch = this.resultSetHandle.fetchNextAsync(status, buffers[buffer]);
                    }
                    rows.push(await dataReader(attachment, this.transaction, buffers[buffer1]));
                    if (finish) {
                        return { finished: false, rows };
                    }
                }
                else {
                    return { finished: true, rows };
                }
            }
        });
        if (fetchRet.finished) {
            this.finished = true;
        }
        return fetchRet.rows;
    }
}
exports.ResultSet = ResultSet;
//# sourceMappingURL=resultSet.js.map