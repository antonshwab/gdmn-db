import DatabaseObj from "../ADatabase";
import { DBOptions } from "./FBDatabase";
import FirebirdTransaction from "./FirebirdTransaction";
export default class FirebirdDatabase extends DatabaseObj<DBOptions, FirebirdTransaction> {
    private _database;
    connect(options: DBOptions): Promise<void>;
    createTransaction(): Promise<FirebirdTransaction>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
}
