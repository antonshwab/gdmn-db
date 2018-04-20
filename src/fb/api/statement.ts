import * as fb from "node-firebird-native-api";
import {Attachment} from "./attachment";
import {createDataReader, createDataWriter, createDescriptors, DataReader, DataWriter, fixMetadata} from "./fb-utils";
import {ResultSet} from "./resultSet";
import {Transaction} from "./transaction";

/** Statement implementation. */
export class Statement {

    public resultSet?: ResultSet;

    public statementHandle?: fb.Statement;
    public inMetadata?: fb.MessageMetadata;
    public outMetadata?: fb.MessageMetadata;

    public inBuffer?: Uint8Array;
    public outBuffer?: Uint8Array;
    public dataWriter?: DataWriter;
    public dataReader?: DataReader;

    protected constructor(public attachment?: Attachment) {
    }

    public static async prepare(attachment: Attachment, transaction: Transaction, sqlStmt: string): Promise<Statement> {
        const statement = new Statement(attachment);

        return await attachment!.client!.statusAction(async (status) => {
            //// FIXME: options/flags, dialect
            statement.statementHandle = await attachment!.attachmentHandle!.prepareAsync(
                status, transaction.transactionHandle, 0, sqlStmt, 3, fb.Statement.PREPARE_PREFETCH_ALL);

            statement.inMetadata = fixMetadata(status,
                await statement.statementHandle!.getInputMetadataAsync(status));
            statement.outMetadata = fixMetadata(status,
                await statement.statementHandle!.getOutputMetadataAsync(status));

            if (statement.inMetadata) {
                statement.inBuffer = new Uint8Array(statement.inMetadata.getMessageLengthSync(status));
                statement.dataWriter = createDataWriter(createDescriptors(status, statement.inMetadata));
            }

            if (statement.outMetadata) {
                statement.outBuffer = new Uint8Array(statement.outMetadata.getMessageLengthSync(status));
                statement.dataReader = createDataReader(createDescriptors(status, statement.outMetadata));
            }

            return statement;
        });
    }

    /** Disposes this statement's resources. */
    public async dispose(): Promise<void> {
        this.check();

        if (this.resultSet) {
            await this.resultSet.close();
        }

        if (this.outMetadata) {
            this.outMetadata.releaseSync();
            this.outMetadata = undefined;
        }

        if (this.inMetadata) {
            this.inMetadata.releaseSync();
            this.inMetadata = undefined;
        }

        await this.attachment!.client!.statusAction((status) => this.statementHandle!.freeAsync(status));

        this.statementHandle = undefined;

        this.attachment!.statements.delete(this);
        this.attachment = undefined;
    }

    /** Executes a prepared statement that uses the SET TRANSACTION command. Returns the new transaction. */
    public async executeTransaction(transaction: Transaction): Promise<Transaction> {
        this.check();

        //// TODO: check opened resultSet.
        throw new Error("Uninplemented method: executeTransaction.");
    }

    /** Executes a prepared statement that has no result set. */
    public async execute(transaction: Transaction, parameters?: any[]): Promise<void> {
        this.check();

        //// TODO: check opened resultSet.
        await this.internalExecute(transaction, parameters);
    }

    /** Executes a statement that returns a single record. */
    public async executeReturning(transaction: Transaction, parameters?: any[]): Promise<any[]> {
        this.check();

        //// TODO: check opened resultSet.
        return await this.internalExecute(transaction, parameters);
    }

    /** Executes a prepared statement that has result set. */
    public async executeQuery(transaction: Transaction, parameters?: any[]): Promise<ResultSet> {
        this.check();

        //// TODO: check opened resultSet.
        const resultSet = await ResultSet.open(this, transaction, parameters);
        this.resultSet = resultSet;
        return resultSet;
    }

    protected async internalExecute(transaction: Transaction,
                                    parameters?: any[]): Promise<any[]> {
        return await this.attachment!.client!.statusAction(async (status) => {
            await this.dataWriter!(this.attachment as Attachment, transaction, this.inBuffer!, parameters);

            const newTransaction = await this.statementHandle!.executeAsync(status, transaction.transactionHandle,
                this.inMetadata, this.inBuffer, this.outMetadata, this.outBuffer);

            if (newTransaction && transaction.transactionHandle !== newTransaction) {
                //// FIXME: newTransaction.releaseSync();
            }
            return this.outMetadata
                ? await this.dataReader!(this.attachment as Attachment, transaction, this.outBuffer!)
                : [];
        });
    }

    private check(): void {
        if (!this.attachment) {
            throw new Error("Statement is already disposed.");
        }
    }
}
