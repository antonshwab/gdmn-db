import {Transaction as NativeTransaction} from "node-firebird-native-api";
import {AccessMode, ATransaction, Isolation, ITransactionOptions} from "../ATransaction";
import {Connection} from "./Connection";
import {Statement} from "./Statement";
import {createTpb, ITransactionOpt, TransactionIsolation} from "./utils/fb-utils";

export class Transaction extends ATransaction {

    public statements = new Set<Statement>();
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
        return !this.handler;
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

        const handler = await connection.client.statusAction(async (status) => {
            const tpb = createTpb(apiOptions, connection.client.client!.util, status);
            return await connection.handler!.startTransactionAsync(
                status, tpb.getBufferLengthSync(status), tpb.getBufferSync(status));
        });

        return new Transaction(connection, options, handler!);
    }

    public async commit(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need absolute open transaction");
        }

        await this._closeChildren();

        await this.connection.client.statusAction((status) => this.handler!.commitAsync(status));
        this.handler = undefined;
        this.connection.transactions.delete(this);
    }

    public async rollback(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need absolute open transaction");
        }

        await this._closeChildren();

        await this.connection.client.statusAction((status) => this.handler!.rollbackAsync(status));
        this.handler = undefined;
        this.connection.transactions.delete(this);
    }

    private async _closeChildren(): Promise<void> {
        if (this.statements.size) {
            console.warn("Not all statements disposed, they will be disposed");
        }
        await Promise.all(Array.from(this.statements).reduceRight((promises, statement) => {
            promises.push(statement.dispose());
            return promises;
        }, [] as Array<Promise<void>>));
    }
}
