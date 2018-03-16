import { FirebirdOptions } from "./FirebirdDatabase";
import { FirebirdTransaction } from "./FirebirdTransaction";
import { DBStructure } from "../DBStructure";
export declare class FirebirdDBStructure {
    static readStructure(options: FirebirdOptions): Promise<DBStructure>;
    static readStructure(transaction: FirebirdTransaction): Promise<DBStructure>;
    private static read(transaction);
}
