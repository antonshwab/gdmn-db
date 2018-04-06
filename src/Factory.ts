import {FirebirdDriver} from "./fb/FirebirdDriver";

export abstract class Factory {

    /**
     * Firebird driver
     *
     * @returns {FirebirdDriver}
     */
    static get FBDriver(): FirebirdDriver {
        return new FirebirdDriver();
    }
}
