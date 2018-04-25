import { MessageMetadata, Statement } from "node-firebird-native-api";
import { AStatement } from "../AStatement";
import { INamedParams } from "../ATransaction";
import { DefaultParamsAnalyzer } from "../default/DefaultParamsAnalyzer";
import { FirebirdBlob } from "./FirebirdBlob";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { FirebirdTransaction } from "./FirebirdTransaction";
import { IDescriptor } from "./utils/fb-utils";
export interface IStatmentSource {
    handler: Statement;
    inMetadata: MessageMetadata;
    outMetadata: MessageMetadata;
    inDescriptors: IDescriptor[];
    outDescriptors: IDescriptor[];
}
export declare class FirebirdStatement extends AStatement<FirebirdBlob, FirebirdResultSet> {
    readonly parent: FirebirdTransaction;
    resultSets: Set<FirebirdResultSet>;
    source?: IStatmentSource;
    private readonly _paramsAnalyzer;
    protected constructor(parent: FirebirdTransaction, paramsAnalyzer: DefaultParamsAnalyzer, source?: IStatmentSource);
    static prepare(transaction: FirebirdTransaction, sql: string): Promise<FirebirdStatement>;
    dispose(): Promise<void>;
    execute(params?: any[] | INamedParams): Promise<void>;
    executeQuery(params?: any[] | INamedParams): Promise<FirebirdResultSet>;
    private _closeChildren();
}
