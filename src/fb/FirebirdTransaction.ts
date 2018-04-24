import {Transaction} from "node-firebird-native-api";
import {AccessMode, ATransaction, INamedParams, Isolation, ITransactionOptions} from "../ATransaction";
import {FirebirdBlob} from "./FirebirdBlob";
import {FirebirdConnection} from "./FirebirdConnection";
import {FirebirdResultSet} from "./FirebirdResultSet";
import {FirebirdStatement} from "./FirebirdStatement";
import {createTpb, ITransactionOpt, TransactionIsolation} from "./utils/fb-utils";

export class FirebirdTransaction extends ATransaction<FirebirdBlob, FirebirdResultSet, FirebirdStatement> {

    public static EXCLUDE_PATTERNS = [
        /-{2}.*/g,                  // in-line comments
        /\/\*[\s\S]*?\*\//g,        // block comments
        /'[\s\S]*?'/g,              // values
        /BEGIN[\s\S]*END/gi,        // begin ... end
    ];
    public static PLACEHOLDER_PATTERN = /(:[a-zA-Z0-9_]+)/g;

    public readonly parent: FirebirdConnection;
    public statements = new Set<FirebirdStatement>();
    public handler?: Transaction;

    protected constructor(parent: FirebirdConnection, options?: ITransactionOptions) {
        super(options);
        this.parent = parent;
    }

    public static async create(parent: FirebirdConnection,
                               options?: ITransactionOptions): Promise<FirebirdTransaction> {
        return new FirebirdTransaction(parent, options);
    }

    public async start(): Promise<void> {
        if (this.handler) {
            throw new Error("Transaction already opened");
        }

        const options: ITransactionOpt = {};
        switch (this._options.isolation) {
            case Isolation.SERIALIZABLE:
                options.isolation = TransactionIsolation.CONSISTENCY;
                options.waitMode = "NO_WAIT";
                break;
            case Isolation.REPEATABLE_READ:
                options.isolation = TransactionIsolation.SNAPSHOT;
                options.waitMode = "NO_WAIT";
                break;
            case Isolation.READ_UNCOMMITED:
                options.isolation = TransactionIsolation.READ_COMMITTED;
                options.readCommittedMode = "NO_RECORD_VERSION";
                options.waitMode = "NO_WAIT";
                break;
            case Isolation.READ_COMMITED:
            default:
                options.isolation = TransactionIsolation.READ_COMMITTED;
                options.readCommittedMode = "RECORD_VERSION";
                options.waitMode = "NO_WAIT";
                break;
        }

        switch (this._options.accessMode) {
            case AccessMode.READ_ONLY:
                options.accessMode = "READ_ONLY";
                break;
            case AccessMode.READ_WRITE:
            default:
                options.accessMode = "READ_WRITE";
        }

        this.handler = await this.parent.context.statusAction(async (status) => {
            const tpb = createTpb(options);
            return await this.parent.handler!.startTransactionAsync(status, tpb.length, tpb);
        });
        this.parent.transactions.add(this);
    }

    public async commit(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need to open transaction");
        }

        await this.closeChildren();

        await this.parent.context.statusAction((status) => this.handler!.commitAsync(status));
        this.handler = undefined;
        this.parent.transactions.delete(this);
    }

    public async rollback(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need to open transaction");
        }

        await this.closeChildren();

        await this.parent.context.statusAction((status) => this.handler!.rollbackAsync(status));
        this.handler = undefined;
        this.parent.transactions.delete(this);
    }

    public async isActive(): Promise<boolean> {
        return Boolean(this.handler);
    }

    public async prepare(sql: string): Promise<FirebirdStatement> {
        if (!this.handler) {
            throw new Error("Need to open transaction");
        }

        return await FirebirdStatement.prepare(this, sql);
    }

    public async executeQuery(sql: string, params?: any[] | INamedParams): Promise<FirebirdResultSet> {
        if (!this.handler) {
            throw new Error("Need to open transaction");
        }

        const statement = await FirebirdStatement.prepare(this, sql);
        const resultSet = await statement.executeQuery(params);
        resultSet.disposeStatementOnClose = true;
        return resultSet;
    }

    public async execute(sql: string, params?: any[] | INamedParams): Promise<void> {
        if (!this.handler) {
            throw new Error("Need to open transaction");
        }

        await FirebirdTransaction.executePrepareStatement(this, sql, (statement) => statement.execute(params));
    }

    private async closeChildren(): Promise<void> {
        if (this.statements.size) {
            console.warn("Not all statements disposed, they will be disposed");
        }
        await Promise.all(Array.from(this.statements).reduceRight((promises, statement) => {
            promises.push(statement.dispose());
            return promises;
        }, [] as Array<Promise<void>>));
    }
}
