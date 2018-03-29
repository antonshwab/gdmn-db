import { FirebirdOptions2 } from "./FirebirdDatabase2";
import { FirebirdTransaction2 } from "./FirebirdTransaction2";
import { DBStructure } from "../DBStructure";
export declare class FirebirdDBStructure2 {
    static readStructure(options: FirebirdOptions2): Promise<DBStructure>;
    static readStructure(transaction: FirebirdTransaction2): Promise<DBStructure>;
    private static read(transaction);
}
