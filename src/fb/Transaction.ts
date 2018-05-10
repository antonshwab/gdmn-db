import {Transaction as NativeTransaction} from "node-firebird-native-api";
import {AccessMode, ATransaction, Isolation, ITransactionOptions} from "../ATransaction";
import {Connection} from "./Connection";
import {createTpb, ITransactionOpt, TransactionIsolation} from "./utils/fb-utils";

export class Transaction extends ATransaction {

    public static EXCLUDE_PATTERNS = [
        /-{2}.*/g,                  // in-line comments
        /\/\*[\s\S]*?\*\//g,        // block comments
        /'[\s\S]*?'/g,              // values
        /BEGIN[\s\S]*END/gi         // begin ... end
    ];
    public static PLACEHOLDER_PATTERN = /(:[a-zA-Z0-9_]+)/g;

    public handler?: NativeTransaction;

    constructor(connection: Connection, options: ITransactionOptions, handler: NativeTransaction) {
        super(connection, options);
        this.handler = handler;
        this.connection.transactions.add(this);
    }

    get connection(): Connection {
        return super.connection as Connection;
    }

    get finished(): boolean {
        return !this.handler!;
    }

    public static async create(
        connection: Connection,
        options: ITransactionOptions = ATransaction.DEFAULT_OPTIONS
    ): Promise<Transaction> {

        const apiOptions: ITransactionOpt = {};
        switch (options.isolation) {
            case Isolation.SERIALIZABLE:
                apiOptions.isolation = TransactionIsolation.CONSISTENCY;
                apiOptions.waitMode = "NO_WAIT";
                break;
            case Isolation.REPEATABLE_READ:
                apiOptions.isolation = TransactionIsolation.SNAPSHOT;
                apiOptions.waitMode = "NO_WAIT";
                break;
            case Isolation.READ_UNCOMMITED:
                apiOptions.isolation = TransactionIsolation.READ_COMMITTED;
                apiOptions.readCommittedMode = "NO_RECORD_VERSION";
                apiOptions.waitMode = "NO_WAIT";
                break;
            case Isolation.READ_COMMITED:
            default:
                apiOptions.isolation = TransactionIsolation.READ_COMMITTED;
                apiOptions.readCommittedMode = "RECORD_VERSION";
                apiOptions.waitMode = "NO_WAIT";
                break;
        }

        switch (options.accessMode) {
            case AccessMode.READ_ONLY:
                apiOptions.accessMode = "READ_ONLY";
                break;
            case AccessMode.READ_WRITE:
            default:
                apiOptions.accessMode = "READ_WRITE";
        }

        const handler = await connection.context.statusAction(async (status) => {
            const tpb = createTpb(apiOptions);
            return await connection.handler!.startTransactionAsync(status, tpb.length, tpb);
        });

        return new Transaction(connection, options, handler!);
    }

    public async commit(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need absolute open transaction");
        }

        await this.connection.context.statusAction((status) => this.handler!.commitAsync(status));
        this.handler = undefined;
        this.connection.transactions.delete(this);
    }

    public async rollback(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need absolute open transaction");
        }

        await this.connection.context.statusAction((status) => this.handler!.rollbackAsync(status));
        this.handler = undefined;
        this.connection.transactions.delete(this);
    }
}
