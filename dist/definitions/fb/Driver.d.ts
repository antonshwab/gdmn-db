import { AConnection } from "../AConnection";
import { ADriver } from "../ADriver";
import { DBStructure } from "../DBStructure";
import { Connection } from "./Connection";
import { Service } from "./Service";
import { Transaction } from "./Transaction";
export declare class Driver extends ADriver {
    readDBStructure(connection: Connection, transaction: Transaction): Promise<DBStructure>;
    newConnection(): AConnection;
    newService(): Service;
}
