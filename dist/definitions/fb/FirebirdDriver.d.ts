import { AConnection } from "../AConnection";
import { ADriver } from "../ADriver";
import { DBStructure } from "../DBStructure";
import { FirebirdTransaction } from "./FirebirdTransaction";
export declare class FirebirdDriver extends ADriver {
    readDBStructure(transaction: FirebirdTransaction): Promise<DBStructure>;
    newConnection(): AConnection;
}
