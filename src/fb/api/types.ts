/* tslint:disable */

/** ConnectOptions interface. */
export interface ConnectOptions {
    /** User name. */
    username?: string;

    /** User password. */
    password?: string;
}

/** TransactionIsolation enum */
export enum TransactionIsolation {
    CONSISTENCY = "CONSISTENCY",
    READ_COMMITTED = "READ_COMMITTED",
    SNAPSHOT = "SNAPSHOT"
}

/** TransactionOptions interface. */
export interface TransactionOptions {
    isolation?: TransactionIsolation;
    readCommittedMode?: "NO_RECORD_VERSION" | "RECORD_VERSION";
    accessMode?: "READ_ONLY" | "READ_WRITE";
    waitMode?: "NO_WAIT" | "WAIT";
    noAutoUndo?: boolean;
    ignoreLimbo?: boolean;
    restartRequests?: boolean;
    autoCommit?: boolean;
    //// TODO: lockTimeOut?: number;
}

/* tslint:enable */
