import { DBStructure } from "../DBStructure";
import { Connection } from "./Connection";
import { Transaction } from "./Transaction";
export declare class DBStructureReader {
    /**
     * Read the structure of database.
     *
     * @param {Connection} connection
     * @param {Transaction} transaction
     * @returns {Promise<DBStructure>}
     */
    static readStructure(connection: Connection, transaction?: Transaction): Promise<DBStructure>;
    private static read(connection, transaction);
}
