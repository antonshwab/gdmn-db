import ADatabase from "../ADatabase";
import { DBOptions } from "./FBDatabase";
import FirebirdTransaction from "./FirebirdTransaction";
export { DBOptions };
export default class FirebirdDatabase extends ADatabase<DBOptions, FirebirdTransaction> {
    private _database;
    connect(options: DBOptions): Promise<void>;
    createTransaction(): Promise<FirebirdTransaction>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
}
