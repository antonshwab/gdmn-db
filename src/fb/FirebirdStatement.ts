import {MessageMetadata, Statement} from "node-firebird-native-api";
import {AStatement} from "../AStatement";
import {INamedParams} from "../ATransaction";
import {DefaultParamsAnalyzer} from "../default/DefaultParamsAnalyzer";
import {FirebirdBlob} from "./FirebirdBlob";
import {FirebirdResultSet} from "./FirebirdResultSet";
import {FirebirdTransaction} from "./FirebirdTransaction";
import {createDescriptors, dataWrite, fixMetadata, IDescriptor} from "./utils/fb-utils";

export interface IStatmentSource {
    handler: Statement;
    inMetadata: MessageMetadata;
    outMetadata: MessageMetadata;
    inDescriptors: IDescriptor[];
    outDescriptors: IDescriptor[];
}

export class FirebirdStatement extends AStatement<FirebirdBlob, FirebirdResultSet> {

    public readonly parent: FirebirdTransaction;
    public resultSets = new Set<FirebirdResultSet>();
    public source?: IStatmentSource;
    private readonly _paramsAnalyzer: DefaultParamsAnalyzer;

    protected constructor(parent: FirebirdTransaction,
                          paramsAnalyzer: DefaultParamsAnalyzer,
                          source?: IStatmentSource) {
        super();
        this.parent = parent;
        this._paramsAnalyzer = paramsAnalyzer;
        this.source = source;

        parent.statements.add(this);
    }

    public static async prepare(transaction: FirebirdTransaction,
                                sql: string): Promise<FirebirdStatement> {
        const paramsAnalyzer = new DefaultParamsAnalyzer(sql, FirebirdTransaction.EXCLUDE_PATTERNS,
            FirebirdTransaction.PLACEHOLDER_PATTERN);
        const source: IStatmentSource = await transaction.parent.context.statusAction(async (status) => {
            const handler = await transaction.parent.handler!.prepareAsync(status, transaction.handler,
                0, paramsAnalyzer.sql, 3, Statement.PREPARE_PREFETCH_ALL);

            const inMetadata = fixMetadata(status, await handler!.getInputMetadataAsync(status))!;
            const outMetadata = fixMetadata(status, await handler!.getOutputMetadataAsync(status))!;
            const inDescriptors = createDescriptors(status, inMetadata);
            const outDescriptors = createDescriptors(status, outMetadata);

            return {
                handler: handler!,
                inMetadata,
                outMetadata,
                inDescriptors,
                outDescriptors
            };
        });

        return new FirebirdStatement(transaction, paramsAnalyzer, source);
    }

    public async dispose(): Promise<void> {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }

        await this._closeChildren();

        this.source.inMetadata.releaseSync();
        this.source.outMetadata.releaseSync();
        await this.parent.parent.context.statusAction((status) => this.source!.handler.freeAsync(status));
        this.source = undefined;
        this.parent.statements.delete(this);
    }

    public async execute(params?: any[] | INamedParams): Promise<void> {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }

        await this.parent.parent.context.statusAction(async (status) => {
            const inBuffer = new Uint8Array(this.source!.inMetadata.getMessageLengthSync(status));

            await dataWrite(this, this.source!.inDescriptors, inBuffer, this._paramsAnalyzer.prepareParams(params));

            const newTransaction = await this.source!.handler.executeAsync(status, this.parent.handler,
                this.source!.inMetadata, inBuffer, this.source!.outMetadata, undefined);

            if (newTransaction && this.parent.handler !== newTransaction) {
                //// FIXME: newTransaction.releaseSync();
            }
        });
    }

    public async executeQuery(params?: any[] | INamedParams): Promise<FirebirdResultSet> {
        if (!this.source) {
            throw new Error("Statement already disposed");
        }

        return FirebirdResultSet.open(this, this._paramsAnalyzer.prepareParams(params));
    }

    private async _closeChildren(): Promise<void> {
        if (this.resultSets.size) {
            console.warn("Not all resultSets closed, they will be closed");
        }

        await Promise.all(Array.from(this.resultSets).reduceRight((promises, resultSet) => {
            resultSet.disposeStatementOnClose = false;
            promises.push(resultSet.close());
            return promises;
        }, [] as Array<Promise<void>>));
    }
}
