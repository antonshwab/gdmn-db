import { DBStructure } from "../dbStructure/DBStructure";
import { FirebirdOptions } from "./FirebirdDatabase";
import { FirebirdTransaction } from "./FirebirdTransaction";
export declare class FirebirdDBStructure {
    /**
     * Execute database connection, execute transaction and read the structure of database.
     *
     * @param {FirebirdOptions} options
     * @returns {Promise<DBStructure>}
     */
    static readStructure(options: FirebirdOptions): Promise<DBStructure>;
    /**
     * Read the structure of database.
     *
     * @param {FirebirdTransaction} transaction
     * @returns {Promise<DBStructure>}
     */
    static readStructure(transaction: FirebirdTransaction): Promise<DBStructure>;
    private static read(transaction);
}
