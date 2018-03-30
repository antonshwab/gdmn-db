import { AConnectionPool } from "../AConnectionPool";
import { FirebirdTransaction2 } from "./FirebirdTransaction2";
import { FirebirdResultSet2 } from "./FirebirdResultSet2";
import { FirebirdDatabase2, FirebirdOptions2 } from "./FirebirdDatabase2";
export declare class FirebirdConnectionPool2 extends AConnectionPool<FirebirdOptions2, FirebirdResultSet2, FirebirdTransaction2, FirebirdDatabase2> {
    private static EVENT_RELEASE;
    private _event;
    private _connectionPool;
    isCreated(): Promise<boolean>;
    get(): Promise<FirebirdDatabase2>;
    create(options: FirebirdOptions2, maxConnections?: number): Promise<void>;
    destroy(): Promise<void>;
    private createAndUseConnection();
    private useReleasedConnection();
}
