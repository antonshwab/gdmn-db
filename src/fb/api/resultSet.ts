import * as fb from "node-firebird-native-api";
import {Attachment} from "./attachment";
import {DataWriter} from "./fb-utils";
import {Statement} from "./statement";
import {Transaction} from "./transaction";

/** ResultSet implementation. */
export class ResultSet {

    public finished = false;
    public disposeStatementOnClose = false;

    public resultSetHandle?: fb.ResultSet;

    protected constructor(public statement?: Statement, public transaction?: Transaction) {
    }

    public static async open(statement: Statement,
                             transaction: Transaction,
                             parameters?: any[]): Promise<ResultSet> {
        const resultSet = new ResultSet(statement, transaction);

        return await statement!.attachment!.client!.statusAction(async (status) => {
            const attachment = statement.attachment as Attachment;
            const dataWriter = statement.dataWriter as DataWriter;
            const inBuffer = statement.inBuffer as Uint8Array;
            //// FIXME: options
            await dataWriter(attachment, transaction, inBuffer, parameters);

            resultSet.resultSetHandle = await statement.statementHandle!.openCursorAsync(status,
                transaction.transactionHandle, statement.inMetadata, statement.inBuffer,
                statement.outMetadata, 0);

            return resultSet;
        });
    }

    /** Closes this result set. */
    public async close(): Promise<void> {
        this.check();

        if (this.disposeStatementOnClose) {
            this.disposeStatementOnClose = false;
            await this.statement!.dispose();
            return;
        }

        await this.statement!.attachment!.client!.statusAction(async (status) => {
            await this.resultSetHandle!.closeAsync(status);

            this.resultSetHandle = undefined;
        });

        this.statement!.resultSet = undefined;
        this.statement = undefined;
    }

    /** Fetchs data from this result set. */
    public async fetch(options?: { fetchSize?: number }): Promise<any[][]> {
        this.check();

        if (this.finished) {
            return [];
        }

        const fetchRet = await this.statement!.attachment!.client!.statusAction(async (status) => {
            const rows = [];
            const buffers = [
                this.statement!.outBuffer!,
                new Uint8Array(this.statement!.outMetadata!.getMessageLengthSync(status))
            ];
            let buffer = 0;
            let nextFetch = this.resultSetHandle!.fetchNextAsync(status, buffers[buffer]);

            while (true) {
                if (await nextFetch === fb.Status.RESULT_OK) {
                    const buffer1 = buffer;
                    buffer = ++buffer % 2;

                    const finish = options && options.fetchSize && rows.length + 1 >= options.fetchSize;

                    if (!finish) {
                        nextFetch = this.resultSetHandle!.fetchNextAsync(status, buffers[buffer]);
                    }

                    rows.push(await this.statement!.dataReader!(
                        this.statement!.attachment!,
                        this.transaction as Transaction,
                        buffers[buffer1]));

                    if (finish) {
                        return {finished: false, rows};
                    }
                }
                else {
                    return {finished: true, rows};
                }
            }
        });

        if (fetchRet.finished) {
            this.finished = true;
        }

        return fetchRet.rows;
    }

    private check(): void {
        if (!this.statement) {
            throw new Error("ResultSet is already closed.");
        }
    }
}
