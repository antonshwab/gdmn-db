import { FirebirdDriver } from "./fb/FirebirdDriver";
export declare abstract class Factory {
    /**
     * Firebird driver
     *
     * @returns {FirebirdDriver}
     */
    static readonly FBDriver: FirebirdDriver;
}
