import { FirebirdModule } from "./fb/FirebirdModule";
export declare abstract class Factory {
    /**
     * Firebird driver
     *
     * @returns {FirebirdModule}
     */
    static readonly FBModule: FirebirdModule;
}
