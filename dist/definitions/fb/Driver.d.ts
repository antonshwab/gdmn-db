import { AConnection } from "../AConnection";
import { ADriver } from "../ADriver";
import { DBStructure } from "../DBStructure";
import { Connection } from "./Connection";
import { Transaction } from "./Transaction";
import { Service } from "./Service";
export declare class Driver extends ADriver {
    readDBStructure(connection: Connection, transaction: Transaction): Promise<DBStructure>;
    newConnection(): AConnection;
    newService(): Service;
}
